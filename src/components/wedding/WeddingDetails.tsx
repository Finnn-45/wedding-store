import Image from "next/image";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ceremony, dressCodeSwatches, reception, weddingDetails } from "@/data/wedding";
import { Reveal } from "./Reveal";

function EventBlock({
  title,
  date,
  time,
  venue,
  place,
  mapsUrl,
}: {
  title: string;
  date: string;
  time: string;
  venue: string;
  place: string;
  mapsUrl: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h3 className="font-serif text-title-sm tracking-[0.08em] text-ink uppercase">
        {title}
      </h3>
      <p className="font-serif text-heading-sm font-light text-ink">{date}</p>
      <p className="text-eyebrow uppercase text-stone">{time}</p>
      <p className="mt-2 text-body text-ink">{venue}</p>
      <p className="text-body-sm text-stone">{place}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-eyebrow uppercase text-ink transition-colors duration-300 hover:border-ink"
      >
        View location
      </a>
    </div>
  );
}

/**
 * Event, dress code and practical details. One quiet column: ceremony and
 * reception separated by a hairline, a venue plate, palette swatches, then
 * accordions for everything useful.
 */
export function WeddingDetails() {
  return (
    <>
      <section id="event" aria-labelledby="event-title" className="bg-shell py-24 lg:py-36">
        <Container size="narrow" className="text-center">
          <Reveal>
            <Eyebrow>When &amp; where</Eyebrow>
            <h2
              id="event-title"
              className="mt-5 font-serif text-heading font-light tracking-[0.02em] text-ink"
            >
              The Celebration
            </h2>
          </Reveal>

          <Reveal delay={120} className="mt-14 flex flex-col gap-12">
            <EventBlock {...ceremony} />
            <div aria-hidden="true" className="mx-auto h-px w-24 bg-line" />
            <EventBlock {...reception} />
          </Reveal>

          <Reveal delay={200} className="mt-16">
            <figure className="overflow-hidden">
              <Image
                src="/images/wedding/venue.jpg"
                alt="The reception table dressed with ivory linen and glassware"
                width={1600}
                height={1000}
                sizes="(min-width: 1024px) 46rem, 100vw"
                className="grade-editorial aspect-[16/9] w-full object-cover"
              />
              <figcaption className="mt-4 text-body-sm text-stone">
                The Palm Courtyard, set for dinner — Jakarta
              </figcaption>
            </figure>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="dress-title" className="py-20 lg:py-28">
        <Container size="narrow" className="text-center">
          <Reveal>
            <Eyebrow>The palette</Eyebrow>
            <h2
              id="dress-title"
              className="mt-5 font-serif text-heading-sm font-light tracking-[0.06em] text-ink uppercase"
            >
              Dress Code
            </h2>
            <p className="mt-4 font-serif text-title-sm text-ink italic">
              Formal / garden elegant
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-8 flex items-center justify-center gap-5">
              {dressCodeSwatches.map((swatch) => (
                <li key={swatch.name} className="flex flex-col items-center gap-2">
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: swatch.hex }}
                    className="block h-9 w-9 rounded-full border border-line"
                  />
                  <span className="text-[0.625rem] tracking-[0.18em] text-stone uppercase">
                    {swatch.name}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="details-title" className="pb-24 lg:pb-36">
        <Container size="narrow">
          <Reveal>
            <Eyebrow className="text-center">Good to know</Eyebrow>
            <h2
              id="details-title"
              className="mt-5 text-center font-serif text-heading-sm font-light tracking-[0.02em] text-ink"
            >
              Wedding Details
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-10">
            <Accordion
              items={weddingDetails.map((item) => ({ ...item }))}
            />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
