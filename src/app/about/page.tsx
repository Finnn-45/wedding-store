import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About the Studio",
  description:
    "BLANC WEDDINGS is an independent digital design studio making wedding website templates for modern couples.",
};

const principles = [
  {
    title: "Editorial by default",
    text: "Each design begins with a palette and a typographic voice, then a fixed set of sections. Restraint is the point.",
  },
  {
    title: "One payment, no subscription",
    text: "Templates are digital products. Buy once, customize at your pace, publish under your own domain.",
  },
  {
    title: "Nothing to install",
    text: "No design software, no exports, no plugins. Everything is edited in the browser and published instantly.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="py-14 lg:py-20">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              as="h1"
              eyebrow="An independent studio"
              title="Digital wedding design, quietly done"
              description="Blanc Weddings makes wedding website templates for couples who care how things read — and who would rather not build a website from scratch."
              size="large"
            />
          </div>
        </Container>
      </section>

      <Container>
        <Image
          src="/images/editorial/plate-01.svg"
          alt="Editorial spread of a Blanc Weddings design"
          width={1600}
          height={1000}
          unoptimized
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </Container>

      <section className="py-16 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <Eyebrow>What we do</Eyebrow>
          <div className="flex max-w-2xl flex-col gap-6 text-lead text-stone">
            <p>
              We design complete wedding websites: the announcement, the story,
              the details, the gallery and the RSVP — arranged like a printed
              piece, delivered as a website.
            </p>
            <p>
              Everything is made in house, and every template is a finished
              design rather than a blank builder. What changes when you buy one
              is everything you put inside it: your names, your photographs,
              your version of the day.
            </p>
            <p>
              We keep the studio small on purpose. Templates ship with the same
              sections every couple needs, so nothing is half-built and nothing
              is left for you to design.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-cream/45 py-16 lg:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Image
            src="/images/editorial/plate-03.svg"
            alt="Detail of a Blanc Weddings layout"
            width={1600}
            height={1000}
            unoptimized
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="h-auto w-full"
          />
          <div className="flex flex-col gap-6">
            <Eyebrow>Our position</Eyebrow>
            <p className="max-w-xl font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
              A wedding website is stationery. It should be considered, quiet
              and unmistakably yours.
            </p>
            <p className="max-w-md text-body text-stone">
              So we design the way a small print studio would: a limited
              collection, a fixed palette per design, and typography that does
              the work instead of decoration.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow="How we work" title="Three commitments" />
          <ul className="mt-12 grid gap-12 border-t border-line pt-12 lg:grid-cols-3 lg:gap-10">
            {principles.map((principle, index) => (
              <li key={principle.title} className="flex flex-col gap-4">
                <span className="font-serif text-title text-stone tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                  {principle.title}
                </h2>
                <p className="text-body text-stone">{principle.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="/shop" size="lg">
              Browse the collection
            </Button>
            <Link
              href="/custom"
              className="text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              Or have something designed for you
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
