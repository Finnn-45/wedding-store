"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { useCart, useHydrated } from "@/components/cart/useCart";
import { Button } from "@/components/ui/Button";
import {
  cartSubtotal,
  resolveCartLines,
  type ResolvedCartLine,
} from "@/lib/services/cart-service";

type PaymentInstructions = {
  method: string | null;
  account: string | null;
  accountName: string | null;
  whatsapp: string | null;
  supportEmail: string;
};

type CheckoutResponse = {
  ok?: boolean;
  code?: string;
  order?: {
    orderNumber: string;
    status: string;
    subtotal?: number;
    discount?: number;
    total: number;
  };
  /** Order placed but not paid yet — manual transfer awaiting confirmation. */
  requiresPayment?: boolean;
  /** Transfer details for the pending confirmation screen. */
  payment?: PaymentInstructions | null;
  /** Server-issued purchase access URLs, one per purchased product. */
  accessUrls?: { url: string }[];
};

/** 16px on purpose: anything smaller makes iOS Safari zoom on focus. */
const fieldClasses =
  "w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-stone-soft focus:border-ink disabled:opacity-50";

const labelClasses = "text-body-sm text-stone";

export function CheckoutView() {
  const { lines, count, clear } = useCart();
  const hydrated = useHydrated();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set after a manual-payment order is placed; renders the pending screen. */
  const [placed, setPlaced] = useState<CheckoutResponse | null>(null);

  // Display-only: lines resolved from the catalogue in the browser. The server
  // recomputes product, price, discount and total itself.
  const items: ResolvedCartLine[] = resolveCartLines(lines);
  const subtotal = cartSubtotal(items);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const couponCode = String(data.get("couponCode") ?? "").trim();
    setSubmitting(true);
    setError(null);

    try {
      // Identity only — productId + quantity. No price, no total, no status:
      // the server resolves all of them from its own catalogue.
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: String(data.get("name") ?? "").trim(),
            email: String(data.get("email") ?? "").trim(),
            whatsapp: String(data.get("whatsapp") ?? "").trim(),
            notes: String(data.get("notes") ?? "").trim(),
          },
          items: items.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
            // Identity only — the server re-resolves label and price delta.
            ...(line.option ? { option: line.option } : {}),
          })),
          // Code is validated server-side against the coupons table.
          ...(couponCode ? { couponCode } : {}),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | CheckoutResponse
        | null;

      if (!response.ok || !payload?.ok || !payload.order) {
        // Generic message only; details stay in the console / server log.
        console.error("Checkout failed:", response.status, payload);
        setError(
          response.status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : payload?.code === "invalid_coupon"
              ? "That discount code is not valid or has expired."
              : payload?.code === "payments_disabled"
                ? "Checkout is not available right now. Please contact us to place your order."
                : "Something went wrong. Please try again.",
        );
        return;
      }

      clear();
      if (payload.requiresPayment) {
        // Manual payment flow: the order is pending. Render the transfer
        // instructions right here — nothing is granted yet, so we do NOT
        // navigate to the access page (it stays locked until an admin
        // confirms the money arrived).
        setPlaced(payload);
        window.scrollTo({ top: 0 });
        return;
      }
      // The access URL is a credential: it is never stored client-side, only
      // used once to navigate to the server-rendered purchase page.
      const target = payload.accessUrls?.[0]?.url;
      router.push(target ?? "/account/purchases");
    } catch (networkError) {
      console.error("Checkout request failed:", networkError);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hold a neutral shell until the stored cart is readable.
  if (!hydrated) {
    return <div aria-hidden="true" className="h-72 border border-line bg-shell/60" />;
  }

  // Manual payment: the order exists but is pending — show the transfer
  // instructions instead of the form.
  if (placed?.order && placed.requiresPayment) {
    return <PendingPaymentConfirmation response={placed} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 border border-line bg-shell p-10 lg:p-14">
        <p className="font-serif text-title">
          There is nothing to check out yet.
        </p>
        <p className="max-w-md text-body text-stone">
          Add a template to your cart and it will appear here, ready for instant
          digital delivery.
        </p>
        <Button href="/shop" size="lg">
          Browse templates
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20"
    >
      <div className="flex flex-col gap-12">
        <fieldset className="flex flex-col gap-7">
          <legend className="text-eyebrow text-stone uppercase">
            Your details
          </legend>

          <div className="grid gap-7 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClasses}>Full name *</span>
              <input
                name="name"
                required
                autoComplete="name"
                placeholder="Amelia Laurent"
                className={fieldClasses}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClasses}>Email *</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClasses}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClasses}>WhatsApp number *</span>
              <input
                name="whatsapp"
                type="tel"
                inputMode="tel"
                required
                autoComplete="tel"
                placeholder="+628123456789"
                aria-describedby="contact-reason"
                className={fieldClasses}
              />
            </label>

            <div className="flex flex-col justify-end">
              <p id="contact-reason" className="text-body-sm text-stone">
                Your purchase access and delivery information will be sent to
                the contact details above.
              </p>
            </div>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={labelClasses}>Order notes (optional)</span>
              <textarea
                name="notes"
                rows={3}
                maxLength={1000}
                placeholder="Anything we should know about your order?"
                className={`${fieldClasses} resize-y`}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-7" aria-describedby="payment-note">
          <legend className="text-eyebrow text-stone uppercase">
            Payment — bank transfer
          </legend>

          <ol className="flex list-decimal flex-col gap-3 pl-5 text-body text-stone">
            <li>Place your order — nothing is charged online.</li>
            <li>
              Transfer the order total using the details shown on the next
              screen (bank transfer or QRIS).
            </li>
            <li>
              Send us the proof on WhatsApp — we confirm the transfer and your
              files unlock right away.
            </li>
          </ol>

          <p id="payment-note" className="text-body-sm text-stone">
            <strong className="font-medium text-ink">Manual payment.</strong>{" "}
            Your order stays reserved as{" "}
            <em className="text-ink">pending payment</em> until the transfer is
            verified by our team. No card details are collected here, and your
            download link activates the moment payment is confirmed.
          </p>
        </fieldset>
      </div>

      <OrderSummary
        lines={items}
        subtotal={subtotal}
        itemCount={count}
        className="lg:sticky lg:top-28 lg:self-start"
      >
        <ul className="flex flex-col gap-2 border-t border-line pt-6 text-body-sm text-stone">
          <li>Editable Canva template — instant access after payment</li>
          <li>Setup guide PDF included</li>
          <li>Access page by email and WhatsApp</li>
          <li>One payment — no subscription, no hidden fees</li>
        </ul>

        <label className="flex flex-col gap-2">
          <span className={labelClasses}>Discount code (optional)</span>
          <input
            name="couponCode"
            maxLength={40}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. WELCOME10"
            className={fieldClasses}
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="border border-line px-4 py-3 text-body-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Placing…" : "Place order"}
        </Button>
      </OrderSummary>
    </form>
  );
}

