import Image from "next/image";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import type { Product } from "@/data/products";

const viewLabels: Record<string, string> = {
  home: "Homepage",
  story: "Our Story",
  details: "Wedding Details",
  gallery: "Gallery",
  rsvp: "RSVP",
  mobile: "Mobile Version",
};

const viewName = (path: string) =>
  path.split("/").pop()?.replace(/\.svg$/, "") ?? "";

const labelFor = (path: string) => viewLabels[viewName(path)] ?? "Preview";

/**
 * Vertical editorial gallery: desktop pages framed as browser windows, the
 * mobile version centred on its own. No thumbnails, no JavaScript.
 *
 * Every preview contains DEMO content — fictional names, dates and
 * photographs — and each caption says so, so a visitor can never mistake a
 * preview for a real couple's live wedding site.
 */
export function ProductGallery({ product }: { product: Product }) {
  const views = product.previewImages.filter(
    (image) => viewName(image) !== "card",
  );

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {views.map((image, index) => {
        const isMobile = viewName(image) === "mobile";
        const label = labelFor(image);
        const alt = `${product.name} — ${label.toLowerCase()} preview with demo content`;

        return (
          <figure key={image} className="flex flex-col gap-4">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-eyebrow text-stone uppercase">
              <span>{label}</span>
              <span className="normal-case text-stone-soft">
                Demo content — sample names and dates
              </span>
            </figcaption>

            {isMobile ? (
              <div className="flex justify-center py-4">
                <Image
                  src={image}
                  alt={alt}
                  width={860}
                  height={1500}
                  unoptimized
                  sizes="(min-width: 1024px) 26vw, 55vw"
                  className="w-[68%] max-w-[260px] drop-shadow-[0_30px_50px_rgba(27,26,24,0.28)]"
                />
              </div>
            ) : (
              <BrowserFrame
                url={`demo.blancweddings.com/${product.slug}`}
                bodyClassName="bg-ivory"
              >
                <Image
                  src={image}
                  alt={alt}
                  width={1600}
                  height={1000}
                  unoptimized
                  priority={index === 0}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="h-auto w-full"
                />
              </BrowserFrame>
            )}
          </figure>
        );
      })}
    </div>
  );
}
