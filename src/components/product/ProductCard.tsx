import Image from "next/image";
import Link from "next/link";
import { isOnSale, formatPriceParts } from "@/lib/catalog";
import { typeShortLabels, type Product } from "@/data/products";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  /** Set on the first cards of a view so the LCP image loads immediately. */
  priority?: boolean;
  className?: string;
};

/**
 * Preview-first product card: the template cover carries the card, the details
 * stay quiet underneath. The card always names a TEMPLATE, never a couple.
 */
export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const price = formatPriceParts(product);

  return (
    <article className={cn("group", className)}>
      <Link href={`/templates/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-cream">
          <div className="aspect-4/5 w-full overflow-hidden">
            <Image
              src={product.coverImage}
              alt={`${product.name} — ${typeShortLabels[product.type]} cover, demo content`}
              width={1200}
              height={1500}
              unoptimized
              priority={priority}
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>

          <span className="absolute top-3 left-3 bg-ivory/92 px-2 py-1 text-[0.5625rem] tracking-[0.18em] text-stone uppercase">
            Demo content
          </span>

          {isOnSale(product) ? (
            <span className="absolute top-3 right-3 bg-ink px-2 py-1 text-[0.5625rem] tracking-[0.18em] text-ivory uppercase">
              Sale
            </span>
          ) : null}

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-center bg-ivory/92 py-3.5 text-eyebrow uppercase text-ink opacity-0 transition duration-500 ease-editorial group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            View template
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-title-sm">{product.name}</h3>
            <p className="mt-1 text-body-sm text-stone">
              {typeShortLabels[product.type]}
            </p>
          </div>
          <p className="shrink-0 text-body text-ink tabular-nums">
            {price.original ? (
              <span className="mr-1.5 text-stone line-through">{price.original}</span>
            ) : null}
            {price.current}
          </p>
        </div>
      </Link>
    </article>
  );
}
