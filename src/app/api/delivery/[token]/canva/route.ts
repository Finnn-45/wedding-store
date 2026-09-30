/**
 * GET /api/delivery/[token]/canva — token-gated redirect to the Canva template.
 *
 * SECURITY: the real Canva URL lives in `src/lib/private/delivery-assets.ts`
 * and is NEVER rendered into HTML, JSON or metadata. The browser only ever
 * sees this route; the server re-verifies the token on every request and then
 * redirects. A token that fails verification gets a 403 with no detail.
 */
import { rateLimit } from "@/lib/rate-limit";
import { purchaseAccessService } from "@/lib/services/purchase-access-service";

/** Per-IP budget: a handful of redirs is plenty for a human. */
const DELIVERY_RATE = { max: 60, windowMs: 10 * 60_000 };

export async function GET(
  request: Request,
  context: RouteContext<"/api/delivery/[token]/canva">,
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`delivery:${clientIp}`, DELIVERY_RATE);
  if (!limit.ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const { token } = await context.params;
  const url = await purchaseAccessService.getCanvaTemplateAccess(token);

  if (!url) {
    return new Response("This purchase access link is not valid.", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // 302 so the destination is never cached as our content.
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      // Keep the credential out of the destination's referrer.
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store, private",
    },
  });
}
