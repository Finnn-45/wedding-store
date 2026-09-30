import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productRepository } from "@/lib/repositories";

export async function FeaturedWebsites() {
  const products = await productRepository.listFeatured();
  return (
    <section id="wedding-websites" className="py-16 lg:py-24">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="The collection"
            title="Wedding website templates"
            description="Editable Canva wedding website templates, ready to personalise and publish."
          />
          <Button
            href="/shop?type=wedding-website"
            variant="ghost"
            className="shrink-0 self-start lg:self-auto"
          >
            View all wedding websites
          </Button>
        </div>

        <ProductGrid
          products={products}
          priorityCount={3}
          className="mt-14 lg:mt-20"
        />
      </Container>
    </section>
  );
}
