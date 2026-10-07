import type {
  Product,
  ProductRepository,
} from "@/lib/repositories/product-repository";
import type {
  ProductImageRow,
  ProductRow,
} from "@/lib/supabase/types";
import { toStringArray } from "@/lib/supabase/types";
import { parseProductOption } from "@/data/products";
import { createClient } from "@/lib/supabase/server";

/**
 * SupabaseProductRepository — the SAME `ProductRepository` contract the mock
 * implements, so no storefront component changes when this is switched on.
 *
 * Reads use the ANON client, so RLS decides visibility: a visitor only ever
 * sees `published = true` rows. Delivery data (Canva URL, setup PDF) lives in
 * `delivery_assets` and is NEVER queried here — public product data and
 * private delivery data stay separated by construction, not by convention.
 */

type ProductWithImages = ProductRow & {
  product_images?: ProductImageRow[] | null;
};

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
};

function toProduct(row: ProductWithImages): Product {
  const images = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    type: row.type as Product["type"],
    style: row.style as Product["style"],
    price: num(row.price),
    compareAtPrice:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? undefined
        : num(row.compare_at_price),
    currency: (row.currency as Product["currency"]) ?? "USD",
    priceFrom: row.price_from,
    coverImage: row.cover_image ?? images[0]?.image_path ?? "",
    previewImages: images.map((image) => image.image_path),
    previewAlts: images.map((image) => image.alt_text),
    demoUrl: row.demo_url ?? `/demo/${row.slug}`,
    includedSections: toStringArray(row.included_sections),
    features: toStringArray(row.features),
    whatsIncluded: toStringArray(row.whats_included),
    palette: Array.isArray(row.palette)
      ? (row.palette as Product["palette"])
      : [],
    // Missing column (pre-0003) and malformed jsonb both parse to "no
    // options" — the product then sells exactly as it always did.
    options: parseProductOption(row.options),
    createdAt: row.created_at,
    featured: row.featured,
    published: row.published,
  };
}

const SELECT = `
  *,
  product_images (image_path, alt_text, sort_order)
`;

async function query(filters: {
  slug?: string;
  id?: string;
  type?: string;
  featuredOnly?: boolean;
  excludeSlug?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  const supabase = await createClient();
  let request = supabase
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (filters.slug) request = request.eq("slug", filters.slug);
  if (filters.id) request = request.eq("id", filters.id);
  if (filters.type) request = request.eq("type", filters.type);
  if (filters.featuredOnly) request = request.eq("featured", true);
  if (filters.excludeSlug) request = request.neq("slug", filters.excludeSlug);
  if (filters.search) {
    const term = `%${filters.search}%`;
    request = request.or(
      `name.ilike.${term},short_description.ilike.${term},description.ilike.${term}`,
    );
  }
  if (filters.limit) request = request.limit(filters.limit);

  const { data, error } = await request;
  if (error) {
    console.error("[supabase:products] query failed:", error.message);
    return [];
  }
  return ((data ?? []) as ProductWithImages[]).map(toProduct);
}

export const supabaseProductRepository: ProductRepository = {
  list() {
    return query({});
  },
  async getBySlug(slug) {
    const [product] = await query({ slug });
    return product ?? null;
  },
  async getById(id) {
    const [product] = await query({ id });
    return product ?? null;
  },
  listFeatured(limit) {
    return query({ featuredOnly: true, limit });
  },
  listRelated(slug, limit = 3) {
    // Related = same type, different product.
    return (async () => {
      const source = await query({ slug });
      if (!source[0]) return [];
      return query({ type: source[0].type, excludeSlug: slug, limit });
    })();
  },
  listByType(type, limit) {
    return query({ type, limit });
  },
  async search(filters) {
    // Sort is applied after the query because Postgres ordering is cheaper to
    // express in SQL for the simple cases, and the catalogue is small.
    const supabase = await createClient();
    let request = supabase
      .from("products")
      .select(SELECT)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters.type) request = request.eq("type", filters.type);
    if (filters.style) request = request.eq("style", filters.style);
    if (filters.q) {
      const term = `%${filters.q.trim()}%`;
      request = request.or(
        `name.ilike.${term},short_description.ilike.${term},description.ilike.${term}`,
      );
    }

    const { data, error } = await request;
    if (error) {
      console.error("[supabase:products] search failed:", error.message);
      return [];
    }

    const products = ((data ?? []) as ProductWithImages[]).map(toProduct);
    if (filters.sort === "newest" || !filters.sort || filters.sort === "featured") {
      return products;
    }
    const sorted = [...products];
    if (filters.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  },
};

/** Re-exported so the composition root can share the mapper. */
export { toProduct as mapProductRow };
export type { ProductWithImages };