/**
 * Fixed-window rate limiter — server-only, dependency-free.
 *
 * Two backends, chosen automatically:
 *   - Distributed (Upstash Redis over REST): used when UPSTASH_REDIS_REST_URL
 *     and UPSTASH_REDIS_REST_TOKEN are set. This is the correct choice for
 *     serverless / multi-instance hosting (Vercel, etc.), where an in-memory
 *     counter lives in one isolated process and cannot bound a shared attacker.
 *   - In-memory: the default and the fallback. Bounds a single `next start`
 *     process. If the distributed backend errors, we fall back to this so a
 *     Redis outage never fully removes the limit (it degrades to per-process).
 *
 * This is NOT a substitute for infrastructure-level limiting (WAF / edge); keep
 * the call sites and optionally add an edge limiter in front in production.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/* ------------------------------------------------------------------ */
/* In-memory backend (default + fallback)                             */
/* ------------------------------------------------------------------ */

/**
 * Records one hit against `key` and reports whether it is still inside the
 * budget of `max` hits per `windowMs` milliseconds.
 */
function rateLimitInMemory(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
  now: number,
): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= max) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  // Opportunistic cleanup so the map itself cannot grow without bound.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Distributed backend (Upstash Redis over REST, optional)            */
/* ------------------------------------------------------------------ */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function isDistributedConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

/**
 * Fixed-window counter in Redis via a single pipelined REST call:
 *   INCR key            -> current count in the window
 *   PEXPIRE key ms NX   -> set TTL only on the first hit of a new window
 *   PTTL key            -> remaining ms, for an accurate Retry-After
 * Fails loudly (throws) on any non-2xx so the caller can fall back.
 */
async function rateLimitDistributed(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): Promise<RateLimitResult> {
  const pipeline: [string, ...(string | number)[]][] = [
    ["INCR", key],
    ["PEXPIRE", key, windowMs, "NX"],
    ["PTTL", key],
  ];

  const response = await fetch(UPSTASH_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN as string}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pipeline),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash rate-limit responded ${response.status}`);
  }

  const results = (await response.json()) as { result: number }[];
  const count = Number(results?.[0]?.result ?? 0);
  const ttlMs = Number(results?.[2]?.result ?? -1);

  if (count > max) {
    const retryAfterSeconds =
      ttlMs > 0 ? Math.max(1, Math.ceil(ttlMs / 1000)) : Math.ceil(windowMs / 1000);
    return { ok: false, retryAfterSeconds };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Records one hit against `key`. Async so it can use a distributed backend;
 * callers in route handlers simply `await` it.
 */
export async function rateLimit(
  key: string,
  options: { max: number; windowMs: number },
  now: number = Date.now(),
): Promise<RateLimitResult> {
  if (isDistributedConfigured()) {
    try {
      return await rateLimitDistributed(key, options);
    } catch (error) {
      // Never let a Redis hiccup remove the limit entirely — degrade to the
      // per-process limiter for this hit and log it.
      console.error("[rate-limit] distributed backend failed, using memory:", error);
    }
  }
  return rateLimitInMemory(key, options, now);
}

