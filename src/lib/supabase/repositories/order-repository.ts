import type {
  Order,
  OrderItem,
  OrderRepository,
} from "@/lib/repositories/order-repository";
import type {
  OrderItemRow,
  OrderRow,
} from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * SupabaseOrderRepository — the same `OrderRepository` contract as the mock.
 *
 * WRITES use the service-role client, because the browser must never be able
 * to set `status`, `subtotal`, `discount` or `total`. Callers are trusted
 * server code (checkout service, admin server actions, future webhook).
 *
 * READS use the caller's session, so RLS applies: a signed-in customer sees
 * only their own orders, an admin sees all, and a guest order (user_id null)
 * is reachable only through the purchase-access token flow, which is
 * verified separately.
 */

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
};

function toOrder(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerWhatsApp: row.customer_whatsapp,
    customerNotes: row.customer_notes,
    items: items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      productSlug: item.product_slug ?? undefined,
      price: num(item.price),
      quantity: item.quantity,
    })),
    subtotal: num(row.subtotal),
    discount: num(row.discount),
    total: num(row.total),
    currency: row.currency as Order["currency"],
    status: row.status,
    createdAt: row.created_at,
    paidAt: (row as { paid_at?: string | null }).paid_at ?? null,
    paymentRef: row.payment_ref,
  };
}

async function loadItems(orderId: string): Promise<OrderItemRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return (data ?? []) as OrderItemRow[];
}

async function hydrate(rows: OrderRow[]): Promise<Order[]> {
  if (rows.length === 0) return [];
  return Promise.all(
    rows.map(async (row) => toOrder(row, await loadItems(row.id))),
  );
}

export const supabaseOrderRepository: OrderRepository = {
  async create(order) {
    const admin = createAdminClient();

    // The order number is allocated by a database function so two concurrent
    // checkouts can never collide on the unique constraint.
    const { data: orderNumber, error: numberError } = await admin.rpc(
      "next_order_number",
    );
    if (numberError) {
      throw new Error(`Could not allocate an order number: ${numberError.message}`);
    }

    const { data: inserted, error } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: order.userId ?? null,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_whatsapp: order.customerWhatsApp,
        customer_notes: order.customerNotes ?? null,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        currency: order.currency,
        payment_ref: order.paymentRef ?? null,
      })
      .select("*")
      .single<OrderRow>();

    if (error || !inserted) {
      throw new Error(`Could not create the order: ${error?.message ?? "unknown"}`);
    }

    const items = order.items.map((item: OrderItem) => ({
      order_id: inserted.id,
      product_id: item.productId,
      product_name: item.productName,
      product_slug: item.productSlug ?? null,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(items);
    if (itemsError) {
      throw new Error(`Could not save the order items: ${itemsError.message}`);
    }

    return toOrder(inserted, await loadItems(inserted.id));
  },

  async getById(id) {
    // Service-role read: the caller is trusted server code (order detail
    // page, access verification, admin). RLS is not the guard here — the
    // server-side ownership check in guards.ts is.
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle<OrderRow>();
    if (!data) return null;
    return toOrder(data, await loadItems(data.id));
  },

  async getByOrderNumber(orderNumber) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle<OrderRow>();
    if (!data) return null;
    return toOrder(data, await loadItems(data.id));
  },

  async getByEmail(email) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("*")
      .ilike("customer_email", email.trim())
      .order("created_at", { ascending: false });
    return hydrate((data ?? []) as OrderRow[]);
  },

  /**
   * The mock counts rows to build order numbers; the Supabase version
   * allocates them in SQL (`next_order_number()`), so this only exists to
   * satisfy the shared interface.
   */
  async count() {
    const admin = createAdminClient();
    const { count } = await admin.from("orders").select("id", {
      count: "exact",
      head: true,
    });
    return count ?? 0;
  },
};

/** Read scoped to the signed-in caller — RLS decides what comes back. */
export async function getOrdersForCurrentUser(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return hydrate((data ?? []) as OrderRow[]);
}