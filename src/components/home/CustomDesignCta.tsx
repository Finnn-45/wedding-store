import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function CustomDesignCta() {
  return (
    <section id="custom" className="border-t border-line bg-shell py-16 lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          <Eyebrow>Need something personal?</Eyebrow>
          <h2 className="font-serif text-heading font-light uppercase tracking-[0.02em]">
            Custom wedding website design
          </h2>
          <p className="max-w-lg text-lead text-stone">
            Have your wedding website designed specifically for your
            celebration — your story, your palette, your photographs, built
            from a blank page.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="/custom" size="lg">
              Explore Custom Design
            </Button>
            <span className="text-body-sm text-stone">Starting at $250</span>
          </div>
        </div>

        <div className="overflow-hidden bg-cream">
          <Image
            src="/images/custom-wedding-website/card.svg"
            alt="Custom wedding website design, made for one celebration"
            width={1200}
            height={1500}
            unoptimized
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
    </section>
  );
}
