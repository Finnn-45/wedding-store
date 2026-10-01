import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOrders, money } from "@/lib/admin/queries";
import { formatOrderDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const statuses = ["all", "pending", "paid", "failed", "cancelled", "refunded"];

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : "all";

  const { orders, total } = await getAdminOrders({ q, status });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Orders
        </h1>
        <p className="mt-2 text-body-sm text-stone">
          {total} {total === 1 ? "order" : "orders"}
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-eyebrow uppercase text-stone">Search</span>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Order number, name, email"
            className="border-b border-line bg-transparent py-2 text-base outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-eyebrow uppercase text-stone">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="border-b border-line bg-transparent py-2 text-base outline-none focus:border-ink"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="border border-ink/20 px-5 py-2.5 text-eyebrow uppercase transition-colors duration-300 hover:border-ink/60"
        >
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="border border-line bg-shell p-6 text-body-sm text-stone">
          No orders match those filters yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Order</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Customer</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">WhatsApp</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Products</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Total</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Status</th>
                <th className="py-3 text-eyebrow uppercase text-stone">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line-soft">
                  <td className="py-4 pr-4 align-top">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-body underline decoration-line underline-offset-4"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className="block text-body">{order.customerName}</span>
                    <span className="block text-body-sm text-stone">
                      {order.customerEmail}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top text-body-sm tabular-nums">
                    {order.customerWhatsApp}
                  </td>
                  <td className="py-4 pr-4 align-top text-body-sm">
                    {order.itemNames || "—"}
                    <span className="block text-stone">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top text-body tabular-nums">
                    {money(order.total)}
                  </td>
                  <td className="py-4 pr-4 align-top text-eyebrow uppercase text-stone">
                    {order.status}
                  </td>
                  <td className="py-4 align-top text-body-sm text-stone">
                    {formatOrderDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}