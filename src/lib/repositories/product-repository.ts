import type {
  Product,
  ProductStyle,
  ProductType,
} from "@/data/products";
import type { ShopFilters } from "@/lib/catalog";

/**
 * Read side of the product catalogue. The UI talks only to this interface;
 * today it is backed by mock data (`src/lib/mock/product-repository.ts`),
 * later by Supabase — without touching any component.
 *
 * Every method returns PUBLIC product data only. Delivery assets (Canva
 * template URL, setup PDF URL) are never part of `Product` and are never
 * returned here; they live behind `PurchaseAccessService`.
 *
 * Server-only: client components receive products as props.
 */
export interface ProductRepository {
  /** Every published product. */
  list(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  /** Products flagged `featured`, newest first, optionally limited. */
  listFeatured(limit?: number): Promise<Product[]>;
  /** One product of the same type, excluding the given slug. */
  listRelated(slug: string, limit?: number): Promise<Product[]>;
  /** All products of one type (e.g. every save-the-date). */
  listByType(type: ProductType, limit?: number): Promise<Product[]>;
  /** Shop page filtering — type / style / search / sort. */
  search(filters: ShopFilters): Promise<Product[]>;
}

export type { Product, ProductStyle, ProductType };
