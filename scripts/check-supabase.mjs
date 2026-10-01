/**
 * BLANC WEDDINGS — Supabase connection check.
 *
 * Answers one question before you start the app: are the credentials in
 * `.env.local` connected to a real project with the schema in place? Every
 * check is a READ — nothing is written to your project — and no key is ever
 * printed in full, only a masked prefix and its length.
 *
 *   npm run db:check
 *
 * What it checks, in order:
 *   1. `.env.local` exists and holds the three required variables
 *   2. the values are not the placeholders from `.env.example`
 *   3. the URL has the shape https://<project-ref>.supabase.co
 *   4. the publishable / anon key is accepted by the project's Auth
 *   5. the secret / service_role key is accepted by PostgREST
 *   6. the migration has been applied: 9 tables + 2 storage buckets
 *
 * Exit code 0 means the admin area is ready to use; 1 means something is
 * still to fix and the FAIL lines say what.
 *
 * Node 18+ (built-in fetch). `.env.local` is gitignored — never commit it.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const envPath = join(rootDir, ".env.local");
const TIMEOUT_MS = 15_000;

/** Variables the app reads, with the Supabase screen each value comes from. */
const ENV_VARS = [
  ["NEXT_PUBLIC_SUPABASE_URL", "Project URL"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "publishable / anon key"],
  ["SUPABASE_SERVICE_ROLE_KEY", "secret / service_role key"],
];

/** Tables created by supabase/migrations/0001_init.sql. */
const TABLES = [
  "profiles",
  "products",
  "product_images",
  "delivery_assets",
  "orders",
  "order_items",
  "purchase_access",
  "downloads",
  "admin_audit_logs",
];

/** Storage buckets created by the same migration. */
const BUCKETS = ["blanc-public", "blanc-private"];

let failures = 0;

const ok = (message) => console.log(`  OK    ${message}`);
const fail = (message) => {
  failures += 1;
  // Set it here, not only in the summary: early returns bail out before that.
  process.exitCode = 1;
  console.log(`  FAIL  ${message}`);
};
const hint = (message) => console.log(`        ${message}`);
const head = (message) => console.log(`\n${message}`);

/** Identify a key without revealing it (Supabase's own advice: 6 chars max). */
const mask = (value) => `${value.slice(0, 6)}… (${value.length} chars)`;

function keyKind(value) {
  if (value.startsWith("sb_publishable_")) return "publishable key";
  if (value.startsWith("sb_secret_")) return "secret key";
  if (value.startsWith("eyJ")) return "legacy JWT key";
  return "unrecognised format";
}

/** Minimal KEY=VALUE reader: no dotenv dependency, no interpolation. */
function readEnv(path) {
  const env = {};
  const raw = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;
    const eq = text.indexOf("=");
    if (eq < 1) continue;
    const name = text.slice(0, eq).trim();
    let value = text.slice(eq + 1).trim();
    const quoted =
      value.length > 1 &&
      (value.startsWith('"') || value.startsWith("'")) &&
      value.endsWith(value[0]);
    if (quoted) value = value.slice(1, -1);
    env[name] = value;
  }
  return env;
}

/**
 * Publishable and secret keys are NOT JWTs: they travel on `apikey` only.
 * Legacy anon / service_role JWTs additionally go on Authorization.
 */
function headers(key) {
  const result = { apikey: key };
  if (key.startsWith("eyJ")) result.Authorization = `Bearer ${key}`;
  return result;
}

