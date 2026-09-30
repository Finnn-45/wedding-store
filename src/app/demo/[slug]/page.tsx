import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { productRepository } from "@/lib/repositories";

/**
 * Public demo page.
 *
 * This is the DEMO half of the demo-vs-purchase split: fully public, no token,
 * no delivery assets, and every frame is labelled demo content. The Canva
 * template a customer buys is never reachable from here.
 */
export async function generateStaticParams() {
  const products = await productRepository.list();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: PageProps<"/demo/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await productRepository.getBySlug(slug);
  if (!product) return { title: "Demo not found" };

  return {
    title: `${product.name} — Live Demo`,
    description: `Public demo of the ${product.name} Canva wedding website template, shown with sample content.`,
    alternates: { canonical: `/demo/${product.slug}` },
    openGraph: {
      title: `${product.name} — Live Demo`,
      description: product.shortDescription,
      images: [{ url: product.coverImage }],
    },
  };
}

export default async function DemoPage(props: PageProps<"/demo/[slug]">) {
  const { slug } = await props.params;
  const product = await productRepository.getBySlug(slug);
  if (!product) notFound();

  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="flex flex-col gap-5">
          <Eyebrow>Public demo</Eyebrow>
          <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
            {product.name}
          </h1>
          <p className="max-w-2xl text-body text-stone">
            This is a demo of the template design. Every name, date, location
            and photograph below is sample content used to show the layout — it
            is not a real wedding. After purchase you replace all of it in
            Canva.
          </p>
        </div>

        <div className="mt-10 border-y border-line py-4 text-body-sm text-stone">
          <strong className="font-medium text-ink">Demo content.</strong> No
          editing access is granted on this page. The editable Canva template is
          delivered only after purchase.
        </div>

        <div className="mt-10">
          <ProductGallery product={product} />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href={`/templates/${product.slug}`} size="lg">
            Buy this template
          </Button>
          <Button href="/shop" variant="outline" size="lg">
            Back to the shop
          </Button>
        </div>
      </Container>
    </section>
  );
}
