/**
 * Payment details for the MANUAL flow (the production default): the customer
 * transfers first, an admin then confirms the order paid in /admin/orders.
 *
 * All values are NEXT_PUBLIC_ on purpose — they are shown to buyers (account
 * number, WhatsApp). Set them in Vercel (Settings → Environment Variables) and
 * redeploy; while a value is missing the confirmation screen falls back to
 * "contact us for instructions" instead of showing placeholder numbers.
 */

export type PaymentInstructions = {
  /** e.g. "Bank transfer (BCA)" or "QRIS" — null when unset. */
  method: string | null;
  /** Account / wallet number to transfer to. */
  account: string | null;
  /** Account holder name. */
  accountName: string | null;
  /** Store WhatsApp for the proof button: digits only, 62812… form. */
  whatsapp: string | null;
  /** Fallback contact when WhatsApp is unset. */
  supportEmail: string;
};

function optional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getPaymentInstructions(): PaymentInstructions {
  const whatsappDigits =
    optional(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)?.replace(/\D/g, "") ?? null;
  return {
    method: optional(process.env.NEXT_PUBLIC_PAYMENT_METHOD),
    account: optional(process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT),
    accountName: optional(process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME),
    whatsapp:
      whatsappDigits && whatsappDigits.length >= 7 ? whatsappDigits : null,
    supportEmail:
      optional(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) ??
      "hello@blancweddings.com",
  };
}
