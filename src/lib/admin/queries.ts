import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { usingSupabase } from "@/lib/repositories";
import { mapProductRow } from "@/lib/supabase/repositories/product-repository";
import type {
  OrderRow,
  ProductImageRow,
  ProductRow,
  Profile,
} from "@/lib/supabase/types";
import { mockOrderRepository } from "@/lib/mock/order-repository";
import { allProducts } from "@/data/products";
import { formatOrderDate } from "@/lib/format";

/**
 * Admin data access.
 *
 * Every function here calls `requireAdmin()` FIRST — before touching the
 * service-role client. That ordering is the point of this module: there is no
 * code path where a privileged query runs without a verified admin session.
 *
 * When Supabase is not configured there is no database to read, so the
 * dashboard reports that clearly instead of showing invented numbers.
 */

export type AdminStats = {
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  /** Sum of PAID order totals only. */
  revenue: number;
  recentOrders: AdminOrderRow[];
  recentProducts: AdminProductRow[];
  /** True when the data below comes from the local mock, not a database. */
  mockMode: boolean;
};

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
  itemNames: string;
};

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number;
  published: boolean;
  hasDelivery: boolean;
  updatedAt: string;
};

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: number) => `$${value.toFixed(0)}`;

/** Dashboard summary. */
export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  if (!usingSupabase) {
    // No database configured: report the local catalogue honestly rather than
    // pretending there are orders.
    return {
      totalProducts: allProducts.length,
      publishedProducts: allProducts.filter((product) => product.published).length,
      totalOrders: 0,
      paidOrders: 0,
      pendingOrders: 0,
      revenue: 0,
      recentOrders: [],
      recentProducts: allProducts.slice(0, 5).map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        type: product.type,
        price: product.price,
        published: product.published,
        hasDelivery: false,
        updatedAt: product.createdAt,
      })),
      mockMode: true,
    };
  }

  const admin = createAdminClient();

  const [
    productsCount,
    publishedCount,
    ordersCount,
    paidCount,
    pendingCount,
    revenue,
    recentOrders,
    recentProducts,
    deliveryProductIds,
  ] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }),
    admin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("orders").select("total").eq("status", "paid"),
    admin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(5),
    admin.from("delivery_assets").select("product_id"),
  ]);

  const delivered = new Set(
    ((deliveryProductIds.data ?? []) as { product_id: string }[]).map(
      (row) => row.product_id,
    ),
  );

  const orderRows = (recentOrders.data ?? []) as OrderRow[];
  const itemsByOrder = await loadItemSummaries(orderRows.map((row) => row.id));

  return {
    totalProducts: productsCount.count ?? 0,
    publishedProducts: publishedCount.count ?? 0,
    totalOrders: ordersCount.count ?? 0,
    paidOrders: paidCount.count ?? 0,
    pendingOrders: pendingCount.count ?? 0,
    revenue: ((revenue.data ?? []) as { total: number | string }[]).reduce(
      (total, row) => total + num(row.total),
      0,
    ),
    recentOrders: orderRows.map((row) => {
      const items = itemsByOrder.get(row.id) ?? { count: 0, names: "" };
      return {
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerWhatsApp: row.customer_whatsapp,
        status: row.status,
        total: num(row.total),
        createdAt: row.created_at,
        itemCount: items.count,
        itemNames: items.names,
      };
    }),
    recentProducts: ((recentProducts.data ?? []) as ProductRow[]).map(
      (row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        type: row.type,
        price: num(row.price),
        published: row.published,
        hasDelivery: delivered.has(row.id),
        updatedAt: row.updated_at,
      }),
    ),
    mockMode: false,
  };
}

async function loadItemSummaries(orderIds: string[]) {
  const summary = new Map<string, { count: number; names: string }>();
  if (orderIds.length === 0) return summary;

  const admin = createAdminClient();
  const { data } = await admin
    .from("order_items")
    .select("order_id, product_name, quantity")
    .in("order_id", orderIds);

  for (const row of (data ?? []) as {
    order_id: string;
    product_name: string;
    quantity: number;
  }[]) {
    const current = summary.get(row.order_id) ?? { count: 0, names: "" };
    current.count += row.quantity;
    current.names = current.names
      ? `${current.names}, ${row.product_name}`
      : row.product_name;
    summary.set(row.order_id, current);
  }
  return summary;
}

/** Paginated product list with search + filters. */
export async function getAdminProducts(filters: {
  q?: string;
  type?: string;
  status?: "all" | "published" | "draft";
  limit?: number;
} = {}): Promise<{ products: AdminProductRow[]; total: number }> {
  await requireAdmin();

  if (!usingSupabase) {
    const term = filters.q?.trim().toLowerCase();
    const products = allProducts
      .filter((product) => !term || product.name.toLowerCase().includes(term))
      .filter((product) => !filters.type || product.type === filters.type)
      .map<AdminProductRow>((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        type: product.type,
        price: product.price,
        published: product.published,
        hasDelivery: false,
        updatedAt: product.createdAt,
      }));
    return { products: products.slice(0, filters.limit ?? 50), total: products.length };
  }

  const admin = createAdminClient();
  let request = admin
    .from("products")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(filters.limit ?? 50);

  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    request = request.or(`name.ilike.${term},slug.ilike.${term}`);
  }
  if (filters.type) request = request.eq("type", filters.type);
  if (filters.status === "published") request = request.eq("published", true);
  if (filters.status === "draft") request = request.eq("published", false);

  const { data, count, error } = await request;
  if (error) {
    console.error("[admin:products] list failed:", error.message);
    return { products: [], total: 0 };
  }

  const { data: assets } = await admin
    .from("delivery_assets")
    .select("product_id");
  const delivered = new Set(
    ((assets ?? []) as { product_id: string }[]).map((row) => row.product_id),
  );

  return {
    total: count ?? 0,
    products: ((data ?? []) as ProductRow[]).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
      price: num(row.price),
      published: row.published,
      hasDelivery: delivered.has(row.id),
      updatedAt: row.updated_at,
    })),
  };
}

