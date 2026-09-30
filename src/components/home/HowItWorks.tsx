import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howItWorksHome } from "@/data/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24">
      <Container>
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow="How it works"
            title="Four quiet steps"
            description="From choosing a design to sending the link — no design software, no waiting for a print run."
          />
        </div>

        <ol className="mt-14 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {howItWorksHome.map((step) => (
            <li key={step.number} className="flex flex-col gap-4">
              <span className="font-serif text-title text-stone tabular-nums">
                {step.number}
              </span>
              <h3 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                {step.title}
              </h3>
              <p className="text-body text-stone">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
