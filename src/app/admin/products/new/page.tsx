import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { usingSupabase } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          New product
        </h1>
        <p className="mt-2 max-w-xl text-body-sm text-stone">
          A Canva template product. Delivery assets (Canva URL and setup guide)
          are added on the product page once it exists.
        </p>
      </div>

      {!usingSupabase ? (
        <p className="border border-line bg-cream/40 px-4 py-3 text-body-sm text-stone">
          Supabase is not configured, so saving is disabled. The form below is
          the real editor — it will persist once the database is connected.
        </p>
      ) : null}

      <ProductForm />
    </div>
  );
}