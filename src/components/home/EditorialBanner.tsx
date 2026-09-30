import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function EditorialBanner() {
  return (
    <section className="border-y border-line bg-brown text-ivory">
      <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <Image
          src="/images/editorial/plate-02.svg"
          alt="Editorial spread of a Blanc Weddings collection"
          width={1600}
          height={1000}
          unoptimized
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="h-auto w-full"
        />

        <div className="flex flex-col gap-6">
          <Eyebrow className="text-ivory/70">The studio approach</Eyebrow>
          <p className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
            A wedding website should feel like the two of you — not like a
            template.
          </p>
          <p className="max-w-md text-body text-ivory/75">
            Every design begins with a palette, a typographic voice and a fixed
            set of sections. What changes is everything you put inside them:
            your names, your story, your photographs, your guests.
          </p>
          <div>
            <Button
              href="/about"
              variant="outline"
              size="lg"
              className="border-ivory/35 text-ivory hover:border-ivory hover:bg-ivory/10"
            >
              Inside the studio
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
