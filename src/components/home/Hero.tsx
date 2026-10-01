import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { productRepository } from "@/lib/repositories";

const assurances = [
  "Complete wedding websites",
  "Instant digital delivery",
  "Mobile responsive",
];

/** A website shown the way a couple would first see it: on real devices. */
export async function Hero() {
  // The secondary call to action opens the newest design's public demo instead
  // of a hard-coded slug, so it follows the catalogue as it changes.
  const [lead] = await productRepository.listFeatured(1);

  return (
    <section className="relative overflow-hidden pb-16 pt-12 lg:pb-32 lg:pt-20">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div className="flex max-w-xl flex-col items-start gap-7">
            <Eyebrow>Digital wedding websites for modern couples</Eyebrow>

            <h1 className="font-serif text-display font-light uppercase tracking-display leading-[0.98]">
              Your wedding,
              <br />
              beautifully
              <br />
              online.
            </h1>

            <p className="max-w-md text-lead text-stone">
              Elegant digital wedding website templates designed for modern
              celebrations.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button href="/shop?type=wedding-website" size="lg">
                Shop Wedding Websites
              </Button>
              <Button href={lead?.demoUrl ?? "/shop"} variant="outline" size="lg">
                See a live demo
              </Button>
            </div>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-stone">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1 w-1 bg-stone/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative pb-10 lg:pb-16">
            {/* Desktop screen */}
            <figure className="overflow-hidden rounded-xs border border-line bg-shell shadow-[0_40px_80px_-60px_rgba(27,26,24,0.55)]">
              <div className="flex items-center gap-1.5 border-b border-line bg-cream/70 px-4 py-2.5">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone/35" />
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone/35" />
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone/35" />
                <span aria-hidden="true" className="ml-3 h-2 w-24 bg-stone/15 lg:w-40" />
              </div>
              <Image
                src="/images/modern-ivory/home.svg"
                alt="The Modern Ivory wedding website shown on a desktop screen"
                width={1600}
                height={1000}
                unoptimized
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="h-auto w-full"
              />
            </figure>

            {/* Laptop */}
            <figure className="absolute -left-8 bottom-2 hidden w-[54%] lg:block">
              <div className="overflow-hidden rounded-xs border border-line bg-shell shadow-[0_30px_60px_-45px_rgba(27,26,24,0.5)]">
                <Image
                  src="/images/modern-ivory/details.svg"
                  alt="The Modern Ivory wedding details page on a laptop"
                  width={1600}
                  height={1000}
                  unoptimized
                  sizes="28vw"
                  className="h-auto w-full"
                />
              </div>
              <div
                aria-hidden="true"
                className="mx-auto -mt-px h-2.5 w-[112%] -translate-x-[6%] rounded-b-lg bg-ink/10"
              />
            </figure>

            {/* Phone */}
            <Image
              src="/images/modern-ivory/mobile.svg"
              alt="The Modern Ivory wedding website on a phone"
              width={860}
              height={1500}
              unoptimized
              sizes="16vw"
              className="absolute -right-1 bottom-0 w-[26%] drop-shadow-[0_25px_45px_rgba(27,26,24,0.35)] lg:-right-6 lg:w-[24%]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