/**
 * Post-checkout screen for the manual-payment flow: the order exists as
 * "pending" and the buyer needs the transfer details plus a way to send proof.
 * Nothing on this screen grants access — the links stay locked server-side
 * until an admin confirms the order paid.
 */
function PendingPaymentConfirmation({ response }: { response: CheckoutResponse }) {
  const order = response.order;
  const payment = response.payment ?? null;
  const accessUrl = response.accessUrls?.[0]?.url ?? null;

  if (!order) return null;

  const proofMessage = `Hi! I've just placed order ${order.orderNumber} ($${order.total}) — my payment proof for it follows in the next message.`;
  const whatsappHref = payment?.whatsapp
    ? `https://wa.me/${payment.whatsapp}?text=${encodeURIComponent(proofMessage)}`
    : null;
  const emailHref = `mailto:${payment?.supportEmail}?subject=${encodeURIComponent(
    `Payment proof - order ${order.orderNumber}`,
  )}`;

  return (
    <section className="flex flex-col gap-9 py-14 lg:py-20">
      <header className="flex flex-col gap-4">
        <p className="text-eyebrow uppercase text-stone">Order received</p>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Complete your payment
        </h1>
        <p className="text-lead text-stone">
          Order <span className="tabular-nums">{order.orderNumber}</span> is
          reserved for you. Transfer{" "}
          <strong className="text-ink">${order.total}</strong> using the
          details below — your files unlock as soon as we confirm it, usually
          the same day.
        </p>
      </header>

      <div className="flex flex-col gap-5 border border-line bg-shell p-6">
        <h2 className="text-eyebrow uppercase text-stone">How to pay</h2>
        {payment?.method || payment?.account ? (
          <dl className="flex flex-col gap-3 text-body">
            {payment.method ? (
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Method</dt>
                <dd className="text-right">{payment.method}</dd>
              </div>
            ) : null}
            {payment.account ? (
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Account</dt>
                <dd className="text-right tabular-nums">
                  {payment.account}
                  {payment.accountName ? (
                    <span className="block text-body-sm text-stone">
                      a.n. {payment.accountName}
                    </span>
                  ) : null}
                </dd>
              </div>
            ) : null}
            {order.discount ? (
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Discount</dt>
                <dd className="tabular-nums">−${order.discount}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-6">
              <dt className="text-stone">Amount</dt>
              <dd className="tabular-nums">${order.total}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-body text-stone">
            Ask us for the payment details — mention order{" "}
            <span className="tabular-nums">{order.orderNumber}</span> and we
            will send the bank transfer / QRIS information straight away.
          </p>
        )}
        <p className="text-body-sm text-stone">
          After transferring, send the proof on WhatsApp (or email) — an admin
          verifies it and your download link activates automatically.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {whatsappHref ? (
          <Button href={whatsappHref} size="lg">
            Send payment proof on WhatsApp
          </Button>
        ) : (
          <Button href={emailHref} size="lg">
            Email your payment proof
          </Button>
        )}
        <Button href="/account/purchases" variant="outline" size="lg">
          My purchases
        </Button>
      </div>

      {accessUrl ? (
        <div className="flex flex-col gap-3 border-t border-line pt-8">
          <p className="text-eyebrow uppercase text-stone">
            Your personal access link
          </p>
          <p className="text-body-sm text-stone">
            Bookmark it — it opens as soon as your payment is confirmed. You
            can always find it again via My purchases with your email address.
          </p>
          <div>
            <Button href={accessUrl} variant="outline">
              Open your access page
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
