/**
 * Order lifecycle. Only the server ever sets this — the browser receives it
 * for display and can never transition an order itself.
 *
 *  pending   → checkout created, payment not verified yet
 *  paid      → payment verified server-side (webhook in production)
 *  failed    → payment attempt failed
 *  cancelled → order abandoned or voided before payment
 *  refunded  → paid order reversed
 */
export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

/**
 * One line of an order. Product name and price are SNAPPED at purchase time:
 * if the catalogue changes later, historical orders still read correctly.
 */
export type OrderItem = {
  productId: string;
  /** Snapshot — never re-read from the catalogue. */
  productName: string;
  /** Snapshot unit price at purchase time, in USD. */
  price: number;
  quantity: number;
  /** Convenience snapshot for support; not authoritative. */
  productSlug?: string;
};

export type Order = {
  /** Internal row id — a random reference, used as the object key. */
  id: string;
  /** Customer-facing order number, e.g. "BW-2026-000123". */
  orderNumber: string;

  /**
   * Set when the buyer is signed in. Guests (token delivery) leave it null.
   * Ownership of an order is decided by this column, server-side.
   */
  userId?: string | null;

  customerName: string;
  customerEmail: string;
  /** WhatsApp number in international format, digits and + only. */
  customerWhatsApp: string;
  /** Optional note the customer left at checkout. */
  customerNotes?: string | null;

  items: OrderItem[];

  /** Server-computed: Σ(item.price × item.quantity). */
  subtotal: number;
  /** Server-applied discount. 0 in the mock build. */
  discount: number;
  /** subtotal − discount. */
  total: number;
  currency: "USD";

  status: OrderStatus;
  createdAt: string;
  /** Set when the payment service confirms success. */
  paidAt?: string | null;
  /** Opaque reference to the payment provider record (mock: internal id). */
  paymentRef?: string | null;
};

/**
 * Write/read side of orders. Today backed by mock storage
 * (`src/lib/mock/order-repository.ts`); a future Supabase implementation
 * only needs to satisfy this interface.
 *
 * Server-only — orders must never be created or mutated from the browser.
 */
export interface OrderRepository {
  create(order: Order): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  getByOrderNumber(orderNumber: string): Promise<Order | null>;
  /** Newest first. Used by the mock account pages (no auth yet). */
  getByEmail(email: string): Promise<Order[]>;
  /** Count of stored orders — drives the order-number sequence. */
  count(): Promise<number>;
}

/**
 * Purchase access: the credential that unlocks delivery after payment.
 *
 * MODEL (and its honest limits — §8): a token is a bearer credential. Once a
 * customer has received a Canva template link they could share it, and we do
 * NOT claim that is technically preventable. The real protections are:
 *
 *   1. BLANC-side access control — the token must resolve to a PAID order.
 *   2. Private delivery — the PDF comes from private storage via a signed URL.
 *   3. Licence terms — the customer agrees not to redistribute the template.
 *   4. Canva's own copy mechanism — customers edit their own copy; the master
 *      workspace is never shared with them.
 *
 * MOCK SECURITY: in this build a token is a random 32-byte hex string looked
 * up in a server-side JSON file. That is fine for a demo and NOT acceptable
 * for production — see README.
 */
export type PurchaseAccess = {
  id: string;
  /** Opaque secret. Never logged, never rendered, never emailed as a query. */
  token: string;
  orderId: string;
  orderNumber: string;
  /** One access record per purchased product. */
  productId: string;
  productName: string;
  customerEmail: string;
  createdAt: string;
  /** ISO timestamp; null = never expires. */
  expiresAt: string | null;
  revoked: boolean;
};

/**
 * Server-only. A future Supabase implementation maps this to the
 * `purchase_access` table; the interface is intentionally tiny.
 */
export interface PurchaseAccessRepository {
  create(access: PurchaseAccess): Promise<PurchaseAccess>;
  /** Constant-shape lookup by token. */
  getByToken(token: string): Promise<PurchaseAccess | null>;
  /** All access records for an order — one per purchased product. */
  getByOrderId(orderId: string): Promise<PurchaseAccess[]>;
}
