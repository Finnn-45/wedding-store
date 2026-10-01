"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderSummary, type OrderLine } from "@/components/cart/OrderSummary";
import { useCart, useHydrated } from "@/components/cart/useCart";
import { Button } from "@/components/ui/Button";
import {
  cartSubtotal,
  resolveCartLines,
} from "@/lib/services/cart-service";

type CheckoutResponse = {
  ok?: boolean;
  code?: string;
  order?: { orderNumber: string; status: string; total: number };
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

  // Display-only: lines resolved from the catalogue in the browser. The server
  // recomputes product, price, discount and total itself.
  const items: OrderLine[] = resolveCartLines(lines);
  const subtotal = cartSubtotal(items);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
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
          })),
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
            : payload?.code === "payments_disabled"
              ? "Checkout is not available right now. Please contact us to place your order."
              : "Something went wrong. Please try again.",
        );
        return;
      }

      clear();
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
            Payment — test mode
          </legend>

          <div className="grid gap-7 sm:grid-cols-[1.6fr_0.7fr_0.7fr]">
            <label className="flex flex-col gap-2">
              <span className={labelClasses}>Card number</span>
              <input
                disabled
                placeholder="•••• •••• •••• ••••"
                className={fieldClasses}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClasses}>Expiry</span>
              <input disabled placeholder="MM / YY" className={fieldClasses} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClasses}>CVC</span>
              <input disabled placeholder="•••" className={fieldClasses} />
            </label>
          </div>

          <p id="payment-note" className="text-body-sm text-stone">
            <strong className="font-medium text-ink">
              This is a development checkout.
            </strong>{" "}
            No payment provider is connected, no card details are collected and
            nothing is charged. A real gateway (Stripe, Midtrans, Xendit) is
            wired in behind the payment service before go-live.
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
          <li>Editable Canva template, delivered instantly</li>
          <li>Setup guide PDF included</li>
          <li>Access page by email and WhatsApp</li>
          <li>One payment — no subscription, no hidden fees</li>
        </ul>

        {error ? (
          <p
            role="alert"
            className="border border-line px-4 py-3 text-body-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Processing…" : "Complete Purchase"}
        </Button>
      </OrderSummary>
    </form>
  );
}
