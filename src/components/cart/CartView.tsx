"use client";

import Image from "next/image";
import Link from "next/link";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { useCart, useHydrated } from "@/components/cart/useCart";
import { Button } from "@/components/ui/Button";
import { typeLabels } from "@/data/products";
import { formatPriceParts } from "@/lib/catalog";
import {
  cartSubtotal,
  resolveCartLines,
  type ResolvedCartLine,
} from "@/lib/services/cart-service";

export function CartView() {
  const { lines, count, remove, update } = useCart();
  const hydrated = useHydrated();

  // Display-only resolution — the server recomputes prices at checkout.
  const items: ResolvedCartLine[] = resolveCartLines(lines);
  const subtotal = cartSubtotal(items);

  if (!hydrated) {
    return (
      <div aria-hidden="true" className="h-72 border border-line bg-shell/60" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 border border-line bg-shell p-10 lg:p-14">
        <p className="font-serif text-title">Your cart is empty.</p>
        <p className="max-w-md text-body text-stone">
          Every template is a complete wedding website, ready to customize and
          publish under your own domain.
        </p>
        <Button href="/shop" size="lg">
          Browse templates
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-20">
      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {items.map(({ product, quantity, option, optionDelta }) => {
          const price = formatPriceParts(product);
          const unit = product.price + (optionDelta ?? 0);
          return (
          <li key={`${product.id}:${option ?? ""}`} className="flex gap-5 py-8">
            <Link
              href={`/templates/${product.slug}`}
              className="w-20 shrink-0 overflow-hidden bg-cream transition-opacity duration-300 hover:opacity-90 sm:w-24"
            >
              <Image
                src={product.coverImage}
                alt={`${product.name} template cover, demo content`}
                width={1200}
                height={1500}
                unoptimized
                sizes="96px"
                className="h-auto w-full"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h2 className="font-serif text-title-sm">
                    <Link
                      href={`/templates/${product.slug}`}
                      className="transition-colors hover:text-stone"
                    >
                      {product.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-body-sm text-stone">
                    {typeLabels[product.type]}
                    {option
                      ? ` · ${product.options?.label ?? "Option"}: ${option}`
                      : ""}
                  </p>

                  <div
                    role="group"
                    aria-label={`Quantity for ${product.name}`}
                    className="mt-2 flex items-center gap-3 text-body-sm text-stone"
                  >
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${product.name}`}
                      disabled={quantity <= 1}
                      onClick={() => update(product.id, quantity - 1, option)}
                      className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors duration-300 hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span aria-live="polite" className="w-4 text-center text-ink tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${product.name}`}
                      onClick={() => update(product.id, quantity + 1, option)}
                      className="flex h-9 w-9 items-center justify-center border border-line text-ink transition-colors duration-300 hover:border-ink"
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                </div>
                <p className="shrink-0 text-body tabular-nums">
                  {price.original && !optionDelta ? (
                    <span className="mr-1.5 text-stone line-through">
                      {price.original}
                    </span>
                  ) : null}
                  {`$${unit}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => remove(product.id, option)}
                className="mt-auto self-start text-body-sm text-stone underline decoration-line underline-offset-4 transition-colors duration-300 hover:text-ink hover:decoration-ink"
              >
                Remove
              </button>
            </div>
          </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary lines={items} subtotal={subtotal} itemCount={count}>
          <Button href="/checkout" size="lg" className="w-full">
            Continue to Checkout
          </Button>
        </OrderSummary>
      </aside>
    </div>
  );
}
