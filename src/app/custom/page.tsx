import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { InquiryForm } from "@/components/custom/InquiryForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  customDeliverables,
  customProcess,
  customTimeline,
  customTiers,
} from "@/data/content";
import { formatPrice } from "@/lib/catalog";
import { productRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Custom Wedding Website Design",
  description:
    "A wedding website designed from a blank page for your celebration — your story, your palette, your photographs, delivered ready to publish.",
};

const emailHref =
  "mailto:hello@blancweddings.com?subject=Custom%20wedding%20website%20enquiry";

const underlineLink =
  "text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink";

export default async function CustomPage() {
  const product = await productRepository.getBySlug("custom-wedding-website");

  if (!product) {
    return null;
  }

  return (
    <>
      <section className="py-14 lg:py-20">
        <Container className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col gap-7">
            <SectionHeading
              as="h1"
              eyebrow="Need something personal?"
              title="Custom wedding website design"
              description={product.description}
            />

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button href={emailHref} size="lg">
                Start the conversation
              </Button>
              <Link href="/shop" className={underlineLink}>
                Or browse ready-made templates
              </Link>
            </div>

            <p className="text-body-sm text-stone">
              {formatPrice(product)} · {customTimeline}
            </p>
          </div>

          <BrowserFrame url="yourwedding.com">
            <Image
              src={product.coverImage}
              alt="Preview of a custom Blanc Weddings website"
              width={1200}
              height={750}
              unoptimized
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="h-auto w-full"
            />
          </BrowserFrame>
        </Container>
      </section>

      <section className="border-t border-line py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="What you receive"
            title="Made for your day"
            description="A complete website built from a blank page — not a template with the edges filed off."
          />

          <ul className="mt-12 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {customDeliverables.map((item) => (
              <li key={item.title} className="flex flex-col gap-4">
                <h2 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                  {item.title}
                </h2>
                <p className="text-body text-stone">{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line bg-cream/45 py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow>The process</Eyebrow>
            <p className="max-w-xs text-body text-stone">
              Four steps, one designer, no agency layers.
            </p>
          </div>

          <ol className="flex flex-col border-t border-line">
            {customProcess.map((step) => (
              <li
                key={step.number}
                className="grid gap-x-8 gap-y-3 border-b border-line py-8 sm:grid-cols-[3.5rem_1fr]"
              >
                <span className="font-serif text-title text-stone tabular-nums">
                  {step.number}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                    {step.title}
                  </h3>
                  <p className="max-w-xl text-body text-stone">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Investment"
            title="Three ways to begin"
            description="Fixed starting prices. Your exact quote follows a short conversation about scope, and is confirmed before any work begins."
          />

          <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-3">
            {customTiers.map((tier) => (
              <li
                key={tier.name}
                className="flex flex-col gap-4 bg-shell p-8 lg:p-10"
              >
                <h3 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                  {tier.name}
                </h3>
                <p className="font-serif text-display font-light tabular-nums">
                  {tier.price}
                </p>
                <p className="text-body text-stone">{tier.note}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-body-sm text-stone">{customTimeline}</p>
        </Container>
      </section>

      <section id="enquiry" className="border-t border-line bg-cream/45 py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="flex flex-col gap-5">
            <Eyebrow>Start the conversation</Eyebrow>
            <h2 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
              Tell us about your day
            </h2>
            <p className="max-w-sm text-body text-stone">
              A custom design is quoted after a short conversation, so there is
              no instant checkout here. Tell us your date, your palette and
              anything you already have in mind — we reply within two working
              days.
            </p>
          </div>

          <div className="border border-line bg-shell p-8 lg:p-10">
            <InquiryForm />
          </div>
        </Container>
      </section>
    </>
  );
}
