import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Session-driven, credential-bearing and API routes — nothing to index.
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/api",
          // /access/[token] is a purchase credential: never crawled, never indexed.
          "/access/",
          "/order/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}