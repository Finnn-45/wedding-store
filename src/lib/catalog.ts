import { allProducts, type Product, type ProductStyle, type ProductType } from "@/data/products";
import { styleLabels } from "@/data/products";

export type ShopFilters = {
  type?: ProductType;
  style?: ProductStyle;
  q?: string;
  sort?: SortValue;
};

export type SortValue = "featured" | "newest" | "price-asc" | "price-desc";

const sortValues: SortValue[] = ["featured", "newest", "price-asc", "price-desc"];

export function parseSort(value: string | undefined): SortValue {
  return sortValues.includes(value as SortValue) ? (value as SortValue) : "featured";
}

export function parseType(value: string | undefined): ProductType | undefined {
  const types: ProductType[] = ["wedding-website", "save-the-date", "bundle", "custom"];
  return types.includes(value as ProductType) ? (value as ProductType) : undefined;
}

export function parseStyle(value: string | undefined): ProductStyle | undefined {
  if (!value) return undefined;
  const wanted = value.trim().toLowerCase();
  return (Object.keys(styleLabels) as ProductStyle[]).find(
    (style) => style === wanted || styleLabels[style].toLowerCase() === wanted,
  );
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

export function getCardImage(product: Product): string {
  return product.coverImage;
}

export function getFeaturedProducts(): Product[] {
  return allProducts.filter((product) => product.featured);
}

export function getProductsByType(type: ProductType): Product[] {
  return allProducts.filter((product) => product.type === type);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return allProducts
    .filter(
      (candidate) =>
        candidate.slug !== product.slug && candidate.type === product.type,
    )
    .slice(0, limit);
}

/** True when the product is on sale (compareAtPrice above the sale price). */
export function isOnSale(product: Product): boolean {
  return (
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price
  );
}

/** e.g. "$30" or "Starting at $250". */
export function formatPrice(product: Product): string {
  return `${product.priceFrom ? "Starting at " : ""}$${product.price}`;
}

/** e.g. "$45" with the struck-through original alongside. */
export function formatPriceParts(product: Product): {
  current: string;
  original?: string;
} {
  return {
    current: `$${product.price}`,
    ...(isOnSale(product) ? { original: `$${product.compareAtPrice}` } : {}),
  };
}

export function sortProducts(list: Product[], sort: SortValue): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }
}

/** Applies the shop page filters. Everything runs on the server. */
export function filterProducts(filters: ShopFilters): Product[] {
  const query = filters.q?.trim().toLowerCase();

  const filtered = allProducts.filter((product) => {
    if (filters.type && product.type !== filters.type) return false;
    if (filters.style && product.style !== filters.style) return false;
    if (query) {
      const haystack = [
        product.name,
        styleLabels[product.style],
        product.type,
        product.description,
        product.shortDescription,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return sortProducts(filtered, filters.sort ?? "featured");
}

/** Styles offered in the shop filter row. */
export const shopStyleFilters: ProductStyle[] = [
  "modern",
  "minimal",
  "romantic",
  "editorial",
  "garden",
  "classic",
  "black-white",
  "colorful",
];

export type ShopTypeFilter = {
  label: string;
  value: ProductType | "all";
};

export const shopTypeFilters: ShopTypeFilter[] = [
  { label: "All", value: "all" },
  { label: "Wedding Websites", value: "wedding-website" },
  { label: "Save the Date", value: "save-the-date" },
  { label: "Bundles", value: "bundle" },
];

export type ShopSortOption = {
  label: string;
  value: SortValue;
};

export const shopSortOptions: ShopSortOption[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price Low to High", value: "price-asc" },
  { label: "Price High to Low", value: "price-desc" },
];
