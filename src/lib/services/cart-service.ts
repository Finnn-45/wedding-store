import { allProducts, type Product } from "@/data/products";
import type { CartLine } from "@/lib/cart-store";

export type ResolvedCartLine = {
  product: Product;
  quantity: number;
};

/**
 * Cart display service — the single place where browser cart lines meet the
 * published catalogue.
 *
 * SECURITY: localStorage is a client-side convenience only. It stores product
 * ids and quantities; it never stores or decides a price. Every total computed
 * here is for display — the server re-resolves product, price, discount and
 * total from its own catalogue at checkout (see `checkout-service.ts`).
 */
export function resolveCartLines(
  lines: readonly CartLine[],
): ResolvedCartLine[] {
  return lines.flatMap((line) => {
    const product = allProducts.find((entry) => entry.id === line.productId);
    // Unknown ids (old catalogues, hand-edited storage) are dropped.
    return product ? [{ product, quantity: line.quantity }] : [];
  });
}

/** Display-only subtotal. Never treated as authoritative. */
export function cartSubtotal(lines: readonly ResolvedCartLine[]): number {
  return lines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
}

/** Total item count (quantities summed) for badges and summaries. */
export function cartItemCount(lines: readonly ResolvedCartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
