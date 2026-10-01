import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { styleCategories } from "@/data/styles";

export function ShopByStyle() {
  return (
    <section id="shop-by-style" className="py-16 lg:py-24">
      <Container>
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow="Find your direction"
            title="Shop by style"
            description="Each collection carries its own palette and typographic voice. Start with the mood of your celebration."
          />
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:mt-20 lg:grid-cols-3 lg:gap-x-6">
          {styleCategories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/shop?style=${category.slug}`}
                className="group block"
              >
                <div className="aspect-4/5 overflow-hidden bg-cream">
                  <Image
                    src={category.image}
                    alt={`${category.label} wedding website preview`}
                    width={1200}
                    height={1500}
                    unoptimized
                    sizes="(min-width: 1024px) 22vw, 46vw"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-body-sm text-stone">{category.note}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
