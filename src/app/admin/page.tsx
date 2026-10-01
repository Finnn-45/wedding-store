import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getAdminStats, money } from "@/lib/admin/queries";
import { formatOrderDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/** Small stat cell. Server-rendered, no chart library yet. */
function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-line bg-shell p-5">
      <span className="text-eyebrow uppercase text-stone">{label}</span>
      <span className="font-serif text-title tabular-nums">{value}</span>
      {hint ? <span className="text-body-sm text-stone">{hint}</span> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Dashboard
        </h1>
        <p className="mt-3 max-w-xl text-body text-stone">
          Storefront, orders and delivery at a glance.
        </p>
      </div>

      {stats.mockMode ? (
        <p className="border border-line bg-cream/40 px-4 py-3 text-body-sm text-stone">
          Supabase is not configured, so these figures come from the local
          catalogue and there are no live orders. Add the credentials to{" "}
          <code>.env.local</code> and run the migration to switch the admin area
          to real data.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Revenue (paid)"
          value={money(stats.revenue)}
          hint="Paid orders only"
        />
        <Stat
          label="Orders"
          value={String(stats.totalOrders)}
          hint={`${stats.paidOrders} paid · ${stats.pendingOrders} pending`}
        />
        <Stat
          label="Products"
          value={String(stats.totalProducts)}
          hint={`${stats.publishedProducts} published`}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-eyebrow uppercase text-stone">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-body-sm text-ink underline decoration-line underline-offset-4"
          >
            All orders
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="border border-line bg-shell p-6 text-body-sm text-stone">
            No orders yet. They will appear here as soon as the first purchase
            completes.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {stats.recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-serif text-title-sm underline decoration-line underline-offset-4"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-body-sm text-stone">
                    {order.customerName} · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:shrink-0">
                  <span className="text-eyebrow uppercase text-stone">
                    {order.status}
                  </span>
                  <span className="tabular-nums text-body">
                    {money(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-eyebrow uppercase text-stone">Recent products</h2>
          <Link
            href="/admin/products"
            className="text-body-sm text-ink underline decoration-line underline-offset-4"
          >
            Manage products
          </Link>
        </div>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {stats.recentProducts.map((product) => (
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
                <p className="text-body-sm text-stone">
                  {product.type} · updated {formatOrderDate(product.updatedAt)}
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
                    No delivery asset
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div>
        <Button href="/admin/products/new" size="lg">
          Add a product
        </Button>
      </div>
    </div>
  );
}