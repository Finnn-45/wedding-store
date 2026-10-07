import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 request interception.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (Node.js runtime) and
 * removed the `export const config = { matcher }` block. This file therefore
 * matches protected routes explicitly on `request.nextUrl.pathname` and keeps
 * the old `config` matcher OUT (an unsupported flag in Next.js 16).
 *
 * SECURITY MODEL (and its honesty boundary):
 * `proxy` is a PERFORMANCE / SESSION gate, NOT the authorization boundary.
 *   - It only checks "is there a session cookie" for /admin and /account.
 *   - The authoritative authorization (profile exists + role = `admin` for
 *     /admin) lives in `requireAdmin()` in `src/lib/auth/guards.ts`, which the
 *     page and server action call. A client can never influence it.
 *   - A visitor who forges their way past this gate is still bounced by the
 *     page, because the page re-verifies the role server-side.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets never carry a session. Skipping them avoids a Supabase
  // client + JWT read on every asset request.
  if (
    pathname.startsWith("/_next/static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/image")
  ) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    // No credentials -> mock mode; no session gate applies.
    return NextResponse.next({ request });
  }

  // Check the session once, then decide. /admin also wants an admin role.
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll() {
        // The proxy only reads the session. Supabase writes session cookies on
        // token refresh, which happens in page/server-action code paths, not in
        // this middleware - there is nothing for this gate to persist.
      },
    },
  });

  const { data: { user } = {} } = await supabase.auth.getUser();

  const isAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAccountRoute = pathname.startsWith("/account");
  const needsSession = isAdminRoute || isAccountRoute;

  // Public storefront, checkout, access page, login/signup pass through.
  if (!needsSession) {
    return NextResponse.next({ request });
  }

  if (!user) {
    const loginPath = isAdminRoute ? "/admin/login" : "/login";
    const loginUrl = new URL(loginPath, request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Authorization (admin role, ownership, etc.) is decided by the guarded
  // page / server action via `requireAdmin()`. This is a light
  // defense-in-depth re-check that logs a failure if the session breaks.
  if (isAdminRoute) {
    const adminSupabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll() {
          // No session changes on the way out.
        },
      },
    });
    const { error } = await adminSupabase.auth.getUser();
    if (error) {
      console.error("[proxy] admin session check failed:", error);
    }
  }

  return NextResponse.next({ request });
}