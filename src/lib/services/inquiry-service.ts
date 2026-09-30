import { randomBytes } from "node:crypto";

/**
 * Custom design enquiries.
 *
 * A custom design inquiry is NOT a purchase: there is no checkout, no payment
 * and no delivery. It is a conversation request, kept separate from the order
 * system on purpose.
 *
 * MOCK IMPLEMENTATION ONLY — submissions are logged on the server and returned
 * to the UI so the form can confirm. Nothing is emailed and nothing is stored
 * in a database. Production will write to a `custom_inquiries` table and send a
 * notification.
 */
export type InquiryInput = {
  name: string;
  email: string;
  whatsapp?: string | null;
  weddingDate?: string | null;
  preferredStyle?: string | null;
  budget?: string | null;
  timeline?: string | null;
  notes?: string | null;
};

export type InquiryResult =
  | { ok: true; reference: string }
  | { ok: false; code: "invalid_inquiry" | "server_error" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTHS = {
  name: 120,
  email: 254,
  whatsapp: 20,
  weddingDate: 40,
  preferredStyle: 60,
  budget: 40,
  timeline: 40,
  notes: 2000,
} as const;

const clean = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
};

export function parseInquiryInput(body: unknown): InquiryInput | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;

  const name = clean(raw.name, MAX_LENGTHS.name);
  const email = clean(raw.email, MAX_LENGTHS.email);
  if (!name || !email || !EMAIL_PATTERN.test(email)) return null;

  return {
    name,
    email,
    whatsapp: clean(raw.whatsapp, MAX_LENGTHS.whatsapp),
    weddingDate: clean(raw.weddingDate, MAX_LENGTHS.weddingDate),
    preferredStyle: clean(raw.preferredStyle, MAX_LENGTHS.preferredStyle),
    budget: clean(raw.budget, MAX_LENGTHS.budget),
    timeline: clean(raw.timeline, MAX_LENGTHS.timeline),
    notes: clean(raw.notes, MAX_LENGTHS.notes),
  };
}

export interface InquiryService {
  submit(input: InquiryInput): Promise<InquiryResult>;
}

class MockInquiryService implements InquiryService {
  async submit(input: InquiryInput): Promise<InquiryResult> {
    try {
      const reference = `INQ-${randomBytes(4).toString("hex").toUpperCase()}`;
      // Simulated: no email, no database, no CRM.
      console.info(
        `[mock-inquiry] ${reference} from ${input.email} ` +
          `(style=${input.preferredStyle ?? "n/a"} budget=${input.budget ?? "n/a"}) ` +
          "— simulated, not stored",
      );
      return { ok: true, reference };
    } catch (error) {
      console.error("[inquiry] submission failed:", error);
      return { ok: false, code: "server_error" };
    }
  }
}

export const mockInquiryService: InquiryService = new MockInquiryService();
