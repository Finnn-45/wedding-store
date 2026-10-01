import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getAdminProducts, money } from "@/lib/admin/queries";
import { usingSupabase } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

const types = ["wedding-website", "save-the-date", "bundle", "custom"];

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const status =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";

  const { products, total } = await getAdminProducts({ q, type, status });

  // Plain GET form: filters work with no client JavaScript.
  const queryFor = (next: { type?: string; status?: string }) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (next.type ?? type) search.set("type", next.type ?? type ?? "");
    if (next.status ?? status) search.set("status", next.status ?? status ?? "");
    if (next.status === "all") search.delete("status");
    return `/admin/products?${search.toString()}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
            Products
          </h1>
          <p className="mt-2 text-body-sm text-stone">
            {total} {total === 1 ? "product" : "products"} in the catalogue
          </p>
        </div>
        <Button href="/admin/products/new" size="sm">
          Add a product
        </Button>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-eyebrow uppercase text-stone">Search</span>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name or slug"
            className="border-b border-line bg-transparent py-2 text-base outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-eyebrow uppercase text-stone">Type</span>
          <select
            name="type"
            defaultValue={type ?? ""}
            className="border-b border-line bg-transparent py-2 text-base outline-none focus:border-ink"
          >
            <option value="">All types</option>
            {types.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-eyebrow uppercase text-stone">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="border-b border-line bg-transparent py-2 text-base outline-none focus:border-ink"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
        <Link
          href="/admin/products"
          className="pb-2 text-body-sm text-stone underline decoration-line underline-offset-4"
        >
          Reset
        </Link>
      </form>

      {!usingSupabase ? (
        <p className="border border-line bg-cream/40 px-4 py-3 text-body-sm text-stone">
          Supabase is not configured, so this list is read from the local
          catalogue and editing is disabled.
        </p>
      ) : null}

      {products.length === 0 ? (
        <p className="border border-line bg-shell p-6 text-body-sm text-stone">
          No products match those filters yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-serif text-title-sm underline decoration-line underline-offset-4"
                >
                  {product.name}
                </Link>
                <p className="text-body-sm text-stone">
                  {product.type} · {money(product.price)} · /{product.slug}
                </p>
              </div>
              <div className="flex items-center gap-4 sm:shrink-0">
                <span className="text-eyebrow uppercase text-stone">
                  {product.published ? "Published" : "Draft"}
                </span>
                {product.hasDelivery ? (
                  <span className="text-eyebrow uppercase text-ink">
                    Delivery ready
                  </span>
                ) : (
                  <span className="text-eyebrow uppercase text-stone-soft">
                    No delivery
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-body-sm text-stone">
        Filtering by <Link href={queryFor({ type: "wedding-website" })} className="underline">type</Link> or{" "}
        <Link href={queryFor({ status: "published" })} className="underline">status</Link>{" "}
        keeps the list server-side.
      </p>
    </div>
  );
}