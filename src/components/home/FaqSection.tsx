import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/data/content";

export function FaqSection() {
  const items = faqs.map((faq) => ({
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <section id="faq" className="border-t border-line py-16 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="Questions"
            title="FAQ"
            description="Everything couples usually ask before buying a template."
          />
          <p className="max-w-sm text-body text-stone">
            Still deciding?{" "}
            <Link
              href="/about"
              className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              Read about the studio
            </Link>{" "}
            or{" "}
            <Link
              href="/custom"
              className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              ask about a custom website
            </Link>
            .
          </p>
        </div>

        <Accordion items={items} />
      </Container>
    </section>
  );
}
