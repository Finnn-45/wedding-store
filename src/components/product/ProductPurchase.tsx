"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import type { ProductOption } from "@/data/products";

/**
 * Buy box for a product page — Etsy-style option picker plus the two buy
 * buttons. Products WITHOUT options render exactly the buttons they always
 * did; configuring options on the invitation products never changes the
 * rest of the catalogue.
 *
 * The chosen value travels to the cart as identity only: the price delta is
 * re-resolved from the catalogue here for display, and by the server again
 * at checkout.
 */
export function ProductPurchase({
  productId,
  price,
  options,
  className,
}: {
  productId: string;
  price: number;
  options: ProductOption | null;
  className?: string;
}) {
  const [choice, setChoice] = useState(options?.choices[0]?.name ?? "");
  const selected =
    options?.choices.find((entry) => entry.name === choice) ??
    options?.choices[0] ??
    null;
  const unit = price + (selected?.priceDelta ?? 0);

  return (
    <div className={className ?? "flex flex-col gap-3"}>
      {options ? (
        <label className="flex flex-col gap-2">
          <span className="text-eyebrow uppercase text-stone">
            {options.label}
          </span>
          <select
            value={selected?.name ?? ""}
            onChange={(event) => setChoice(event.target.value)}
            className="w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors focus:border-ink"
          >
            {options.choices.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
                {entry.priceDelta ? ` (+$${entry.priceDelta})` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {selected && selected.priceDelta !== 0 ? (
        <p className="text-body-sm text-stone">
          This option: <span className="text-ink tabular-nums">${unit}</span>
        </p>
      ) : null}

      <AddToCartButton
        productId={productId}
        option={selected?.name ?? null}
        className="w-full"
      />
      <AddToCartButton
        productId={productId}
        mode="cart"
        size="lg"
        option={selected?.name ?? null}
        className="w-full"
      />
    </div>
  );
}