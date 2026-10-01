import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile, ProfileRole } from "@/lib/supabase/types";

/**
 * Server-side authorization helpers.
 *
 * THE RULE: authentication is not authorization. Every admin operation must
 * resolve the caller's session AND their profile role, server-side. We never
 * trust localStorage, client state, hidden UI, a URL parameter or a role value
 * supplied by the browser.
 *
 * `cache()` deduplicates the session lookup within a single render pass, so
 * calling `requireAdmin()` in a page and again in a Server Action costs one
 * round trip, not two.
 */

export type AuthedUser = {
  id: string;
  email: string | null;
};

export type Session = {
  user: AuthedUser;
  profile: Profile | null;
  role: ProfileRole;
  isAdmin: boolean;
};

const EMPTY_SESSION: Session = {
  user: { id: "", email: null },
  profile: null,
  role: "customer",
  isAdmin: false,
};

/**
 * The current session, or a signed-out session.
 * Never throws: pages decide what to do with it.
 */
export const getSession = cache(async (): Promise<Session> => {
  if (!isSupabaseConfigured()) return EMPTY_SESSION;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return EMPTY_SESSION;

    // The profile row is created by a database trigger on signup. A missing
    // row is treated as "customer with no profile", never as admin.
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    const role: ProfileRole = profile?.role === "admin" ? "admin" : "customer";

    return {
      user: { id: user.id, email: user.email ?? null },
      profile: profile ?? null,
      role,
      isAdmin: role === "admin",
    };
  } catch (error) {
    // A database outage must not silently elevate anyone.
    console.error("[auth] session lookup failed:", error);
    return EMPTY_SESSION;
  }
});

/** The signed-in user id, or null. */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getSession();
  return session.user.id || null;
}

/** Throws/redirects unless there is a session. */
export async function requireUser(returnTo = "/account"): Promise<AuthedUser> {
  const session = await getSession();
  if (!session.user.id) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return session.user;
}

/**
 * Requires an admin. Three checks, in order: authenticated, profile exists,
 * role === "admin". A non-admin is redirected to sign-in (and a signed-in
 * non-admin is bounced away from /admin) rather than shown an error page that
 * confirms the route exists.
 */
export async function requireAdmin(): Promise<Session> {
  if (!isSupabaseConfigured()) {
    // No credentials: the admin area cannot be reached at all. This is the
    // safe failure mode - a misconfigured deploy exposes no admin surface.
    redirect("/admin/login?error=not-configured");
  }

  const session = await getSession();
  if (!session.user.id) {
    redirect(`/admin/login?next=${encodeURIComponent("/admin")}`);
  }
  if (!session.isAdmin) {
    redirect("/account?error=forbidden");
  }
  return session;
}

/**
 * Ownership check for a customer order.
 *
 * Server-side only: it loads the order with the service-role client and then
 * compares `user_id` here. The UI never gets to decide this.
 */
export async function requireOrderAccess(
  orderId: string,
  userId: string,
  isAdmin: boolean,
): Promise<boolean> {
  if (isAdmin) return true;
  if (!userId) return false;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .maybeSingle<{ id: string; user_id: string | null }>();

  if (error || !data) return false;
  return data.user_id === userId;
}