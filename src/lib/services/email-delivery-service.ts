import type { Order } from "@/lib/repositories";

/**
 * Email delivery abstraction.
 *
 * MOCK IMPLEMENTATION ONLY — nothing is sent. There is no SMTP, no Resend, no
 * SendGrid connection in this build, and none may be added until go-live.
 *
 * The service builds the real message payload, logs it on the server, and
 * records it in an in-memory outbox the confirmation page can display. That
 * keeps the UI honest ("simulated") while the message content is already
 * production-shaped.
 *
 * The message deliberately points at the SECURE ACCESS PAGE and never embeds
 * the Canva or PDF URLs, so a leaked email does not hand over the template.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain-text body, newline separated. */
  body: string;
  /** Order this message belongs to, for the outbox view. */
  orderNumber: string;
  sentAt: string;
  simulated: true;
};

export interface EmailDeliveryService {
  sendPurchaseConfirmation(params: {
    order: Order;
    accessPageUrl: string;
    supportEmail: string;
  }): Promise<EmailMessage>;
}

export const EMAIL_SUBJECT =
  "Your BLANC WEDDINGS template is ready";

class MockEmailDeliveryService implements EmailDeliveryService {
  /** Not a real outbox — just enough for the success page to show. */
  private readonly outbox: EmailMessage[] = [];

  /** Development aid: the most recent simulated message. */
  lastMessage(): EmailMessage | null {
    return this.outbox.at(-1) ?? null;
  }

  async sendPurchaseConfirmation({
    order,
    accessPageUrl,
    supportEmail,
  }: {
    order: Order;
    accessPageUrl: string;
    supportEmail: string;
  }): Promise<EmailMessage> {
    const products = order.items
      .map((item) => `  • ${item.productName} — $${item.price}`)
      .join("\n");

    const body = [
      `Hi ${order.customerName},`,
      "",
      "Thank you for your purchase from BLANC WEDDINGS.",
      "",
      `Order: ${order.orderNumber}`,
      "Purchased:",
      products,
      "",
      "Your purchase is ready. Open your secure access page to:",
      "  • open your Canva template",
      "  • download the setup guide PDF",
      "",
      accessPageUrl,
      "",
      "How this works:",
      "  1. Open your access page and choose “Open Template”.",
      "  2. Canva makes your own editable copy — the original stays private.",
      "  3. Replace the names, dates, wording and photographs.",
      "  4. Publish your website from Canva and share the link with guests.",
      "",
      `Support: ${supportEmail}`,
      "",
      "Licence reminder: your purchase is for one wedding or event. Please do",
      "not resell, redistribute or share the template access link.",
      "",
      "— BLANC WEDDINGS",
    ].join("\n");

    const message: EmailMessage = {
      to: order.customerEmail,
      subject: EMAIL_SUBJECT,
      body,
      orderNumber: order.orderNumber,
      sentAt: new Date().toISOString(),
      simulated: true,
    };

    // No provider call. The payload is logged so a developer can see exactly
    // what WOULD be sent during development.
    this.outbox.push(message);
    console.info(
      `[mock-email] to=${message.to} subject="${message.subject}" ` +
        `order=${message.orderNumber} (simulated — not sent)`,
    );

    return message;
  }
}

export const mockEmailDeliveryService = new MockEmailDeliveryService();
