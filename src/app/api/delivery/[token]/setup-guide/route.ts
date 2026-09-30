/**
 * GET /api/delivery/[token]/setup-guide — token-gated redirect to the setup PDF.
 *
 * The PDF is a purchased asset: in production it is NOT in /public. It lives
 * in private storage and this route issues a short-lived SIGNED URL for a
 * verified purchaser. The mock stores a local path and redirects to it; the
 * structure is the same, so only the last line changes in production.
 */
import { rateLimit } from "@/lib/rate-limit";
import { purchaseAccessService } from "@/lib/services/purchase-access-service";

const DELIVERY_RATE = { max: 60, windowMs: 10 * 60_000 };

export async function GET(
  request: Request,
  context: RouteContext<"/api/delivery/[token]/setup-guide">,
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
  const url = await purchaseAccessService.getSetupGuideAccess(token);

  if (!url) {
    return new Response("This purchase access link is not valid.", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store, private",
    },
  });
}
