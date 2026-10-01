/**
 * Supabase configuration.
 *
 * The app runs in TWO modes:
 *
 *   mock      (default)  no credentials -> local repositories, everything
 *                        works offline. This is what you get on a fresh clone.
 *   supabase             credentials present -> Supabase becomes the source of
 *                        truth for products, orders and purchase access.
 *
 * There is exactly ONE switch (`isSupabaseConfigured`) in
 * `src/lib/repositories/index.ts`, so the two systems can never silently
 * compete: when Supabase is configured it is used, otherwise the mock is.
 *
 * Required .env.local values:
 *   NEXT_PUBLIC_SUPABASE_URL       https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  the anon/publishable key  (browser-safe)
 *   SUPABASE_SERVICE_ROLE_KEY      the service_role key       (SERVER ONLY)
 *
 * SUPABASE_SERVICE_ROLE_KEY must never be prefixed with NEXT_PUBLIC_, never be
 * imported by a client component, and never be returned in any response.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the public (browser-safe) credentials are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** True when the privileged server key is present. */
export function isServiceRoleConfigured(): boolean {
  return Boolean(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const SUPABASE_URL = url ?? "";

/** Browser + server. Uses the anon key and honours RLS. */
export const SUPABASE_ANON_KEY = anonKey ?? "";

/** Server only. Never import this from a component. */
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Storage bucket names, matching the migration. */
export const BUCKETS = {
  public: "blanc-public",
  private: "blanc-private",
} as const;