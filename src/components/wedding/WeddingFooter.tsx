import { Container } from "@/components/ui/Container";
import { wedding } from "@/data/wedding";
import { Reveal } from "./Reveal";

/** Quiet sign-off: names, date, one line of love. */
export function WeddingFooter() {
  return (
    <footer className="border-t border-line bg-shell">
      <Container className="flex flex-col items-center py-16 text-center lg:py-24">
        <Reveal>
          <p className="font-serif text-title tracking-[0.24em] text-ink uppercase">
            {wedding.couple}
          </p>
          <p className="mt-4 font-serif text-body text-stone">
            {wedding.dateDisplay}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div aria-hidden="true" className="mt-8 flex items-center gap-4">
            <span className="h-px w-12 bg-line" />
            <span className="font-serif text-lg text-olive italic">J · A</span>
            <span className="h-px w-12 bg-line" />
          </div>
          <p className="mx-auto mt-8 max-w-sm font-serif text-lead text-ink italic">
            “With love, we invite you to celebrate with us.”
          </p>
        </Reveal>
      </Container>
    </footer>
  );
}
