import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs, howItWorksHome } from "@/data/content";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Four quiet steps from choosing a wedding website template to sharing one link with your guests. No design software, nothing posted.",
};

/** First four questions cover the process; the full list lives at /faq. */
const processFaqs = faqs.slice(0, 4);

export default function HowItWorksPage() {
  const faqItems = processFaqs.map((faq) => ({
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <>
      <section className="py-14 lg:py-20">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              as="h1"
              eyebrow="How it works"
              title="Four quiet steps"
              description="From choosing a design to sending the link — no design software, no print run, nothing posted to you."
            />
          </div>
        </Container>
      </section>

      <Container>
        <Image
          src="/images/editorial/plate-02.svg"
          alt="Editorial spread showing the four steps of the process"
          width={1600}
          height={1000}
          unoptimized
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </Container>

      <section className="py-16 lg:py-24">
        <Container>
          <ol className="grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {howItWorksHome.map((step) => (
              <li key={step.number} className="flex flex-col gap-4">
                <span className="font-serif text-display text-stone tabular-nums">
                  {step.number}
                </span>
                <h2 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                  {step.title}
                </h2>
                <p className="text-body text-stone">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-line bg-cream/45 py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow>What you receive</Eyebrow>
            <p className="max-w-xs text-body text-stone">
              Every purchase includes the same core of a complete wedding
              website, whichever design you choose.
            </p>
          </div>

          <ul className="grid gap-x-10 gap-y-5 border-t border-line pt-8 sm:grid-cols-2">
            {products[0]?.features.map((feature: string) => (
              <li
                key={feature}
                className="flex items-baseline gap-4 border-b border-line pb-5 text-body"
              >
                <span aria-hidden="true" className="text-stone tabular-nums">
                  —
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Questions"
              title="Before you begin"
              description="The four things couples ask most often about the process."
            />
            <p className="max-w-sm text-body text-stone">
              The complete list lives on the{" "}
              <Link
                href="/faq"
                className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
              >
                FAQ page
              </Link>
              .
            </p>
          </div>

          <Accordion items={faqItems} />
        </Container>
      </section>

      <section className="border-t border-line bg-cream/45 py-16 lg:py-24">
        <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-xl flex-col gap-5">
            <Eyebrow>Ready when you are</Eyebrow>
            <h2 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
              Choose a design, and start today
            </h2>
            <p className="text-body text-stone">
              Purchase takes a minute; access is immediate. Everything after
              that happens at your own pace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="/shop" size="lg">
              Browse templates
            </Button>
            <Link
              href="/custom"
              className="text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              Or have one designed for you
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
