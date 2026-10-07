import type { Metadata } from "next";
import Link from "next/link";
import { OrderLookupForm } from "@/components/account/OrderLookupForm";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { typeLabels } from "@/data/products";
import { formatOrderDate } from "@/lib/format";
import {
  orderRepository,
  productRepository,
  purchaseAccessRepository,
  type Order,
  type PurchaseAccess,
} from "@/lib/repositories";

export const metadata: Metadata = {
  title: "My Purchases",
  description: "Your BLANC WEDDINGS purchases, orders and template access.",
  robots: { index: false, follow: false },
};

function readEmail(
  searchParams: Awaited<PageProps<"/account/purchases">["searchParams"]>,
): string {
  const raw = Array.isArray(searchParams.email)
    ? searchParams.email[0]
    : searchParams.email;
  return raw?.trim() ?? "";
}

/**
 * Purchases = orders + the access link for each paid item.
 *
 * Still no authentication (that arrives with the production auth layer), so
 * the customer identifies themselves by email, exactly as with the order
 * lookup. The repository/service seams are the swap point for a real session.
 */
export default async function PurchasesPage(
  props: PageProps<"/account/purchases">,
) {
  const searchParams = await props.searchParams;
  const email = readEmail(searchParams);

  if (!email) {
    return (
      <section className="py-14 lg:py-20">
        <Container className="max-w-2xl">
          <SectionHeading
            as="h1"
            eyebrow="Your purchases"
            title="My purchases"
            description="Enter the email you checked out with to see every template you own and open its access page."
          />
          <div className="mt-10 border border-line bg-shell p-8 lg:p-10">
            <OrderLookupForm />
          </div>
        </Container>
      </section>
    );
  }

  let orders: Order[];
  try {
    orders = await orderRepository.getByEmail(email);
  } catch (error) {
    console.error("[account/purchases] lookup failed:", error);
    return (
      <section className="py-14 lg:py-20">
        <Container className="max-w-2xl">
          <div className="flex flex-col items-start gap-6 border border-line bg-shell p-10">
            <p className="font-serif text-title">Something went wrong.</p>
            <p className="max-w-md text-body text-stone">
              Please try again in a moment.
            </p>
          </div>
          <div className="mt-10 border border-line bg-shell p-8 lg:p-10">
            <OrderLookupForm />
          </div>
        </Container>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="py-14 lg:py-20">
        <Container className="max-w-2xl">
          <div className="flex flex-col items-start gap-6 border border-line bg-shell p-10">
            <p className="font-serif text-title">No purchases yet.</p>
            <p className="max-w-md text-body text-stone">
              We could not find any orders for {email}.
            </p>
            <Button href="/shop" size="lg">
              Browse templates
            </Button>
          </div>
        </Container>
      </section>
    );
  }


  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-4">
          <Eyebrow>Your purchases</Eyebrow>
          <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
            My purchases
          </h1>
          <p className="text-body text-stone">
            {orders.length} {orders.length === 1 ? "order" : "orders"} for {email}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-12">
          {orders.map((order) => (
            <OrderAccessSection key={order.id} order={order} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href="/shop" variant="outline">
            Browse more templates
          </Button>
          <Link
            href="/faq"
            className="text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
          >
            Read the FAQ
          </Link>
        </div>
      </Container>
    </section>
  );
}

async function OrderAccessSection({ order }: { order: Order }) {
  const access: PurchaseAccess[] =
    await purchaseAccessRepository.getByOrderId(order.id);

  return (
    <section className="border border-line bg-shell p-7 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-serif text-title-sm">Order {order.orderNumber}</p>
          <p className="mt-1 text-body-sm text-stone">
            {formatOrderDate(order.createdAt)} · {order.items.length}{" "}
            {order.items.length === 1 ? "item" : "items"} · ${order.total}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-6 flex flex-col divide-y divide-line">
        {await Promise.all(
          order.items.map(async (item) => {
            const grant = access.find(
              (record) => record.productId === item.productId,
            );
            const product = grant
              ? await productRepository.getById(item.productId).catch(() => null)
              : null;

            return (
              <li
                key={`${item.productId}:${item.optionChoice ?? ""}`}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-serif text-title-sm">{item.productName}</p>
                  <p className="mt-1 text-body-sm text-stone">
                    {product ? typeLabels[product.type] : "Digital template"} ·
                    purchased ${item.price}
                    {item.optionLabel && item.optionChoice
                      ? ` · ${item.optionLabel}: ${item.optionChoice}`
                      : ""}
                  </p>
                </div>

                {order.status === "paid" && grant ? (
                  <Button
                    href={`/access/${grant.token}`}
                    size="sm"
                    className="shrink-0 self-start sm:self-auto"
                  >
                    Access template
                  </Button>
                ) : (
                  <p className="text-body-sm text-stone">
                    {order.status === "paid"
                      ? "Preparing your files…"
                      : "Access available after payment"}
                  </p>
                )}
              </li>
            );
          }),
        )}
      </ul>
    </section>
  );
}
