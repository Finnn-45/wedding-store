"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { inquiryBudgets, inquiryTimelines } from "@/data/content";
import { styleLabels, type ProductStyle } from "@/data/products";

/** 16px so iOS Safari does not zoom on focus. */
const field =
  "w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-stone-soft focus:border-ink";

const label = "text-body-sm text-stone";

/**
 * Custom design enquiry form.
 *
 * Deliberately NOT a checkout: no payment, no order, no delivery. A submission
 * is validated and logged by the mock inquiry service; nothing is stored in a
 * database yet.
 */
export function InquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          whatsapp: String(data.get("whatsapp") ?? ""),
          weddingDate: String(data.get("weddingDate") ?? ""),
          preferredStyle: String(data.get("preferredStyle") ?? ""),
          budget: String(data.get("budget") ?? ""),
          timeline: String(data.get("timeline") ?? ""),
          notes: String(data.get("notes") ?? ""),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        reference?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        console.error("Inquiry failed:", response.status, payload);
        setError("Something went wrong. Please try again.");
        return;
      }

      setReference(payload.reference ?? null);
      form.reset();
    } catch (networkError) {
      console.error("Inquiry request failed:", networkError);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="flex flex-col gap-5 border border-line bg-shell p-8 lg:p-10">
        <p className="font-serif text-title">Thank you — we have your note.</p>
        <p className="text-body text-stone">
          Your enquiry reference is{" "}
          <span className="text-ink tabular-nums">{reference}</span>. We reply
          within two working days with questions and a quote.
        </p>
        <p className="text-body-sm text-stone">
          This is a development build: the enquiry was logged on the server but
          not emailed or stored in a database.
        </p>
        <div>
          <Button variant="outline" onClick={() => setReference(null)}>
            Send another enquiry
          </Button>
        </div>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>Full name *</span>
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Email *</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>WhatsApp (optional)</span>
          <input
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Wedding date (optional)</span>
          <input name="weddingDate" type="date" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Preferred style</span>
          <select name="preferredStyle" defaultValue="" className={field}>
            <option value="">No preference</option>
            {(Object.keys(styleLabels) as ProductStyle[]).map((style) => (
              <option key={style} value={style}>
                {styleLabels[style]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Budget</span>
          <select name="budget" defaultValue="" className={field}>
            <option value="">Not sure yet</option>
            {inquiryBudgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>Timeline</span>
          <select name="timeline" defaultValue="" className={field}>
            <option value="">Just exploring</option>
            {inquiryTimelines.map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>About your day</span>
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="Your palette, your photographs, anything you already have in mind."
            className={`${field} resize-y`}
          />
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-line px-4 py-3 text-body-sm text-ink"
        >
          {error}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Sending…" : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