/** Paginated order list. */
export async function getAdminOrders(filters: {
  q?: string;
  status?: string;
  limit?: number;
} = {}): Promise<{ orders: AdminOrderRow[]; total: number }> {
  await requireAdmin();

  if (!usingSupabase) {
    const orders = await mockOrderRepository.getByEmail("%");
    void orders;
    return { orders: [], total: 0 };
  }

  const admin = createAdminClient();
  let request = admin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 50);

  if (filters.status && filters.status !== "all") {
    request = request.eq("status", filters.status);
  }
  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    request = request.or(
      `order_number.ilike.${term},customer_name.ilike.${term},customer_email.ilike.${term}`,
    );
  }

  const { data, count, error } = await request;
  if (error) {
    console.error("[admin:orders] list failed:", error.message);
    return { orders: [], total: 0 };
  }

  const rows = (data ?? []) as OrderRow[];
  const itemsByOrder = await loadItemSummaries(rows.map((row) => row.id));

  return {
    total: count ?? 0,
    orders: rows.map((row) => {
      const items = itemsByOrder.get(row.id) ?? { count: 0, names: "" };
      return {
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerWhatsApp: row.customer_whatsapp,
        status: row.status,
        total: num(row.total),
        createdAt: row.created_at,
        itemCount: items.count,
        itemNames: items.names,
      };
    }),
  };
}

/** One order with its items, for the admin detail page. */
export async function getAdminOrder(id: string) {
  await requireAdmin();
  if (!usingSupabase) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle<OrderRow>();
  if (!data) return null;

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const summaries = await loadItemSummaries([id]);
  const summary = summaries.get(id) ?? { count: 0, names: "" };

  return {
    id: data.id,
    orderNumber: data.order_number,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    customerWhatsApp: data.customer_whatsapp,
    customerNotes: data.customer_notes,
    status: data.status,
    subtotal: num(data.subtotal),
    discount: num(data.discount),
    total: num(data.total),
    createdAt: data.created_at,
    itemCount: summary.count,
    items: ((items ?? []) as {
      id: string;
      product_id: string;
      product_name: string;
      price: number | string;
      quantity: number;
    }[]).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      price: num(item.price),
      quantity: item.quantity,
    })),
  };
}

/** Customer list with order counts and lifetime value. */
export async function getAdminCustomers(limit = 50) {
  await requireAdmin();
  if (!usingSupabase) return [];

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (profiles ?? []) as Profile[];
  if (rows.length === 0) return [];

  const { data: orders } = await admin
    .from("orders")
    .select("user_id, customer_email, total, status")
    .in("user_id", rows.map((row) => row.id));

  const byUser = new Map<
    string,
    { count: number; spend: number }
  >();
  for (const order of (orders ?? []) as {
    user_id: string | null;
    customer_email: string;
    total: number | string;
    status: string;
  }[]) {
    if (!order.user_id) continue;
    const current = byUser.get(order.user_id) ?? { count: 0, spend: 0 };
    current.count += 1;
    if (order.status === "paid") current.spend += num(order.total);
    byUser.set(order.user_id, current);
  }

  return rows.map((row) => {
    const stats = byUser.get(row.id) ?? { count: 0, spend: 0 };
    return {
      id: row.id,
      fullName: row.full_name ?? "",
      email: row.email ?? "",
      whatsapp: row.whatsapp ?? "",
      orderCount: stats.count,
      totalSpend: stats.spend,
      createdAt: row.created_at,
    };
  });
}
/**
 * One product for the admin editor, INCLUDING its private delivery asset.

 * One product for the admin editor, INCLUDING its private delivery asset.
 *
 * The only place in the app that reads delivery_assets for the admin UI, and
 * it sits behind requireAdmin() plus the service-role client. The Canva URL
 * returned here never leaves the admin route tree.
 */
export async function getAdminProductDetail(id: string) {
  await requireAdmin();

  if (!usingSupabase) {
    const local = allProducts.find((product) => product.id === id);
    if (!local) return null;
    return { ...local, canvaTemplateUrl: "", setupPdfPath: "" };
  }

  const admin = createAdminClient();

  const { data: row } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<ProductRow>();
  if (!row) return null;

  const { data: images } = await admin
    .from("product_images")
    .select("image_path, alt_text, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const { data: asset } = await admin
    .from("delivery_assets")
    .select("canva_template_url, setup_pdf_path")
    .eq("product_id", id)
    .maybeSingle<{ canva_template_url: string; setup_pdf_path: string }>();

  return {
    ...mapProductRow({
      ...row,
      product_images: (images ?? []) as ProductImageRow[],
    }),
    canvaTemplateUrl: asset?.canva_template_url ?? "",
    setupPdfPath: asset?.setup_pdf_path ?? "",
  };
}
export { money, formatOrderDate };
