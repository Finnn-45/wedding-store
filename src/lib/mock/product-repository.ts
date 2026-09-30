import { allProducts } from "@/data/products";
import { filterProducts } from "@/lib/catalog";
import type {
  Product,
  ProductRepository,
} from "@/lib/repositories/product-repository";

/**
 * The full catalogue, read straight from `src/data/products.ts`.
 *
 * IMPORTANT: these objects are PUBLIC product data. They contain no delivery
 * assets, no tokens and no secrets — see `src/lib/private/delivery-assets.ts`.
 *
 * In-memory reads are synchronous inside, but the interface stays async so a
 * future Supabase implementation drops in without changing any caller.
 */
const products: Product[] = allProducts;

const isVisible = (product: Product) => product.published;

/** Mock product repository over the local catalogue — no database yet. */
export const mockProductRepository: ProductRepository = {
  async list() {
    return products.filter(isVisible);
  },

  async getBySlug(slug) {
    const product = products.find((entry) => entry.slug === slug);
    return product && isVisible(product) ? product : null;
  },

  async getById(id) {
    const product = products.find((entry) => entry.id === id);
    return product && isVisible(product) ? product : null;
  },

  async listFeatured(limit) {
    const featured = products
      .filter((product) => isVisible(product) && product.featured)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return limit ? featured.slice(0, limit) : featured;
  },

  async listRelated(slug, limit = 3) {
    const source = products.find((entry) => entry.slug === slug);
    if (!source) return [];
    return products
      .filter(
        (product) =>
          isVisible(product) && product.slug !== slug && product.type === source.type,
      )
      .slice(0, limit);
  },

  async listByType(type, limit) {
    const list = products.filter(
      (product) => isVisible(product) && product.type === type,
    );
    return limit ? list.slice(0, limit) : list;
  },

  async search(filters) {
    // filterProducts returns catalogue objects; map back through the same
    // array so callers always get one shared instance per product.
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return filterProducts(filters).flatMap((entry) => {
      const product = bySlug.get(entry.slug);
      return product && isVisible(product) ? [product] : [];
    });
  },
};
