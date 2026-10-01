import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/queries";
import { usingSupabase } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Delivery assets",
  robots: { index: false, follow: false },
};

/**
 * Delivery overview: which products can actually be delivered.
 *
 * This page lists product NAMES and a readiness flag only. The Canva URL and
 * the private PDF path are managed on each product page and are never printed
 * into a list view.
 */
export default async function AdminDeliveryPage() {
  const { products } = await getAdminProducts({ limit: 100 });
  const missing = products.filter((product) => !product.hasDelivery);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Delivery assets
        </h1>
        <p className="mt-2 max-w-xl text-body-sm text-stone">
          Canva template URL and setup guide for each product. Both are private
          and are only resolved server-side after a purchase check.
        </p>
      </div>

      {!usingSupabase ? (
        <p className="border border-line bg-cream/40 px-4 py-3 text-body-sm text-stone">
          Supabase is not configured, so delivery assets cannot be read or
          written yet.
        </p>
      ) : null}

      {missing.length > 0 ? (
        <p className="border border-line bg-shell px-4 py-3 text-body-sm">
          {missing.length} {missing.length === 1 ? "product is" : "products are"}{" "}
          not deliverable yet. A customer who buys one of these gets an order
          but no files.
        </p>
      ) : null}

      {products.length === 0 ? (
        <p className="border border-line bg-shell p-6 text-body-sm text-stone">
          No products yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-serif text-title-sm underline decoration-line underline-offset-4"
                >
                  {product.name}
                </Link>
                <p className="text-body-sm text-stone">{product.type}</p>
              </div>
              <span className="text-eyebrow uppercase sm:shrink-0">
                {product.hasDelivery ? (
                  <span className="text-ink">Ready</span>
                ) : (
                  <span className="text-stone">Not configured</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}