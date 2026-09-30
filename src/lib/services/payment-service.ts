/**
 * Payment abstraction.
 *
 * MOCK IMPLEMENTATION ONLY. No real provider is connected and none may be
 * until the store is live: this build never charges a card, never talks to
 * Stripe/Midtrans/Xendit, and the "payment" is a local decision made by the
 * server from the order total it computed itself.
 *
 * The interface is the seam. A production implementation
 * (`StripePaymentService`, `MidtransPaymentService`, …) replaces this module in
 * `checkout-service.ts` and no other file changes. In production the order is
 * marked paid by a verified WEBHOOK, never by the browser.
 */
export type PaymentStatus = "pending" | "succeeded" | "failed";

export type PaymentIntent = {
  /** Provider-side reference we store on the order. */
  reference: string;
  orderNumber: string;
  amount: number;
  currency: "USD";
  status: PaymentStatus;
  createdAt: string;
};

export type PaymentSession = {
  intent: PaymentIntent;
  /**
   * Where a real provider would send the customer. In the mock build this is
   * null: there is no hosted page, because no payment is taken.
   */
  checkoutUrl: string | null;
  /** True while running on the mock service — surfaced in the UI. */
  simulated: boolean;
};

export interface PaymentService {
  /** Create an intent for a server-computed amount. */
  createCheckout(params: {
    orderNumber: string;
    amount: number;
    currency: "USD";
  }): Promise<PaymentSession>;
  /**
   * Confirm the intent. The mock always succeeds; the amount and currency are
   * re-checked server-side, and a mismatch fails closed.
   */
  confirmPayment(
    intent: PaymentIntent,
    params: { amount: number; currency: "USD" },
  ): Promise<PaymentStatus>;
  getPaymentStatus(reference: string): Promise<PaymentStatus | null>;
}

const reference = () =>
  `mockpay_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * MockPaymentService — a development/test checkout.
 *
 * It is deliberately obvious in code and in the UI that no money moves. Every
 * "payment" here is a server-side no-op; a production build must replace this
 * class entirely and confirm payment from a signed provider webhook.
 */
export class MockPaymentService implements PaymentService {
  readonly simulated = true;
  /** In-memory ledger, so getPaymentStatus has something to read. */
  private readonly intents = new Map<string, PaymentIntent>();

  async createCheckout({
    orderNumber,
    amount,
    currency,
  }: {
    orderNumber: string;
    amount: number;
    currency: "USD";
  }): Promise<PaymentSession> {
    const intent: PaymentIntent = {
      reference: reference(),
      orderNumber,
      amount,
      currency,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.intents.set(intent.reference, intent);
    return { intent, checkoutUrl: null, simulated: true };
  }

  async confirmPayment(
    intent: PaymentIntent,
    params: { amount: number; currency: "USD" },
  ): Promise<PaymentStatus> {
    // Fail closed on any mismatch — the same check a webhook handler must do.
    if (params.amount !== intent.amount || params.currency !== intent.currency) {
      const failed: PaymentIntent = { ...intent, status: "failed" };
      this.intents.set(intent.reference, failed);
      return "failed";
    }
    // Mock success. NO card data is involved at any point.
    const paid: PaymentIntent = { ...intent, status: "succeeded" };
    this.intents.set(intent.reference, paid);
    return "succeeded";
  }

  async getPaymentStatus(ref: string): Promise<PaymentStatus | null> {
    return this.intents.get(ref)?.status ?? null;
  }
}

export const mockPaymentService = new MockPaymentService();
