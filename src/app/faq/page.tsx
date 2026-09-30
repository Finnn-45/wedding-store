import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/data/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Blanc Weddings templates: delivery, customization, colors and fonts, mobile layouts, RSVP and photos.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  const items = faqs.map((faq) => ({
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        // Constant data, but hardened anyway: escaping "<" means no string
        // can ever close the script element (standard inline-JSON guard).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="py-14 lg:py-20">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              as="h1"
              eyebrow="Questions"
              title="Frequently asked"
              description="Everything couples usually ask before buying a template — delivery, customization, and what happens after you purchase."
            />
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-24">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>{faqs.length} answers</Eyebrow>
            <p className="max-w-xs text-body text-stone">
              Still deciding? Read about the studio, or see how a template
              becomes your website.
            </p>

            <ul className="flex flex-col gap-3 text-body-sm">
              <li>
                <Link
                  href="/about"
                  className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
                >
                  About the studio
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/custom"
                  className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
                >
                  Custom design service
                </Link>
              </li>
            </ul>
          </div>

          <Accordion items={items} />
        </Container>
      </section>

      <section className="border-t border-line bg-cream/45 py-16 lg:py-24">
        <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-xl flex-col gap-5">
            <Eyebrow>Anything else</Eyebrow>
            <h2 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
              Browse the collection
            </h2>
            <p className="text-body text-stone">
              Every product page lists the palette, the sections included and
              exactly how the design works — usually answering the rest.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="/shop" size="lg">
              Browse templates
            </Button>
            <Link
              href="/about"
              className="text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              Read about the studio
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
