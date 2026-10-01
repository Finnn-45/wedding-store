import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "./Reveal";

/** Two-column editorial portrait — deliberately not a card. */
export function WeddingStory() {
  return (
    <section id="story" aria-labelledby="story-title" className="py-24 lg:py-36">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <figure className="overflow-hidden">
              <Image
                src="/images/wedding/story.jpg"
                alt="Julia and Alex laughing under falling confetti after the engagement"
                width={1200}
                height={1500}
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="grade-editorial aspect-[4/5] w-full object-cover"
              />
            </figure>
          </Reveal>
          <div className="flex max-w-lg flex-col items-start gap-6">
            <Reveal>
              <Eyebrow>Chapter one</Eyebrow>
            </Reveal>
            <Reveal delay={100}>
              <h2
                id="story-title"
                className="font-serif text-heading font-light tracking-[0.02em] text-ink"
              >
                Our Story
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <div className="flex flex-col gap-5 text-body text-stone">
                <p>
                  It began the way the best stories do — unplanned. A shared
                  table at a friend&apos;s dinner in Jakarta, one conversation
                  that outlasted the candles, and a walk home neither of us
                  wanted to end.
                </p>
                <p>
                  Eight years, three cities and countless slow Sunday mornings
                  later, we are gathering everyone we love in one garden, for
                  one evening, to say the simplest thing we know.
                </p>
                <p className="font-serif text-title-sm text-ink italic">
                  We can&apos;t wait to celebrate with you.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
