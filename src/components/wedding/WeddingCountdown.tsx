"use client";

import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { wedding } from "@/data/wedding";
import { Reveal } from "./Reveal";

const target = new Date(wedding.dateISO).getTime();

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diffParts(now: number): Parts | null {
  const distance = target - now;
  if (distance <= 0) return null;
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

const pad = (value: number, length = 2) =>
  String(value).padStart(length, "0");

/** Quiet typographic countdown — no boxes, no animation noise. */
export function WeddingCountdown() {
  const [parts, setParts] = useState<Parts | null>(() => diffParts(Date.now()));

  useEffect(() => {
    const tick = () => setParts(diffParts(Date.now()));
    /* Resync immediately: the prerendered HTML carries build-time numbers, so
       the first client render must correct them before the timer takes over. */
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units: { value: string; label: string }[] = parts
    ? [
        { value: pad(parts.days, parts.days >= 100 ? 3 : 2), label: "Days" },
        { value: pad(parts.hours), label: "Hours" },
        { value: pad(parts.minutes), label: "Minutes" },
        { value: pad(parts.seconds), label: "Seconds" },
      ]
    : [];

  return (
    <section aria-label="Countdown to the wedding" className="py-20 lg:py-28">
      <Container size="narrow" className="text-center">
        <Reveal>
          <Eyebrow>Counting down to the day</Eyebrow>
        </Reveal>
        {parts ? (
          <Reveal delay={120}>
            <dl className="mt-10 flex items-start justify-center gap-3 sm:gap-8 lg:gap-12">
              {units.map((unit, index) => (
                <Fragment key={unit.label}>
                  {/* flex-col-reverse keeps the markup valid (dt before dd)
                      while the value still reads above its own label. */}
                  <div className="flex min-w-12 flex-col-reverse items-center gap-2 sm:min-w-20 sm:gap-3">
                    <dt className="text-eyebrow uppercase text-stone">
                      {unit.label}
                    </dt>
                    <dd
                      suppressHydrationWarning
                      className="font-serif text-4xl font-light text-ink tabular-nums sm:text-6xl lg:text-7xl"
                    >
                      {unit.value}
                    </dd>
                  </div>
                  {index < units.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="mt-3 font-serif text-2xl text-line sm:mt-5 sm:text-3xl lg:text-4xl"
                    >
                      ·
                    </span>
                  ) : null}
                </Fragment>
              ))}
            </dl>
          </Reveal>
        ) : (
          <p className="mt-10 font-serif text-heading-sm text-ink italic">
            Just married — thank you for celebrating with us.
          </p>
        )}
      </Container>
    </section>
  );
}
