import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { wedding } from "@/data/wedding";
import { Reveal } from "./Reveal";

/**
 * Full-screen editorial hero: one photograph, quiet overlay, tracked
 * eyebrow, serif names, date and place — then a single invitation CTA.
 *
 * The store header is suppressed on /wedding (see SiteChrome), so the section
 * only has to clear the microsite's own 3.5rem sticky nav. The demo banner
 * above the nav scrolls away, so the hero deliberately measures full-bleed
 * against the nav alone.
 */
export function WeddingHero() {
  return (
    <section
      id="home"
      aria-labelledby="wedding-hero-title"
      className="relative flex min-h-[calc(100svh-3.5rem)] items-center justify-center overflow-hidden bg-ink"
    >
      <Image
        src="/images/wedding/hero.jpg"
        alt="Julia and Alex together in soft evening light"
        fill
        priority
        sizes="100vw"
        className="grade-editorial object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:linear-gradient(to_bottom,rgba(27,26,24,0.6),rgba(27,26,24,0.32)_38%,rgba(27,26,24,0.34)_62%,rgba(27,26,24,0.68))]"
      />

      <Container className="relative flex flex-col items-center py-24 text-center text-ivory">
        <Reveal>
          <Eyebrow className="text-ivory/80">We are getting married</Eyebrow>
        </Reveal>
        <Reveal delay={120}>
          <h1
            id="wedding-hero-title"
            className="mt-6 font-serif text-display-xl font-light tracking-[0.03em] uppercase"
          >
            Julia <span className="italic">&amp;</span> Alex
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-serif text-title-sm tracking-[0.2em] sm:text-title">
            {wedding.dateDisplay}
          </p>
          <p className="mt-3 text-eyebrow uppercase text-ivory/80">
            {wedding.city}
          </p>
        </Reveal>
        <Reveal delay={320}>
          <a
            href="#story"
            className="mt-10 inline-flex items-center justify-center border border-ivory/70 px-10 py-4 text-eyebrow uppercase text-ivory transition-colors duration-300 ease-editorial hover:bg-ivory hover:text-ink"
          >
            Open invitation
          </a>
        </Reveal>
      </Container>

      <a
        href="#story"
        aria-label="Scroll to our story"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/70 transition-colors hover:text-ivory sm:flex"
      >
        <span className="text-eyebrow uppercase">Scroll</span>
        <span aria-hidden="true" className="block h-8 w-px bg-ivory/50" />
      </a>
    </section>
  );
}
