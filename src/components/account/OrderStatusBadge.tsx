import type { OrderStatus } from "@/lib/repositories";
import { cn } from "@/lib/utils";

const labels: Record<OrderStatus, string> = {
  pending: "Pending payment",
  paid: "Paid",
  failed: "Payment failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/**
 * Monochrome status marker — status comes from the server order record and
 * is display-only in the browser.
 */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-line px-2.5 py-1 text-eyebrow uppercase",
        status === "paid" ? "border-ink/40 text-ink" : "text-stone",
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
