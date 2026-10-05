import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatOrderDate } from "@/lib/format";
import { orderRepository, type Order } from "@/lib/repositories";

type SuccessPageProps = PageProps<"/order/success/[orderId]">;

/**
 * Order success page.
 *
 * SECURITY: the order number alone is NOT enough to see a purchase. The URL
 * must also carry the access token this order generated (`?access=`), which
 * is checked against the purchase-access record server-side. Without it the
 * page 404s, so guessing order numbers reveals nothing.
 */
async function loadOrder(props: SuccessPageProps): Promise<Order | null> {
  const { orderId } = await props.params;
  const searchParams = await props.searchParams;
  const rawToken = Array.isArray(searchParams.access)
    ? searchParams.access[0]
    : searchParams.access;
  if (!rawToken) return null;

  try {
    const order = await orderRepository.getByOrderNumber(orderId);
    if (!order) return null;
    // The token must belong to THIS order — verified here, and again by the
    // access service when the customer follows the link.
    const { purchaseAccessService } = await import(
      "@/lib/services/purchase-access-service"
    );
    const grant = await purchaseAccessService.getPurchaseAccess(rawToken);
    if (grant.state !== "ready" || grant.order?.id !== order.id) return null;
    return order;
  } catch (error) {
    console.error("[order success] lookup failed:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Order received",
    robots: { index: false, follow: false },
  };
}

export default async function OrderSuccessPage(props: SuccessPageProps) {
  const order = await loadOrder(props);
  if (!order) notFound();

  const searchParams = await props.searchParams;
  const token = Array.isArray(searchParams.access)
    ? searchParams.access[0]
    : searchParams.access;

  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <Eyebrow>Order received</Eyebrow>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Thank you, {order.customerName.split(" ")[0]}
        </h1>
        <p className="mt-4 text-lead text-stone">
          Your payment was confirmed and your purchase is ready. A confirmation
          has been prepared for {order.customerEmail} and {order.customerWhatsApp}.
        </p>

        <dl className="mt-10 grid gap-4 border-y border-line py-6 text-body sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Order</dt>
            <dd className="tabular-nums">{order.orderNumber}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Status</dt>
            <dd>
              <OrderStatusBadge status={order.status} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Placed</dt>
            <dd className="tabular-nums">{formatOrderDate(order.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Total</dt>
            <dd className="tabular-nums">${order.total}</dd>
          </div>
        </dl>

        <ul className="mt-8 flex flex-col divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-baseline justify-between gap-6 py-4">
              <span className="min-w-0">
                <span className="block font-serif text-title-sm">{item.productName}</span>
                <span className="text-body-sm text-stone">
                  Quantity {item.quantity} · ${item.price} each
                </span>
              </span>
              <span className="shrink-0 tabular-nums">
                ${item.price * item.quantity}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 border border-line bg-shell p-6">
          <p className="text-body-sm text-stone">
            <strong className="font-medium text-ink">Test checkout.</strong> No
            payment provider is connected and no card was charged. Email and
            WhatsApp delivery were simulated on the server.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href={`/access/${token}`} size="lg">
            Open your purchase access
          </Button>
          <Button href="/account/purchases" variant="outline" size="lg">
            My purchases
          </Button>
        </div>
      </Container>
    </section>
  );
}
