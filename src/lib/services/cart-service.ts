import { allProducts, type Product } from "@/data/products";
import type { CartLine } from "@/lib/cart-store";

export type ResolvedCartLine = {
  product: Product;
  quantity: number;
  /** Chosen option value (one group per product), or null when none. */
  option: string | null;
  /** Catalogue price delta for that choice — display only, never trusted. */
  optionDelta: number;
};

/**
 * Cart display service — the single place where browser cart lines meet the
 * published catalogue.
 *
 * SECURITY: localStorage is a client-side convenience only. It stores product
 * ids, quantities and option VALUES; it never stores or decides a price. The
 * delta shown here is resolved from the catalogue for display — the server
 * re-resolves product, option, price, discount and total from its own
 * catalogue at checkout (see `checkout-service.ts`).
 */
export function resolveCartLines(
  lines: readonly CartLine[],
): ResolvedCartLine[] {
  return lines.flatMap((line): ResolvedCartLine[] => {
    const product = allProducts.find((entry) => entry.id === line.productId);
    // Unknown ids (old catalogues, hand-edited storage) are dropped.
    if (!product) return [];

    const wanted = line.option ?? null;
    if (!wanted) {
      return [{ product, quantity: line.quantity, option: null, optionDelta: 0 }];
    }

    const group = product.options ?? null;
    const choice =
      group?.choices.find((entry) => entry.name === wanted) ??
      group?.choices.find(
        (entry) => entry.name.toLowerCase() === wanted.toLowerCase(),
      );
    // A choice the catalogue no longer offers is dropped like an unknown id —
    // the server would reject it at checkout anyway.
    if (!group || !choice) return [];
    return [
      {
        product,
        quantity: line.quantity,
        option: choice.name,
        optionDelta: choice.priceDelta,
      },
    ];
  });
}

/** Display-only subtotal. Never treated as authoritative. */
export function cartSubtotal(lines: readonly ResolvedCartLine[]): number {
  return lines.reduce(
    (total, line) =>
      total + (line.product.price + line.optionDelta) * line.quantity,
    0,
  );
}

/** Total item count (quantities summed) for badges and summaries. */
export function cartItemCount(lines: readonly ResolvedCartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
