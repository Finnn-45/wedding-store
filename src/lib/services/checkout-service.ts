import {
  orderRepository,
  productRepository,
  purchaseAccessRepository,
  type Order,
  type OrderItem,
  type Product,
} from "@/lib/repositories";
import { mockEmailDeliveryService } from "@/lib/services/email-delivery-service";
import { mockPaymentService } from "@/lib/services/payment-service";
import { generateAccessToken } from "@/lib/services/purchase-access-service";
import { mockWhatsAppDeliveryService } from "@/lib/services/whatsapp-delivery-service";
import { siteUrl } from "@/lib/site";
import { isPurchasableTemplate } from "@/data/products";

/* ------------------------------------------------------------------ */
/* Input (what the browser is allowed to send)                         */
/* ------------------------------------------------------------------ */

export type CheckoutCustomer = {
  name: string;
  email: string;
  whatsapp: string;
  notes?: string | null;
};

/** A cart line as it crosses the network: identity only, never a price. */
export type CheckoutLineInput = {
  productId: string;
  quantity: number;
};

export type CheckoutInput = {
  customer: CheckoutCustomer;
  items: CheckoutLineInput[];
};

export type CheckoutErrorCode =
  | "invalid_request"
  | "invalid_items"
  | "payments_disabled"
  | "server_error";

export type CheckoutResult =
  | {
      ok: true;
      order: Order;
      /**
       * True when the money has NOT been taken yet: the order was created as
       * "pending" and the buyer still has to transfer manually (production
       * default). The access links below then stay locked until an admin
       * confirms the order paid.
       */
      requiresPayment: boolean;
      /**
       * The purchase-access URL the customer is sent to. This is a CREDENTIAL
       * — it is returned once, to the buyer, and must never be logged, cached
       * or exposed to anyone else.
       */
      accessUrl: string;
      /** One entry per purchased product — one access token per item. */
      accessUrls: {
        token: string;
        productId: string;
        productName: string;
        url: string;
      }[];
    }
  | { ok: false; code: CheckoutErrorCode };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PRODUCT_ID_PATTERN = /^[a-z0-9-]+$/;
/** Digits and an optional leading + — 7 to 15 digits per E.164. */
const WHATSAPP_PATTERN = /^\+?[0-9]{7,15}$/;
const MAX_LINES = 50;
const MAX_QUANTITY_PER_PRODUCT = 100;

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@blancweddings.com";

function cleanOptionalString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * Normalises a WhatsApp number to digits with a leading +, so the delivery
 * service and any future provider get a predictable value.
 */
function normaliseWhatsApp(value: string): string | null {
  const stripped = value.replace(/[\s()\-.]/g, "");
  if (!WHATSAPP_PATTERN.test(stripped)) return null;
  return stripped.startsWith("+") ? stripped : `+${stripped}`;
}


/**
 * Validates the request body. Only product id + quantity per line — a price in
 * the payload would simply be ignored, because the server never reads one.
 * Returns null when the payload is not a valid checkout request.
 */
export function parseCheckoutInput(body: unknown): CheckoutInput | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;

  const customerRaw = raw.customer;
  if (typeof customerRaw !== "object" || customerRaw === null) return null;
  const customer = customerRaw as Record<string, unknown>;

  const email =
    typeof customer.email === "string" ? customer.email.trim() : "";
  const name = typeof customer.name === "string" ? customer.name.trim() : "";
  const rawWhatsApp =
    typeof customer.whatsapp === "string" ? customer.whatsapp.trim() : "";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return null;
  if (!name || name.length > 120) return null;
  const whatsapp = normaliseWhatsApp(rawWhatsApp);
  if (!whatsapp) return null;

  const itemsRaw = raw.items;
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) return null;

  const items: CheckoutLineInput[] = [];
  for (const entry of itemsRaw) {
    if (typeof entry !== "object" || entry === null) return null;
    const line = entry as Record<string, unknown>;
    const productId = typeof line.productId === "string" ? line.productId : "";
    const quantity = line.quantity;
    if (!PRODUCT_ID_PATTERN.test(productId) || productId.length > 120) {
      return null;
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_PRODUCT
    ) {
      return null;
    }
    items.push({ productId, quantity });
  }
  if (items.length > MAX_LINES) return null;

  return {
    customer: {
      name,
      email,
      whatsapp,
      notes: cleanOptionalString(customer.notes, 1000),
    },
    items,
  };
}

