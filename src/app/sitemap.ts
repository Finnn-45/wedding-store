import type { MetadataRoute } from "next";
import { productRepository } from "@/lib/repositories";
import { siteUrl } from "@/lib/site";

/** Static editorial routes — every page a guest should be able to find. */
const staticRoutes: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/faq", priority: 0.7 },
  { path: "/custom", priority: 0.7 },
  { path: "/about", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, priority }) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority,
    }),
  );

  const products = await productRepository.list();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/templates/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Public demos are indexable, but kept out of the sitemap: they duplicate
  // the product page on purpose and should not compete with it.
  return [...staticEntries, ...productEntries];
}