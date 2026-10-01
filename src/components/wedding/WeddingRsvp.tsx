"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const inputClass =
  "w-full border-0 border-b border-line bg-transparent px-0.5 py-3 text-body text-ink outline-none transition-colors duration-300 placeholder:text-stone-soft focus:border-olive rounded-none";

/**
 * Quiet single-column RSVP form. Hairline fields, no cards, no rounding.
 * A submission is acknowledged inline (mock: nothing is sent anywhere).
 */
export function WeddingRsvp() {
  const [sent, setSent] = useState(false);
  const [attendance, setAttendance] = useState("accept");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <section id="rsvp" aria-labelledby="rsvp-title" className="scroll-mt-36 bg-shell py-24 lg:scroll-mt-48 lg:py-36">
        <Container size="narrow" className="text-center">
          <div role="status" className="border-y border-line py-14">
            <p className="font-serif text-title text-ink italic">
              Thank you — your reply is with us.
            </p>
            <p className="mx-auto mt-4 max-w-sm text-body text-stone">
              We can&apos;t wait to celebrate together on 24 August 2027.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="rsvp" aria-labelledby="rsvp-title" className="scroll-mt-36 bg-shell py-24 lg:scroll-mt-48 lg:py-36">
      <Container size="narrow">
        <Reveal className="text-center">
          <Eyebrow>Répondez s&apos;il vous plaît</Eyebrow>
          <h2
            id="rsvp-title"
            className="mt-5 font-serif text-heading font-light tracking-[0.02em] text-ink"
          >
            Will You Join Us?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-body text-stone">
            Kindly respond by 24 June 2027 — we are saving you a seat under
            the pavilion lights.
          </p>
        </Reveal>

        <Reveal delay={140} className="mt-14">
          <form onSubmit={onSubmit} className="flex flex-col gap-9">
            <div className="grid gap-9 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="rsvp-name" className="text-eyebrow uppercase text-stone">
                  Full name
                </label>
                <input
                  id="rsvp-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="rsvp-email" className="text-eyebrow uppercase text-stone">
                  Email
                </label>
                <input
                  id="rsvp-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <fieldset>
              <legend className="text-eyebrow uppercase text-stone">
                Attendance
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { value: "accept", label: "Joyfully accept" },
                  { value: "decline", label: "Regretfully decline" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "cursor-pointer border px-5 py-4 text-center text-body transition-colors duration-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-olive",
                      attendance === option.value
                        ? "border-ink bg-ink text-ivory"
                        : "border-line bg-transparent text-stone hover:border-stone hover:text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value={option.value}
                      checked={attendance === option.value}
                      onChange={() => setAttendance(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-9 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="rsvp-guests" className="text-eyebrow uppercase text-stone">
                  Number of guests
                </label>
                <select id="rsvp-guests" name="guests" defaultValue="2" className={inputClass}>
                  <option value="1">1 guest</option>
                  <option value="2">2 guests</option>
                  <option value="3">3 guests</option>
                  <option value="4">4 guests</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="rsvp-diet" className="text-eyebrow uppercase text-stone">
                  Dietary requirements
                </label>
                <input
                  id="rsvp-diet"
                  name="dietary"
                  type="text"
                  placeholder="Vegetarian, allergies…"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="rsvp-message" className="text-eyebrow uppercase text-stone">
                Message
              </label>
              <textarea
                id="rsvp-message"
                name="message"
                rows={4}
                placeholder="A song request, a memory, a note for the couple…"
                className={`${inputClass} resize-y`}
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center bg-ink px-9 py-4 text-eyebrow uppercase text-ivory transition-colors duration-300 ease-editorial hover:bg-brown"
            >
              Confirm attendance
            </button>
          </form>
        </Reveal>
      </Container>
    </section>
  );
}
