import Image from "next/image";
import type { ReactNode } from "react";
import { typeLabels, type Product } from "@/data/products";
import { formatPriceParts } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export type OrderLine = {
  product: Product;
  quantity: number;
};

type OrderSummaryProps = {
  lines: OrderLine[];
  subtotal: number;
  itemCount: number;
  className?: string;
  /** Call to action (checkout button, continue links). */
  children?: ReactNode;
};

/**
 * Order summary for digital goods: items, delivery note, subtotal.
 * Deliberately has no shipping line — nothing is ever posted.
 */
export function OrderSummary({
  lines,
  subtotal,
  itemCount,
  className,
  children,
}: OrderSummaryProps) {
  return (
    <aside className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-eyebrow text-stone uppercase">Order summary</h2>

      <ul className="flex flex-col gap-5 border-y border-line py-6">
        {lines.map(({ product, quantity }) => {
          const price = formatPriceParts(product);
          return (
            <li key={product.id} className="flex items-start gap-4">
              <Image
                src={product.coverImage}
                alt=""
                width={1200}
                height={1500}
                unoptimized
                sizes="56px"
                className="w-14 shrink-0 bg-cream"
              />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-title-sm">{product.name}</p>
                <p className="mt-0.5 text-body-sm text-stone">
                  {typeLabels[product.type]}
                  {quantity > 1 ? ` · Quantity ${quantity}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-body tabular-nums">{price.current}</p>
            </li>
          );
        })}
      </ul>

      <dl className="flex flex-col gap-3 text-body">
        <div className="flex items-baseline justify-between gap-6">
          <dt className="text-stone">Items</dt>
          <dd className="tabular-nums">{itemCount}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <dt className="text-stone">Delivery</dt>
          <dd className="text-ink">Digital · instant</dd>
        </div>
        <div className="flex items-baseline justify-between gap-6 border-t border-line pt-4">
          <dt className="text-stone">Subtotal</dt>
          <dd className="font-serif text-title tabular-nums">${subtotal}</dd>
        </div>
      </dl>

      {children}

      <p className="text-body-sm text-stone">
        Digital product only — nothing is shipped and no delivery fee is added.
        You receive a Canva template and a setup guide PDF.
      </p>
    </aside>
  );
}
