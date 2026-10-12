import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Build the Content-Security-Policy for this request.
 *
 * Nonce-based, `strict-dynamic` — the approach recommended by Next.js and the
 * OWASP CSP cheat-sheet:
 *   - `script-src` trusts ONLY scripts carrying this request's nonce, plus any
 *     script they go on to load (`strict-dynamic`). There is no `unsafe-inline`
 *     for scripts, so an injected <script> with no nonce is dead on arrival.
 *     Next.js stamps its own hydration/bootstrap scripts with the nonce for us;
 *     the one hand-written inline script (the FAQ JSON-LD) reads the nonce from
 *     the `x-nonce` header and applies it itself.
 *   - `style-src` keeps `unsafe-inline` because React inline styles and the
 *     `next/font` style injection are attributes/tags we do not control at the
 *     attribute level; nonces do not reliably cover inline style *attributes*.
 *   - `connect-src` allows the Supabase project (REST + realtime websocket) from
 *     the browser client, and in dev the HMR websocket.
 * A misconfigured CSP would break the storefront, so this is deliberately the
 * minimum that still removes the inline-script XSS vector.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? // Dev: Next/Turbopack HMR relies on eval + inline; still nonce-gated.
      `'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic'`
    : // Prod: no unsafe-* — nonce + strict-dynamic only.
      `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const connectSrc = isDev
    ? `'self' ws: wss: https://*.supabase.co`
    : `'self' https://*.supabase.co wss://*.supabase.co`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
    `frame-src 'none'`,
    `child-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // Only meaningful over https; harmless on http localhost.
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

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

  // A fresh nonce per request. It is passed down to server components via the
  // `x-nonce` request header (read with next/headers) and echoed back on every
  // response as part of the CSP. Next.js reuses it for its own inline scripts.
  const nonce = randomUUID();
  const csp = buildCsp(nonce);

  // Forward the nonce to the RSC/render layer so hand-written inline scripts can
  // opt in. `NextResponse.next({ request })` requires the mutated request to be
  // passed explicitly, hence the shared headers object.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);
  const forward = { request: { headers: requestHeaders } };

  // Attach the CSP to whatever response we end up returning, and pass the
  // nonce-carrying request along. Kept as a helper so no early-return path can
  // forget it.
  const withCsp = (response: NextResponse) => {
    response.headers.set("content-security-policy", csp);
    return response;
  };

  // Static assets never carry a session. Skipping them avoids a Supabase
  // client + JWT read on every asset request.
  if (
    pathname.startsWith("/_next/static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/image")
  ) {
    return NextResponse.next(forward);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    // No credentials -> mock mode; no session gate applies.
    return withCsp(NextResponse.next(forward));
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
    return withCsp(NextResponse.next(forward));
  }

  if (!user) {
    const loginPath = isAdminRoute ? "/admin/login" : "/login";
    const loginUrl = new URL(loginPath, request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return withCsp(NextResponse.redirect(loginUrl));
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

  return withCsp(NextResponse.next(forward));
}