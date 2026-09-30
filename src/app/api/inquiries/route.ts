/**
 * POST /api/inquiries — custom design enquiry.
 *
 * A custom design enquiry is NOT a purchase: no payment, no order, no
 * delivery. MOCK ONLY — the submission is logged and nothing is stored or
 * emailed until a real `custom_inquiries` table and notification exist.
 */
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  mockInquiryService,
  parseInquiryInput,
} from "@/lib/services/inquiry-service";

const MAX_BODY_BYTES = 16_384;
const INQUIRY_RATE = { max: 10, windowMs: 10 * 60_000 };

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`inquiry:${clientIp}`, INQUIRY_RATE);
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
    return NextResponse.json(
      { ok: false, code: "invalid_inquiry" },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_inquiry" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const input = parseInquiryInput(body);
  if (!input) {
    return NextResponse.json(
      { ok: false, code: "invalid_inquiry" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await mockInquiryService.submit(input);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, reference: result.reference, simulated: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
