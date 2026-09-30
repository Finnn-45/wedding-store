import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productRepository } from "@/lib/repositories";

/**
 * Save the Date gets its own editorial rhythm: four narrow columns on desktop
 * with every second card dropped, so the rail never mirrors the grid above.
 */
export async function SaveTheDateCollection() {
  const products = await productRepository.listByType("save-the-date");

  return (
    <section
      id="save-the-date"
      className="border-t border-line bg-cream/45 py-16 lg:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow="Announcements"
            title="Save the date templates"
            description="Canva Save the Date website templates for announcing your celebration beautifully."
          />
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:mt-20 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
              className={index % 2 === 1 ? "lg:mt-20" : undefined}
            />
          ))}
        </div>

        <div className="mt-16 flex justify-center lg:mt-28">
          <Button href="/shop?type=save-the-date" variant="outline" size="lg">
            Explore all Save the Dates
          </Button>
        </div>
      </Container>
    </section>
  );
}
