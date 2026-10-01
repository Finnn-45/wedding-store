import type { Metadata } from "next";
import { getAdminCustomers, money } from "@/lib/admin/queries";
import { formatOrderDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Customers
        </h1>
        <p className="mt-2 text-body-sm text-stone">
          {customers.length} {customers.length === 1 ? "account" : "accounts"}
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="border border-line bg-shell p-6 text-body-sm text-stone">
          No customer accounts yet. They appear here as soon as someone creates
          one at /signup.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Name</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Email</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">WhatsApp</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Orders</th>
                <th className="py-3 pr-4 text-eyebrow uppercase text-stone">Spend</th>
                <th className="py-3 text-eyebrow uppercase text-stone">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-line-soft">
                  <td className="py-4 pr-4 align-top text-body">
                    {customer.fullName || "—"}
                  </td>
                  <td className="py-4 pr-4 align-top text-body-sm">
                    {customer.email || "—"}
                  </td>
                  <td className="py-4 pr-4 align-top text-body-sm tabular-nums">
                    {customer.whatsapp || "—"}
                  </td>
                  <td className="py-4 pr-4 align-top text-body tabular-nums">
                    {customer.orderCount}
                  </td>
                  <td className="py-4 pr-4 align-top text-body tabular-nums">
                    {money(customer.totalSpend)}
                  </td>
                  <td className="py-4 align-top text-body-sm text-stone">
                    {formatOrderDate(customer.createdAt)}
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