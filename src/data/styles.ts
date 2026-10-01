import type { ProductStyle } from "@/data/products";

/**
 * URL slug for each style — styles are already stored URL-friendly, so this is
 * an identity map kept as the single place a future Supabase repository can
 * translate between stored values and route values.
 */
export const styleSlugs: Record<ProductStyle, string> = {
  modern: "modern",
  minimal: "minimal",
  romantic: "romantic",
  editorial: "editorial",
  garden: "garden",
  classic: "classic",
  "black-white": "black-white",
  colorful: "colorful",
};

export type StyleCategory = {
  style: ProductStyle;
  label: string;
  slug: string;
  /** A website preview, never an icon. */
  image: string;
  note: string;
};

export const styleCategories: StyleCategory[] = [
  {
    style: "minimal",
    label: "Minimal",
    slug: "minimal",
    image: "/images/styles/minimal.svg",
    note: "Quiet pages, generous whitespace",
  },
  {
    style: "garden",
    label: "Garden",
    slug: "garden",
    image: "/images/styles/garden.svg",
    note: "Green tones for outdoor days",
  },
  {
    style: "romantic",
    label: "Romantic",
    slug: "romantic",
    image: "/images/styles/romantic.svg",
    note: "Warm palettes, soft serif type",
  },
];

