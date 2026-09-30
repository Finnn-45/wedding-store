/**
 * Minimal fixed-window rate limiter — server-only, in-memory, dependency-free.
 *
 * Suits the mock storefront (a single `next start` process): it bounds how
 * often one client can hit a write endpoint. It is NOT a substitute for
 * infrastructure-level rate limiting — when the store moves to production
 * hosting, keep this call site or swap it for an edge/WAF limiter.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Records one hit against `key` and reports whether it is still inside the
 * budget of `max` hits per `windowMs` milliseconds.
 */
export function rateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= max) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      ),
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
