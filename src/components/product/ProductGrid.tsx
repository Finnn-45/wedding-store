import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: Product[];
  /** How many leading cards load eagerly. */
  priorityCount?: number;
  className?: string;
};

/** Two columns on phones and tablets, three from 1024px up. */
export function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
