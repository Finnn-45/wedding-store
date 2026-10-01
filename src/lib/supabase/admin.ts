import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  isServiceRoleConfigured,
} from "@/lib/supabase/config";

/**
 * PRIVILEGED server-only client.
 *
 * SECURITY RULES — this file is the blast radius of the whole application:
 *   1. `import "server-only"` makes any client import a build error.
 *   2. The service-role key BYPASSES RLS. Every query made with this client
 *      must be preceded by an explicit server-side authorization check.
 *   3. The key is read from a non-public env var. It must never be prefixed
 *      with NEXT_PUBLIC_, never logged, never returned in a response, and
 *      never passed to a client component.
 *
 * Use it for: order writes, delivery-asset reads, signed URLs, admin writes
 * and the webhook handler. Use `createClient()` from ./server for reads that
 * should respect the caller's RLS context.
 */
export function createAdminClient() {
  if (!isServiceRoleConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local for " +
        "server-side writes and delivery. Never expose it to the browser.",
    );
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type AdminClient = ReturnType<typeof createAdminClient>;