/* ------------------------------------------------------------------ */
/* Checkout service                                                    */
/* ------------------------------------------------------------------ */

export interface CheckoutService {
  placeOrder(input: CheckoutInput): Promise<CheckoutResult>;
}

type CheckoutDependencies = {
  products: typeof productRepository;
  orders: typeof orderRepository;
  access: typeof purchaseAccessRepository;
  payments: typeof mockPaymentService;
  email: typeof mockEmailDeliveryService;
  whatsapp: typeof mockWhatsAppDeliveryService;
};

/** Human order number: BW-<year>-<6 digit sequence>. */
async function nextOrderNumber(
  orders: CheckoutDependencies["orders"],
): Promise<string> {
  const year = new Date().getFullYear();
  const start = (await orders.count()) + 1;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `BW-${year}-${String(start + attempt).padStart(6, "0")}`;
    if (!(await orders.getByOrderNumber(candidate))) return candidate;
  }
  throw new Error("Unable to allocate an order number");
}

/** Internal reference — never shown to the customer. */
function orderId(): string {
  return `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}


/**
 * Whether the wired payment service (the mock) may run.
 *
 * In development it always may. In a production build the mock would mark every
 * order paid and issue the paid files to anyone who checks out, so it only runs
 * when ENABLE_MOCK_CHECKOUT is explicitly "true" - e.g. to demo the full
 * purchase flow on a private deployment. A real provider (Stripe / Midtrans /
 * Xendit + webhook) replaces this check along with the service itself.
 */
function isMockCheckoutEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_MOCK_CHECKOUT === "true";
}

export function createCheckoutService({
  products,
  orders,
  access,
  payments,
  email,
  whatsapp,
}: CheckoutDependencies): CheckoutService {
  return {
    async placeOrder(input) {
      // Two modes, decided once per request:
      //   mock   — development, or ENABLE_MOCK_CHECKOUT=true: the demo provider
      //            "charges" instantly and the order lands paid.
      //   manual — the production default: no payment provider runs at all,
      //            the order is created PENDING after a bank transfer, and an
      //            admin unlocks it with "Confirm payment received".
      // The mock can never auto-pay a real storefront: isMockCheckoutEnabled
      // only returns true in dev or behind the explicit flag.
      const mockCheckout = isMockCheckoutEnabled();

      try {
        // 1. Resolve every line against the server catalogue. Unknown or
        //    non-purchasable products fail the whole order — the client
        //    cannot invent products, prices or totals.
        const basket = new Map<string, { product: Product; quantity: number }>();
        for (const line of input.items) {
          const product = await products.getById(line.productId);
          if (!product || !isPurchasableTemplate(product)) {
            return { ok: false, code: "invalid_items" };
          }
          const current = basket.get(product.id);
          const quantity = (current?.quantity ?? 0) + line.quantity;
          if (quantity > MAX_QUANTITY_PER_PRODUCT) {
            return { ok: false, code: "invalid_items" };
          }
          basket.set(product.id, { product, quantity });
        }
        if (basket.size === 0) return { ok: false, code: "invalid_items" };

        // 2. Snapshot items with SERVER prices. A catalogue change after
        //    purchase must never rewrite a historical order.
        const items: OrderItem[] = Array.from(basket.values()).map(
          ({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            price: product.price,
            quantity,
          }),
        );

        // 3. Money is computed HERE, from the catalogue — never from anything
        //    the browser sent. Discount is server-applied (0 in the mock).
        const subtotal = items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
        const discount = 0;
        const total = subtotal - discount;

        // 4. Payment. Mock mode runs the demo provider through the service
        //    seam; manual mode never calls it — the order waits as "pending"
        //    until an admin confirms the transfer arrived. Either way the
        //    status is decided HERE, never by anything the browser sent.
        const orderNumber = await nextOrderNumber(orders);
        const now = new Date().toISOString();
        let paid = false;
        let paymentRef: string | null = null;
        if (mockCheckout) {
          const session = await payments.createCheckout({
            orderNumber,
            amount: total,
            currency: "USD",
          });
          const paymentStatus = await payments.confirmPayment(session.intent, {
            amount: total,
            currency: "USD",
          });
          paid = paymentStatus === "succeeded";
          paymentRef = session.intent.reference;
        }

        const order: Order = {
          id: orderId(),
          orderNumber,
          customerName: input.customer.name,
          customerEmail: input.customer.email,
          customerWhatsApp: input.customer.whatsapp,
          customerNotes: input.customer.notes ?? null,
          items,
          subtotal,
          discount,
          total,
          currency: "USD",
          status: paid ? "paid" : mockCheckout ? "failed" : "pending",
          createdAt: now,
          paidAt: paid ? now : null,
          paymentRef,
        };

        // The repository is the source of truth for the persisted order: it
        // allocates the database id and (on Supabase) the real order number,
        // so the access records and the response must use what it RETURNS —
        // the in-memory placeholder would be a non-uuid string that the
        // purchase_access FK rejects.
        const createdOrder = await orders.create(order);

        // 5. One access token per purchased product, so revoking one product
        //    does not revoke all. Tokens are minted even while the order is
        //    PENDING: they stay inert (verify() requires status "paid"), so
        //    the buyer's own link starts working the moment payment is
        //    confirmed — no second email or token minting step needed.
        const accessTokens: string[] = [];
        if (items.length > 0) {
          for (const item of items) {
            const token = generateAccessToken();
            await access.create({
              id: `pa_${token.slice(0, 12)}`,
              token,
              orderId: createdOrder.id,
              orderNumber: createdOrder.orderNumber,
              productId: item.productId,
              productName: item.productName,
              customerEmail: createdOrder.customerEmail,
              createdAt: now,
              // Access does not expire in the mock. Production may set an
              // expiry here, and the access page already handles "expired".
              expiresAt: null,
              revoked: false,
            });
            accessTokens.push(token);
          }
        }

        const primaryToken = accessTokens[0];
        const accessUrl = primaryToken
          ? `${siteUrl}/access/${primaryToken}`
          : "";

        // 6. Simulated delivery. Both messages point at the SECURE ACCESS
        //    PAGE, never at Canva or the PDF directly. Failures here must not
        //    fail the order — the customer can always re-open their access page.
        if (paid && primaryToken) {
          try {
            await email.sendPurchaseConfirmation({
              order: createdOrder,
              accessPageUrl: accessUrl,
              supportEmail: SUPPORT_EMAIL,
            });
            await whatsapp.sendPurchaseMessage({
              order: createdOrder,
              accessPageUrl: accessUrl,
            });
          } catch (deliveryError) {
            console.error("[checkout] delivery simulation failed:", deliveryError);
          }
        }

        return {
          ok: true,
          order: createdOrder,
          // The order is pending when no money was taken (manual transfer) —
          // the API then attaches payment instructions for the confirmation
          // screen, and the access links stay locked until an admin confirms.
          requiresPayment: createdOrder.status === "pending",
          // Single-product orders get the token inline. Multi-product orders
          // send every token in the response so the confirmation page can
          // build one access link per item (it renders them server-side).
          accessUrl,
          accessUrls: accessTokens.map(
            (token, index) => ({
              token,
              productId: items[index]?.productId ?? "",
              productName: items[index]?.productName ?? "",
              url: `${siteUrl}/access/${token}`,
            }),
          ),
        };
      } catch (error) {
        // Technical detail stays server-side; the customer sees a generic
        // message.
        console.error("[checkout] failed to create order:", error);
        return { ok: false, code: "server_error" };
      }
    },
  };
}

export const checkoutService: CheckoutService = createCheckoutService({
  products: productRepository,
  orders: orderRepository,
  access: purchaseAccessRepository,
  payments: mockPaymentService,
  email: mockEmailDeliveryService,
  whatsapp: mockWhatsAppDeliveryService,
});
