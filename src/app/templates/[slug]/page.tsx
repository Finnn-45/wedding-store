import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs, howItWorksProduct } from "@/data/content";
import { licenseTerms } from "@/data/license";
import { styleLabels, typeLabels } from "@/data/products";
import { styleSlugs } from "@/data/styles";
import { formatPriceParts, isOnSale } from "@/lib/catalog";
import { productRepository } from "@/lib/repositories";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateStaticParams() {
  // See the note in src/app/demo/[slug]/page.tsx: with Supabase configured the
  // repository reads request cookies, which is not allowed here (build time,
  // no HTTP request), so the slug is rendered on demand instead.
  if (isSupabaseConfigured()) return [];
  const products = await productRepository.list();
  return products.map((product) => ({ slug: product.slug }));
}

/**
 * Product metadata.
 *
 * SECURITY: only PUBLIC product data appears here. The Canva template URL and
 * the setup PDF URL are not part of a Product, so they cannot leak into Open
 * Graph, Twitter cards or any other metadata by accident.
 */
export async function generateMetadata(
  props: PageProps<"/templates/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await productRepository.getBySlug(slug);

  if (!product) {
    return { title: "Template not found" };
  }

  const title = `${product.name} - ${typeLabels[product.type]}`;
  const description = `${product.shortDescription} Editable in Canva, setup guide PDF included, instant digital delivery.`;

  return {
    title,
    description,
    alternates: { canonical: `/templates/${product.slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: product.coverImage, alt: product.previewAlts[0] }],
      type: "website",
    },
  };
}

export default async function ProductPage(
  props: PageProps<"/templates/[slug]">,
) {
  const { slug } = await props.params;
  const product = await productRepository.getBySlug(slug);

  if (!product) notFound();

  const related = await productRepository.listRelated(product.slug);
  const isCustom = product.type === "custom";
  const price = formatPriceParts(product);

  return (
    <>
      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="text-body-sm text-stone">
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <span aria-hidden="true" className="px-2 text-stone/60">
            /
          </span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </Container>
      <section className="py-10 lg:py-14">
        <Container className="grid gap-12 lg:grid-cols-[1.32fr_0.68fr] lg:gap-16">
          <div className="min-w-0">
            <ProductGallery product={product} />
          </div>

          <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-4">
              <Eyebrow>{typeLabels[product.type]}</Eyebrow>
              <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-serif text-title">{price.current}</p>
              {isOnSale(product) ? (
                <p className="text-body text-stone line-through">
                  {price.original}
                </p>
              ) : null}
              {product.priceFrom ? (
                <span className="text-body-sm text-stone">starting price</span>
              ) : null}
            </div>

            <p className="text-body text-stone">{product.description}</p>

            {/* Public demo - safe to expose. The Canva template is NOT. */}
            {isCustom ? null : (
              <Button
                href={product.demoUrl}
                variant="outline"
                size="lg"
                className="w-full"
              >
                View public demo
              </Button>
            )}

            <dl className="flex flex-col gap-3 border-y border-line py-6 text-body-sm">
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Style</dt>
                <dd>
                  <Link
                    href={`/shop?style=${styleSlugs[product.style]}`}
                    className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {styleLabels[product.style]}
                  </Link>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Sections</dt>
                <dd className="text-ink">{product.includedSections.length}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Edited in</dt>
                <dd className="text-ink">Canva</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-stone">Delivery</dt>
                <dd className="text-ink">Instant digital access</dd>
              </div>
            </dl>

            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {product.palette.map((swatch) => (
                <li key={swatch.hex} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 rounded-full border border-line"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="text-body-sm text-stone">{swatch.name}</span>
                </li>
              ))}
            </ul>

            {isCustom ? (
              <div className="flex flex-col gap-3">
                <Button href="/custom#enquiry" size="lg" className="w-full">
                  Start a Custom Project
                </Button>
                <p className="text-body-sm text-stone">
                  Quoted after a short conversation - typically $250 to $650
                  depending on scope. No instant checkout.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AddToCartButton productId={product.id} className="w-full" />
                <AddToCartButton
                  productId={product.id}
                  mode="cart"
                  size="lg"
                  className="w-full"
                />
              </div>
            )}

            <p className="text-body-sm text-stone">
              Digital product only. Nothing is shipped - you receive an editable
              Canva template and a setup guide PDF the moment payment is
              confirmed.
            </p>
          </aside>
        </Container>
      </section>
      <section className="border-t border-line bg-cream/40 py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-7">
            <SectionHeading
              eyebrow="What's included"
              title={isCustom ? "What you receive" : "What you get"}
              description="Exactly what lands in your inbox after payment."
            />
            <ul className="flex flex-col gap-3">
              {product.whatsIncluded.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-body text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-3 h-1 w-1 shrink-0 bg-stone"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <Eyebrow>Sections in this template</Eyebrow>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-body text-stone">
              {product.includedSections.map((section) => (
                <li
                  key={section}
                  className="border-b border-line-soft pb-2 last:border-0"
                >
                  {section}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow="How it works"
              title="From purchase to published"
              description="Six steps, most of them inside Canva."
            />
          </div>

          <ol className="mt-12 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {howItWorksProduct.map((step) => (
              <li key={step.number} className="flex flex-col gap-4">
                <span className="font-serif text-title text-stone tabular-nums">
                  {step.number}
                </span>
                <h3 className="font-serif text-title-sm uppercase tracking-[0.02em]">
                  {step.title}
                </h3>
                <p className="text-body text-stone">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="border-t border-line py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Good to know" title="Details" />
          </div>

          <Accordion
            items={[
              {
                title: "What you get",
                content: (
                  <div className="flex flex-col gap-4">
                    <p>
                      {isCustom
                        ? "A bespoke Canva website template designed for your celebration, plus a setup guide PDF and a publishing walkthrough."
                        : "An editable Canva website template with the sections listed above, plus a step-by-step setup guide PDF."}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {product.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                title: "Do I need Canva?",
                content: (
                  <p>
                    Yes - a free Canva account is enough, and no paid plan is
                    required. Canva is where you edit the template and publish
                    your website. BLANC WEDDINGS is the storefront: we take the
                    order and deliver the files, Canva does the editing and
                    hosting.
                  </p>
                ),
              },
              {
                title: "How it works",
                content: (
                  <ol className="flex flex-col gap-3">
                    {howItWorksProduct.map((step) => (
                      <li key={step.number}>
                        <span className="text-ink">
                          {step.number} - {step.title}.
                        </span>{" "}
                        {step.text}
                      </li>
                    ))}
                  </ol>
                ),
              },
              {
                title: "Licence and usage",
                content: (
                  <ul className="flex flex-col gap-3">
                    {licenseTerms.map((term) => (
                      <li key={term.title}>
                        <span className="text-ink">{term.title}:</span>{" "}
                        {term.text}
                      </li>
                    ))}
                  </ul>
                ),
              },              {
                title: "About the previews",
                content: (
                  <p>
                    The previews use fictional names, dates, locations and
                    photographs so you can see the design filled in. That is
                    demo content: you replace all of it in Canva. The public demo
                    link on this page is view-only and carries no editing
                    access.
                  </p>
                ),
              },
              {
                title: "FAQ",
                content: (
                  <ul className="flex flex-col gap-4">
                    {faqs.slice(0, 4).map((faq) => (
                      <li key={faq.question}>
                        <p className="text-ink">{faq.question}</p>
                        <p className="mt-1">{faq.answer}</p>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                title: "Important information",
                content: (
                  <ul className="flex flex-col gap-3">
                    <li>Digital product only - no physical item will be shipped.</li>
                    <li>
                      Instant delivery: your secure access page is sent by email
                      and WhatsApp as soon as payment is confirmed.
                    </li>
                    <li>
                      Licensed for one wedding or event, with unlimited guests
                      and no expiry date.
                    </li>
                    <li>
                      Photography, names and copy shown in the previews are
                      sample content for demonstration.
                    </li>
                    <li>
                      Because access is immediate, purchases are final - but
                      anything that does not work as described is fixed free of
                      charge.
                    </li>
                  </ul>
                ),
              },
            ]}
          />
        </Container>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-line bg-shell py-16 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="More like this"
              title={
                product.type === "save-the-date"
                  ? "Other Save the Dates"
                  : "Other designs"
              }
            />
            <ProductGrid products={related} className="mt-12" />
          </Container>
        </section>
      ) : null}
    </>
  );
}