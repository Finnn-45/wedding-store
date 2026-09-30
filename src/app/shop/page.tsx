import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { styleSlugs } from "@/data/styles";
import {
  parseSort,
  parseStyle,
  parseType,
  shopSortOptions,
  shopStyleFilters,
  shopTypeFilters,
  type SortValue,
} from "@/lib/catalog";
import { productRepository } from "@/lib/repositories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wedding Website Templates",
  description:
    "Shop every Blanc Weddings template: wedding websites, Save the Date pages and bundles. Digital delivery, instant access.",
};

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-block py-1 text-body-sm transition-colors duration-300",
        active
          ? "text-ink underline decoration-ink underline-offset-[6px]"
          : "text-stone hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

export default async function ShopPage(props: PageProps<"/shop">) {
  const searchParams = await props.searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const activeType = parseType(first(searchParams.type));
  const activeStyle = parseStyle(first(searchParams.style));
  const activeSort = parseSort(first(searchParams.sort));
  const query = first(searchParams.q)?.trim();

  const results = await productRepository.search({
    type: activeType,
    style: activeStyle,
    q: query,
    sort: activeSort,
  });

  /** Rebuilds the query string, keeping the filters that are still active. */
  const buildHref = (overrides: {
    type?: string;
    style?: string;
    sort?: SortValue;
    q?: string;
  }) => {
    const merged = {
      type: activeType,
      style: activeStyle ? styleSlugs[activeStyle] : undefined,
      sort: activeSort === "featured" ? undefined : activeSort,
      q: query,
      ...overrides,
    };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <>
      <section className="border-b border-line py-14 lg:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="The collection"
            title="Wedding website templates"
            description="Every design is a complete wedding website — or a Save the Date page, or both."
          />
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        <div className="flex flex-col gap-6 border-b border-line pb-8">
          <nav aria-label="Product type">
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {shopTypeFilters.map((filter) => (
                <li key={filter.value}>
                  <FilterLink
                    href={buildHref({
                      type: filter.value === "all" ? undefined : filter.value,
                    })}
                    active={
                      filter.value === "all"
                        ? !activeType
                        : activeType === filter.value
                    }
                  >
                    {filter.label}
                  </FilterLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Style">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <li>
                  <Eyebrow>Style</Eyebrow>
                </li>
                <li>
                  <FilterLink
                    href={buildHref({ style: undefined })}
                    active={!activeStyle}
                  >
                    All
                  </FilterLink>
                </li>
                {shopStyleFilters.map((style) => (
                  <li key={style}>
                    <FilterLink
                      href={buildHref({ style: styleSlugs[style] })}
                      active={activeStyle === style}
                    >
                      {style}
                    </FilterLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Sort">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <li>
                  <Eyebrow>Sort</Eyebrow>
                </li>
                {shopSortOptions.map((option) => (
                  <li key={option.value}>
                    <FilterLink
                      href={buildHref({
                        sort:
                          option.value === "featured"
                            ? undefined
                            : option.value,
                      })}
                      active={activeSort === option.value}
                    >
                      {option.label}
                    </FilterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-6 text-body-sm text-stone">
          {results.length} {results.length === 1 ? "template" : "templates"}
          {query ? ` matching “${query}”` : ""}
        </p>

        {results.length > 0 ? (
          <ProductGrid
            products={results}
            priorityCount={3}
            className="mt-8 lg:mt-12"
          />
        ) : (
          <div className="mt-12 flex flex-col items-start gap-6 border border-line bg-shell p-10">
            <p className="font-serif text-title">
              Nothing matches that combination yet.
            </p>
            <p className="max-w-md text-body text-stone">
              Try another style, or browse the full collection.
            </p>
            <Button href="/shop" variant="outline">
              View all templates
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}
