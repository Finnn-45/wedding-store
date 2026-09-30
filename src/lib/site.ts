/** Canonical origin — one source of truth for metadataBase, robots and sitemap. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blancweddings.com"
).replace(/\/$/, "");