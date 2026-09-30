import type { Order } from "@/lib/repositories";

/**
 * WhatsApp delivery abstraction.
 *
 * MOCK IMPLEMENTATION ONLY — no WhatsApp Cloud API, no Twilio, no provider of
 * any kind is connected, and none may be added until go-live. The service
 * builds the message and records it so the confirmation page can show exactly
 * what would be sent.
 *
 * Like the email, the message links to the SECURE ACCESS PAGE rather than to
 * Canva directly, so a forwarded chat does not hand over the template.
 */
export type WhatsAppMessage = {
  /** E.164-ish number, normalised by the checkout validator. */
  to: string;
  /** Rendered text, ready for the provider's send API. */
  body: string;
  orderNumber: string;
  sentAt: string;
  simulated: true;
};

export interface WhatsAppDeliveryService {
  sendPurchaseMessage(params: {
    order: Order;
    accessPageUrl: string;
  }): Promise<WhatsAppMessage>;
}

class MockWhatsAppDeliveryService implements WhatsAppDeliveryService {
  private readonly outbox: WhatsAppMessage[] = [];

  lastMessage(): WhatsAppMessage | null {
    return this.outbox.at(-1) ?? null;
  }

  async sendPurchaseMessage({
    order,
    accessPageUrl,
  }: {
    order: Order;
    accessPageUrl: string;
  }): Promise<WhatsAppMessage> {
    const firstName = order.customerName.trim().split(" ")[0];
    const templates = order.items.map((item) => item.productName).join(", ");

    const body = [
      `Hi ${firstName} 👋`,
      "",
      "Thank you for your purchase from BLANC WEDDINGS.",
      "",
      "Your template is ready.",
      "",
      `Order: ${order.orderNumber}`,
      `Template: ${templates}`,
      "",
      "Access your template and setup guide here:",
      accessPageUrl,
      "",
      "From there you can open your Canva template, download the setup guide,",
      "personalise it and publish your website.",
      "",
      "Thank you for choosing BLANC WEDDINGS.",
    ].join("\n");

    const message: WhatsAppMessage = {
      to: order.customerWhatsApp,
      body,
      orderNumber: order.orderNumber,
      sentAt: new Date().toISOString(),
      simulated: true,
    };

    this.outbox.push(message);
    console.info(
      `[mock-whatsapp] to=${message.to} order=${message.orderNumber} ` +
        "(simulated — not sent)",
    );

    return message;
  }
}

export const mockWhatsAppDeliveryService = new MockWhatsAppDeliveryService();
