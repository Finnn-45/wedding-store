import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkoutService,
  parseCheckoutInput,
} from "@/lib/services/checkout-service";

/** Largest checkout body we are willing to parse — a valid one is <1 KB. */
const MAX_BODY_BYTES = 16_384;
/** Per-IP budget: generous for humans, useless for spam bots. */
const CHECKOUT_RATE = { max: 30, windowMs: 10 * 60_000 };


function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * POST /api/checkout — creates an order server-side (§6, §9).
 *
 * The request carries customer details plus { slug, quantity } lines only.
 * Products, prices, the subtotal and the order status are all resolved and
 * decided here; nothing the browser says about money is trusted.
 */
export async function POST(request: Request) {
  // Abuse control first: everything below costs disk or CPU.
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`checkout:${clientIp}`, CHECKOUT_RATE);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, code: "invalid_request" }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, code: "invalid_request" }, 400);
  }

  const input = parseCheckoutInput(body);
  if (!input) {
    return jsonResponse({ ok: false, code: "invalid_request" }, 400);
  }

  const result = await checkoutService.placeOrder(input);

  if (!result.ok) {
    // Generic codes only — no internal details leave the server (§13).
    return jsonResponse(
      result,
      result.code === "server_error" ? 500 : 400,
    );
  }

  const { order, accessUrl, accessUrls } = result;

  // The access URLs are CREDENTIALS. They are returned exactly once, to the
  // buyer, with no-store caching so no shared cache or history keeps them.
  return jsonResponse(
    {
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        currency: order.currency,
        itemCount: order.items.reduce(
          (total, item) => total + item.quantity,
          0,
        ),
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      },
      accessUrl,
      accessUrls,
    },
    200,
  );
}
