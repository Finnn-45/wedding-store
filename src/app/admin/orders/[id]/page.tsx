import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderConfirmForm } from "@/components/admin/OrderConfirmForm";
import { getAdminOrder, money } from "@/lib/admin/queries";
import { formatOrderDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/orders"
          className="text-body-sm text-stone underline decoration-line underline-offset-4"
        >
          Orders
        </Link>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          {order.orderNumber}
        </h1>
        <p className="text-body-sm text-stone">
          {formatOrderDate(order.createdAt)} · {order.status}
        </p>
      </div>

      <dl className="grid gap-4 border-y border-line py-6 text-body sm:grid-cols-2">
        {[
          ["Name", order.customerName],
          ["Email", order.customerEmail],
          ["WhatsApp", order.customerWhatsApp],
          ["Items", String(order.itemCount)],
          ["Subtotal", money(order.subtotal)],
          ["Discount", money(order.discount)],
          ["Total", money(order.total)],
        ].map(([term, value]) => (
          <div key={term} className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">{term}</dt>
            <dd className="text-right tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {order.customerNotes ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-eyebrow uppercase text-stone">Customer note</h2>
          <p className="text-body text-stone">{order.customerNotes}</p>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-eyebrow uppercase text-stone">Purchased</h2>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-6 py-3 text-body"
            >
              <span className="min-w-0">
                <span className="block">{item.productName}</span>
                <span className="text-body-sm text-stone">
                  {item.optionLabel && item.optionChoice
                    ? `${item.optionLabel}: ${item.optionChoice} · `
                    : ""}
                  {item.quantity} × {money(item.price)}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">
                {money(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-eyebrow uppercase text-stone">Payment</h2>
        {order.status === "paid" ? (
          <p className="text-body text-stone">
            This order is already paid, so delivery is unlocked for the customer.
          </p>
        ) : (
          <OrderConfirmForm orderId={order.id} />
        )}
      </section>
    </div>
  );
}