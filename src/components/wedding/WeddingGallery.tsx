import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { galleryImages, type GalleryImage } from "@/data/wedding";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/**
 * One shared frame so every plate in the essay crops the same way, with one
 * quiet grade (see `.grade-editorial`) unifying mixed sources.
 */
function GalleryImageFrame({
  image,
  className,
  sizes,
}: {
  image: GalleryImage;
  className: string;
  sizes: string;
}) {
  return (
    <figure className={cn("relative w-full overflow-hidden bg-cream", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        style={image.position ? { objectPosition: image.position } : undefined}
        className="grade-editorial object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
      />
    </figure>
  );
}

/* Staggered trio: descending aspect ratios with small vertical offsets give
   the set a hand-placed rhythm instead of a locked grid. */
const trioAspect = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[3/4]"] as const;
const trioOffset = ["", "lg:mt-16", "lg:mt-6"] as const;
const figureSizes = "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw";

/**
 * Photo essay in three moves: a staggered trio, one full-width plate, then a
 * closing pair beside a line from the invitation. Mobile reads as a single
 * calm column; the asymmetry only appears from `lg` up.
 */
export function WeddingGallery() {
  const trio = galleryImages.slice(0, 3);
  const [plate] = galleryImages.slice(3, 4);
  const pair = galleryImages.slice(4, 6);

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="py-24 lg:py-36">
      <Container>
        <Reveal className="mx-auto max-w-xl text-center">
          <Eyebrow>Moments</Eyebrow>
          <h2
            id="gallery-title"
            className="mt-5 font-serif text-heading font-light tracking-[0.02em] text-ink"
          >
            Gallery
          </h2>
          <p className="mt-5 text-body text-stone">
            Fragments of us — golden evenings, quiet mornings, and everyone we
            love in between.
          </p>
        </Reveal>

        {/* Move one — staggered trio */}
        <div className="mt-14 grid items-start gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6">
          {trio.map((image, index) => (
            <Reveal
              key={image.src}
              delay={index * 120}
              className={cn(
                "group",
                index === 0 && "sm:col-span-2 lg:col-span-1",
                trioOffset[index],
              )}
            >
              <GalleryImageFrame
                image={image}
                className={trioAspect[index]}
                sizes={figureSizes}
              />
            </Reveal>
          ))}
        </div>

        {/* Move two — full-width plate */}
        {plate ? (
          <Reveal delay={80} className="group mt-4 lg:mt-6">
            <GalleryImageFrame
              image={plate}
              className="aspect-[3/2] sm:aspect-[16/10] lg:aspect-[16/9]"
              sizes="100vw"
            />
          </Reveal>
        ) : null}

        {/* Move three — closing pair beside a line from the invitation */}
        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-6">
          {pair.map((image, index) => (
            <Reveal key={image.src} delay={index * 120} className="group">
              <GalleryImageFrame
                image={image}
                className="aspect-[4/5]"
                sizes={figureSizes}
              />
            </Reveal>
          ))}
          <Reveal delay={260} className="flex h-full items-center sm:col-span-2 lg:col-span-1">
            <blockquote className="w-full border-t border-line pt-6 text-center lg:border-t-0 lg:pt-0 lg:text-left">
              <p className="font-serif text-title-sm text-ink italic">
                “One garden, one evening, and everyone we love in it.”
              </p>
              <footer className="mt-4 text-eyebrow uppercase text-stone">
                Julia &amp; Alex
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
