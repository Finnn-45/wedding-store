import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryForm } from "@/components/admin/DeliveryForm";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductPublishControls } from "@/components/admin/ProductPublishControls";
import { getAdminProductDetail } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function AdminProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = await getAdminProductDetail(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/products"
          className="text-body-sm text-stone underline decoration-line underline-offset-4"
        >
          Products
        </Link>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          {product.name}
        </h1>
        <p className="text-body-sm text-stone">
          /{product.slug} · {product.published ? "Published" : "Draft"}
        </p>
      </div>

      <ProductPublishControls
        productId={product.id}
        published={product.published}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-eyebrow uppercase text-stone">Public listing</h2>
        <p className="text-body-sm text-stone">
          Everything on this form is public. The Canva link and the setup guide
          live further down, in delivery assets.
        </p>
        <ProductForm product={product} />
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-eyebrow uppercase text-stone">Delivery assets</h2>
        <p className="text-body-sm text-stone">
          Private. Never rendered on a public page, never included in product
          metadata, and only resolved after a purchase check.
        </p>
        <DeliveryForm
          productId={product.id}
          productName={product.name}
          initialCanvaUrl={product.canvaTemplateUrl ?? ""}
          initialPdfPath={product.setupPdfPath ?? ""}
        />
      </section>
    </div>
  );
}