async function get(url, key) {
  return fetch(url, {
    headers: headers(key),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/** Human-readable reason a fetch threw (DNS, refused, timeout). */
function why(error) {
  if (error?.name === "TimeoutError") return "timed out";
  if (error?.cause?.code) return error.cause.code;
  return error?.message ?? "unknown error";
}

async function main() {
  head("BLANC WEDDINGS — Supabase connection check");

  let env;
  try {
    env = readEnv(envPath);
    ok(`.env.local found (${Object.keys(env).length} variables)`);
  } catch {
    fail(".env.local not found in the project root");
    hint("Create the file next to package.json; it is gitignored, so it stays on your machine.");
    hint("The Supabase dashboard's Connect dialog (top bar) hands you the URL and the keys,");
    hint("or copy the three names from .env.example and paste the values in.");
    hint("Then run: npm run db:check");
    return;
  }

  const missing = ENV_VARS.filter(([name]) => !env[name]);
  if (missing.length > 0) {
    for (const [name, what] of missing) fail(`${name} is not set (${what})`);
    return;
  }
  ok("all three variables are present");

  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const secretKey = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const values = url + anonKey + secretKey;

  console.log(`        URL        : ${url}`);
  console.log(`        anon key   : ${keyKind(anonKey)} — ${mask(anonKey)}`);
  console.log(`        secret key : ${keyKind(secretKey)} — ${mask(secretKey)}`);

  if (/\/(rest|auth|storage)\/v1/.test(url)) {
    fail("the URL must be the bare project URL, without /rest/v1 or /auth/v1");
    return;
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(url)) {
    fail("the URL does not look like a Supabase project URL");
    hint("Expected the shape https://<project-ref>.supabase.co");
    return;
  }
  if (/your-project|placeholder|example\.com/i.test(values) || /your-/i.test(anonKey + secretKey)) {
    fail("the file still holds the placeholder values from .env.example");
    hint("Do not half-fill it: the moment the two public values exist the app leaves mock mode.");
    hint("Either real values, or delete the file and keep working on the mock.");
    return;
  }
  if (secretKey.startsWith("sb_publishable_")) {
    fail("SUPABASE_SERVICE_ROLE_KEY holds a publishable key — it needs the secret / service_role key");
  }
  if (anonKey.startsWith("sb_secret_")) {
    fail("NEXT_PUBLIC_SUPABASE_ANON_KEY holds a secret key — that must never reach the browser");
  }

  head("1. Publishable (anon) key — what the browser and RLS use");
  let mailerAutoconfirm = null;
  try {
    const res = await get(`${url}/auth/v1/settings`, anonKey);
    if (res.status === 200) {
      const settings = await res.json().catch(() => null);
      mailerAutoconfirm = settings?.mailer_autoconfirm ?? null;
      ok("accepted by the project (Auth reachable)");
    } else {
      fail(`rejected with HTTP ${res.status} — wrong, truncated, or from another project`);
    }
  } catch (error) {
    fail(`no answer from ${url} (${why(error)})`);
    hint("Free projects pause after a week of inactivity: restore it in the dashboard first.");
  }

  head("2. Secret (service_role) key — server-only writes and delivery");
  let secretWorks = false;
  try {
    const res = await get(`${url}/rest/v1/profiles?select=id&limit=1`, secretKey);
    if (res.status === 200 || res.status === 404) {
      // 404 means the key was accepted but the table is absent: migration not run.
      secretWorks = true;
      ok("accepted by PostgREST");
    } else if (res.status === 401 || res.status === 403) {
      fail(`rejected with HTTP ${res.status} — wrong value for the secret / service_role key`);
    } else {
      fail(`unexpected HTTP ${res.status} from PostgREST`);
    }
  } catch (error) {
    fail(`no answer from PostgREST (${why(error)})`);
  }

  head("3. Schema — paste supabase/migrations/0001_init.sql if this fails");
  if (!secretWorks) {
    fail("skipped: the secret key has to work first");
  } else {
    const absent = [];
    for (const table of TABLES) {
      try {
        const res = await get(`${url}/rest/v1/${table}?select=*&limit=1`, secretKey);
        if (res.status !== 200) absent.push(`${table} (HTTP ${res.status})`);
      } catch (error) {
        absent.push(`${table} (${why(error)})`);
      }
    }
    if (absent.length === 0) {
      ok(`all ${TABLES.length} tables exist`);
    } else {
      fail(`${absent.length} of ${TABLES.length} tables missing: ${absent.join(", ")}`);
      hint("Supabase -> SQL Editor -> New query -> paste the whole migration file -> Run.");
    }

    try {
      const res = await get(`${url}/storage/v1/bucket`, secretKey);
      if (res.status === 200) {
        const buckets = await res.json();
        const ids = new Set((Array.isArray(buckets) ? buckets : []).map((b) => b.id));
        const missingBuckets = BUCKETS.filter((id) => !ids.has(id));
        if (missingBuckets.length === 0) {
          ok(`storage buckets present: ${BUCKETS.join(", ")}`);
        } else {
          fail(`storage buckets missing: ${missingBuckets.join(", ")}`);
        }
      } else {
        fail(`could not list storage buckets (HTTP ${res.status})`);
      }
    } catch (error) {
      fail(`storage check failed (${why(error)})`);
    }
  }

  head("Summary");
  if (failures > 0) {
    console.log(`  ${failures} check(s) failed — fix the FAIL lines and run npm run db:check again.`);
    console.log("  Until then the app keeps working on the local mock.");
    return;
  }

  console.log("  Connected. The app now reads products, orders and accounts from Supabase.");
  hint("1. Restart the dev server: env vars are read at startup (Ctrl+C, then npm run dev).");
  hint("2. Create the admin user: Authentication -> Users -> Add user (tick Auto Confirm User).");
  hint("3. Promote it in the SQL Editor:");
  hint("   update public.profiles set role = 'admin'");
  hint("   where id = (select id from auth.users where email = 'you@example.com');");
  hint("4. Open http://localhost:3000/admin and sign in.");
  if (mailerAutoconfirm === false) {
    hint("Note: email confirmation is ON, so tick Auto Confirm User when adding users.");
  } else if (mailerAutoconfirm === true) {
    hint("Note: email confirmation is OFF, so new accounts can sign in straight away.");
  }
  hint("The Supabase catalogue starts empty: add products in /admin/products/new.");
}

main().catch((error) => {
  console.error(`\nUnexpected error: ${why(error)}`);
  process.exitCode = 1;
});
