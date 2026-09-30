/**
 * ==========================================================================
 * PRODUCT CATALOGUE - BLANC WEDDINGS
 * ==========================================================================
 * The product is an EDITABLE CANVA website template + a setup guide PDF.
 * We are a storefront, not a builder: Canva does the editing and publishing.
 *
 * MOCK DATA - shaped 1:1 for a future `products` table, so swapping in a
 * Supabase repository changes no component.
 *
 * Everything here is PUBLIC product data. Delivery assets (Canva template URL,
 * setup PDF URL) deliberately live in `src/lib/private/delivery-assets.ts` and
 * must never be imported by this file or by any client component.
 * ==========================================================================
 */

export type ProductType =
  | "wedding-website"
  | "save-the-date"
  | "bundle"
  | "custom";

export type ProductStyle =
  | "modern"
  | "minimal"
  | "romantic"
  | "editorial"
  | "garden"
  | "classic"
  | "black-white"
  | "colorful";

export type PaletteSwatch = {
  name: string;
  hex: string;
};

export type Product = {
  /** Stable identifier. Equals the slug today; a UUID once Supabase is live. */
  id: string;
  slug: string;
  /** Product name only - never a fictional couple. */
  name: string;
  /** One line for cards, search and meta descriptions. */
  shortDescription: string;
  /** Long copy for the product page. */
  description: string;

  type: ProductType;
  style: ProductStyle;

  price: number;
  /** Original price when the product is on sale. */
  compareAtPrice?: number;
  currency: "USD";
  /** Made-to-order work is quoted as "Starting at". */
  priceFrom?: boolean;

  /** Card / Open Graph image. */
  coverImage: string;
  /** Full preview set, in gallery order. */
  previewImages: string[];
  /** Alt text per preview image, same order. */
  previewAlts: string[];
  /** Public demo page - safe to expose, shows the design with sample content. */
  demoUrl: string;

  /** Sections the customer receives inside the Canva template. */
  includedSections: string[];
  /** Product capabilities, shown on the product page. */
  features: string[];
  /** Exactly what the buyer receives after payment. */
  whatsIncluded: string[];

  palette: PaletteSwatch[];

  /** ISO date, used by the "Newest" sort. */
  createdAt: string;
  featured?: boolean;
  /** Unpublished products vanish from shop, search and checkout. */
  published: boolean;
};

export const typeLabels: Record<ProductType, string> = {
  "wedding-website": "Wedding Website Template",
  "save-the-date": "Save the Date Template",
  bundle: "Website + Save the Date Bundle",
  custom: "Custom Design Service",
};

/** Short label used on product cards. */
export const typeShortLabels: Record<ProductType, string> = {
  "wedding-website": "Wedding Website Template",
  "save-the-date": "Save the Date Template",
  bundle: "Website + Save the Date",
  custom: "Custom Design",
};

/** Human labels for the style vocabulary. */
export const styleLabels: Record<ProductStyle, string> = {
  modern: "Modern",
  minimal: "Minimal",
  romantic: "Romantic",
  editorial: "Editorial",
  garden: "Garden",
  classic: "Classic",
  "black-white": "Black & White",
  colorful: "Colorful",
};
/* ------------------------------------------------------------------ */
/* Product claims - only what we actually deliver                       */
/* ------------------------------------------------------------------ */

const canvaCapabilities: string[] = [
  "Fully editable in Canva - no code, no export",
  "Desktop and mobile optimized layouts",
  "Setup guide PDF included with every purchase",
  "Publish your website from Canva",
  "Canva account required (free plan is enough)",
];

const deliveryCapabilities: string[] = [
  "Instant digital delivery after payment",
  "Digital product only - nothing is posted",
  "No subscription and no hidden fees",
  "Sample content in previews is demo content",
];

const websiteFeatures: string[] = [
  ...canvaCapabilities,
  ...deliveryCapabilities,
  "Sections you do not need can be hidden",
  "Colours and type styles can be replaced with your own",
];

const saveTheDateFeatures: string[] = [
  ...canvaCapabilities,
  ...deliveryCapabilities,
  "Countdown to your date, editable in Canva",
  "Announcement and reply preview sections",
];

const bundleFeatures: string[] = [
  ...canvaCapabilities,
  ...deliveryCapabilities,
  "Two Canva templates in one palette",
  "Website and Save the Date share one type system",
];

const customFeatures: string[] = [
  "Designed from a blank page, not adapted from a template",
  "Palette, typography and layout chosen for your day",
  "Two rounds of refinement included",
  "Quoted after a short conversation - no instant checkout",
  "Delivered ready to publish, with a walkthrough",
];

/** What the buyer receives - the honest, literal delivery list. */
const websiteWhatsIncluded: string[] = [
  "Editable Canva wedding website template",
  "Mobile-friendly desktop, tablet and phone layouts",
  "Setup guide PDF (step by step)",
  "Website publishing instructions",
  "Template-specific design elements and colour palette",
];

const saveTheDateWhatsIncluded: string[] = [
  "Editable Canva Save the Date website template",
  "Mobile-friendly desktop, tablet and phone layouts",
  "Setup guide PDF (step by step)",
  "Website publishing instructions",
  "Template-specific design elements and colour palette",
];

const bundleWhatsIncluded: string[] = [
  "Editable Canva wedding website template",
  "Editable Canva Save the Date template - same palette",
  "Mobile-friendly desktop, tablet and phone layouts",
  "Setup guide PDF for both templates",
  "Website publishing instructions",
];

const customWhatsIncluded: string[] = [
  "Bespoke art direction and layout design",
  "Your Canva website template, built to your brief",
  "Sections arranged and worded with you",
  "Setup guide PDF for the finished template",
  "Two rounds of refinement and a publishing walkthrough",
];

/** Sections the customer receives inside each template type. */
const weddingSections: string[] = [
  "Hero",
  "Couple names",
  "Wedding date",
  "Our story",
  "Wedding details",
  "Event information",
  "Countdown",
  "Gallery",
  "RSVP",
  "Location",
  "Dress code",
  "Registry",
  "FAQ",
];

const saveTheDateSections: string[] = [
  "Save the date hero",
  "Couple names",
  "Wedding date",
  "Countdown",
  "Our story teaser",
  "Gallery",
  "Location",
  "Reply preview",
  "Digital announcement",
];

/** Preview views, matching the files written by scripts/generate-mockups.mjs. */
const views: Record<ProductType, readonly string[]> = {
  "wedding-website": ["card", "home", "story", "details", "gallery", "rsvp", "mobile"],
  "save-the-date": ["card", "home", "details", "gallery", "rsvp", "mobile"],
  bundle: ["card", "home", "story", "details", "gallery", "rsvp", "mobile"],
  custom: ["card", "home", "story", "details", "gallery", "mobile"],
};

const viewLabels: Record<string, string> = {
  card: "cover",
  home: "homepage",
  story: "our story",
  details: "wedding details",
  gallery: "gallery",
  rsvp: "RSVP",
  mobile: "mobile view",
};

const imagesFor = (slug: string, type: ProductType): string[] =>
  views[type].map((view) => `/images/${slug}/${view}.svg`);

const altsFor = (name: string, type: ProductType): string[] =>
  views[type].map((view) => `${name} - ${viewLabels[view] ?? view} preview`);
/** Each collection carries one accent colour story. */
const palettes: Record<string, PaletteSwatch[]> = {
  ivory: [
    { name: "Warm ivory", hex: "#fbf8f4" },
    { name: "Greige", hex: "#8b8479" },
    { name: "Soft taupe", hex: "#e8e0d4" },
  ],
  olive: [
    { name: "Muted olive", hex: "#5d6146" },
    { name: "Pale olive", hex: "#dfe0cf" },
    { name: "Stone cream", hex: "#f4f2ea" },
  ],
  burgundy: [
    { name: "Deep burgundy", hex: "#6c2b33" },
    { name: "Dusty rose", hex: "#d8bcbe" },
    { name: "Warm paper", hex: "#f7f1ea" },
  ],
  dusty: [
    { name: "Dusty blue", hex: "#6f8497" },
    { name: "Pale blue", hex: "#d7e0e6" },
    { name: "Soft white", hex: "#fbfaf7" },
  ],
  brown: [
    { name: "Deep brown", hex: "#3a2c22" },
    { name: "Warm ivory", hex: "#f7f4ee" },
    { name: "Clay", hex: "#b08968" },
  ],
  garden: [
    { name: "Sage green", hex: "#8a9781" },
    { name: "Deep olive", hex: "#5d6146" },
    { name: "Garden cream", hex: "#f1efe4" },
  ],
  classic: [
    { name: "Antique gold", hex: "#a98d4f" },
    { name: "Cream", hex: "#f6f0e2" },
    { name: "Soft stone", hex: "#ddd6c6" },
  ],
  mono: [
    { name: "Charcoal", hex: "#1b1a18" },
    { name: "Off-white", hex: "#fbfbf9" },
    { name: "Mid grey", hex: "#8c8a85" },
  ],
  blush: [
    { name: "Blush", hex: "#e3cec6" },
    { name: "Sage", hex: "#8a9781" },
    { name: "Ivory", hex: "#f7f4ee" },
  ],
  sage: [
    { name: "Muted sage", hex: "#8a9781" },
    { name: "Ivory", hex: "#f7f4ee" },
    { name: "Fern shadow", hex: "#6f7a63" },
  ],
  pearl: [
    { name: "Pearl", hex: "#e9e3da" },
    { name: "Warm white", hex: "#fdfbf8" },
    { name: "Soft grey", hex: "#b9b2a6" },
  ],
  stone: [
    { name: "Stone grey", hex: "#8b8479" },
    { name: "Paper white", hex: "#fdfbf8" },
    { name: "Ink", hex: "#1b1a18" },
  ],
  terracotta: [
    { name: "Terracotta", hex: "#b5623f" },
    { name: "Apricot", hex: "#e8a87c" },
    { name: "Sunlit white", hex: "#fdf6ee" },
  ],
};

type ProductSeed = {
  slug: string;
  name: string;
  type: ProductType;
  style: ProductStyle;
  price: number;
  compareAtPrice?: number;
  createdAt: string;
  featured?: boolean;
  shortDescription: string;
  description: string;
  palette: string;
  features: string[];
  whatsIncluded: string[];
  sections: string[];
};

const toProduct = (seed: ProductSeed): Product => ({
  id: seed.slug,
  slug: seed.slug,
  name: seed.name,
  shortDescription: seed.shortDescription,
  description: seed.description,
  type: seed.type,
  style: seed.style,
  price: seed.price,
  compareAtPrice: seed.compareAtPrice,
  currency: "USD",
  coverImage: imagesFor(seed.slug, seed.type)[0],
  previewImages: imagesFor(seed.slug, seed.type),
  previewAlts: altsFor(seed.name, seed.type),
  demoUrl: `/demo/${seed.slug}`,
  includedSections: seed.sections,
  features: seed.features,
  whatsIncluded: seed.whatsIncluded,
  palette: palettes[seed.palette],
  createdAt: seed.createdAt,
  featured: seed.featured,
  published: true,
});
const seeds: ProductSeed[] = [
  /* --- Wedding website templates --- */
  {
    slug: "modern-ivory",
    name: "Modern Ivory",
    type: "wedding-website",
    style: "minimal",
    price: 30,
    createdAt: "2026-01-18",
    featured: true,
    shortDescription: "A quiet, gallery-led wedding website template in warm ivory.",
    description:
      "A quiet, gallery-led website in warm ivory. Minimal navigation, generous whitespace and your names set in a light serif. Edited and published entirely in Canva.",
    palette: "ivory",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "olive-green",
    name: "Olive Green",
    type: "wedding-website",
    style: "garden",
    price: 30,
    createdAt: "2026-01-12",
    featured: true,
    shortDescription: "Muted olive and linen, designed for garden celebrations.",
    description:
      "Muted olive, linen tones and unhurried spacing. Designed for garden celebrations, long tables and photographs taken in late afternoon light.",
    palette: "olive",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "burgundy",
    name: "Burgundy",
    type: "wedding-website",
    style: "romantic",
    price: 30,
    createdAt: "2026-01-06",
    featured: true,
    shortDescription: "Deep burgundy accents on warm paper - romantic and candlelit.",
    description:
      "Deep burgundy accents on warm paper. A romantic, candlelit layout with an editorial story section and room for every detail of the day.",
    palette: "burgundy",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "brown-and-ivory",
    name: "Brown & Ivory",
    type: "wedding-website",
    style: "editorial",
    price: 30,
    createdAt: "2025-12-15",
    featured: true,
    shortDescription: "Deep brown and ivory, set like a printed magazine.",
    description:
      "Deep brown and ivory, set like a printed magazine. Strong typographic hierarchy, wide margins and a story section that reads like a spread.",
    palette: "brown",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "dusty-blue",
    name: "Dusty Blue",
    type: "wedding-website",
    style: "classic",
    price: 30,
    createdAt: "2025-12-08",
    featured: true,
    shortDescription: "Dusty blue and cool ivory with classic proportions.",
    description:
      "Dusty blue and cool ivory with classic proportions. A calm, traditional layout that suits church ceremonies and formal receptions.",
    palette: "dusty",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "black-and-white",
    name: "Black & White",
    type: "wedding-website",
    style: "black-white",
    price: 30,
    createdAt: "2025-11-24",
    featured: true,
    shortDescription: "Charcoal and off-white - photography carries all the colour.",
    description:
      "Pure charcoal and off-white, with photography carrying all of the colour. Graphic, modern and impossible to date.",
    palette: "mono",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "garden-party",
    name: "Garden Party",
    type: "wedding-website",
    style: "garden",
    price: 30,
    createdAt: "2025-11-10",
    shortDescription: "Green-on-green with a sunlit feel for outdoor celebrations.",
    description:
      "Green-on-green with soft photography and a sunlit feel. Built for outdoor ceremonies, marquees and weekends that run long.",
    palette: "garden",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "classic-ivory",
    name: "Classic Ivory",
    type: "wedding-website",
    style: "classic",
    price: 30,
    createdAt: "2025-10-28",
    shortDescription: "Antique gold, cream and ivory - engraved-stationery calm.",
    description:
      "Antique gold, cream and ivory. Symmetrical, formal and quietly luxurious - the digital equivalent of engraved stationery.",
    palette: "classic",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "editorial-stone",
    name: "Editorial Stone",
    type: "wedding-website",
    style: "editorial",
    price: 30,
    createdAt: "2025-10-12",
    shortDescription: "Stone grey and paper white with oversized type.",
    description:
      "Stone grey and paper white with oversized type and hairline rules. A restrained, gallery-style website for design-led couples.",
    palette: "stone",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },
  {
    slug: "plein-air",
    name: "Plein Air",
    type: "wedding-website",
    style: "colorful",
    price: 30,
    compareAtPrice: 45,
    createdAt: "2026-02-02",
    shortDescription: "Terracotta and apricot, full of daylight and long lunches.",
    description:
      "Terracotta and apricot with bright, generous photography. Warm, playful and full of daylight - for celebrations that feel like one long lunch.",
    palette: "terracotta",
    features: websiteFeatures,
    whatsIncluded: websiteWhatsIncluded,
    sections: weddingSections,
  },  /* --- Save the Date templates --- */
  {
    slug: "pearl-and-ivory",
    name: "Pearl & Ivory",
    type: "save-the-date",
    style: "minimal",
    price: 19,
    createdAt: "2025-09-30",
    shortDescription: "A soft pearl announcement with your date in light serif type.",
    description:
      "A soft pearl announcement with your date set in light serif type. Understated enough to send to everyone, considered enough to feel like stationery.",
    palette: "pearl",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "sage-and-ivory",
    name: "Sage & Ivory",
    type: "save-the-date",
    style: "garden",
    price: 19,
    createdAt: "2025-09-22",
    shortDescription: "Muted sage on ivory, with a countdown and one photograph.",
    description:
      "Muted sage on ivory, with a countdown to the date and space for a single photograph. Quietly botanical without a single leaf motif.",
    palette: "sage",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "blush-and-sage",
    name: "Blush & Sage",
    type: "save-the-date",
    style: "romantic",
    price: 19,
    createdAt: "2025-09-14",
    shortDescription: "Blush and sage in balance, with a countdown.",
    description:
      "Blush and sage kept in balance - warm enough to feel romantic, muted enough to stay elegant. Includes a countdown and a reply preview.",
    palette: "blush",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "modern-ivory-save-the-date",
    name: "Modern Ivory",
    type: "save-the-date",
    style: "minimal",
    price: 19,
    createdAt: "2026-01-20",
    shortDescription: "The Modern Ivory design, reduced to a single announcement page.",
    description:
      "The Modern Ivory design, reduced to a single page: your names, your date and a countdown, with nothing else in the way.",
    palette: "ivory",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "burgundy-save-the-date",
    name: "Burgundy",
    type: "save-the-date",
    style: "romantic",
    price: 19,
    createdAt: "2026-01-08",
    shortDescription: "Deep burgundy on warm paper, in candlelight tones.",
    description:
      "Deep burgundy on warm paper for celebrations in candlelight. The same palette as our Burgundy website, so the two sit together perfectly.",
    palette: "burgundy",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "dusty-blue-save-the-date",
    name: "Dusty Blue",
    type: "save-the-date",
    style: "classic",
    price: 19,
    createdAt: "2025-12-02",
    shortDescription: "Cool, classic and easy to read on any screen.",
    description:
      "Cool, classic and easy to read on any screen. Ideal if you are announcing a date more than a year in advance.",
    palette: "dusty",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "brown-and-ivory-save-the-date",
    name: "Brown & Ivory",
    type: "save-the-date",
    style: "editorial",
    price: 19,
    createdAt: "2025-11-18",
    shortDescription: "Magazine proportions, reduced to an announcement.",
    description:
      "Deep brown type on ivory with magazine proportions. A save the date that looks like the opening page of a printed story.",
    palette: "brown",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  {
    slug: "black-and-white-save-the-date",
    name: "Black & White",
    type: "save-the-date",
    style: "black-white",
    price: 19,
    createdAt: "2025-10-05",
    shortDescription: "Charcoal and off-white, no colour at all.",
    description:
      "Charcoal and off-white, no colour at all. Minimal, graphic and perfectly suited to a single strong photograph.",
    palette: "mono",
    features: saveTheDateFeatures,
    whatsIncluded: saveTheDateWhatsIncluded,
    sections: saveTheDateSections,
  },
  /* --- Bundles --- */
  {
    slug: "modern-ivory-bundle",
    name: "Modern Ivory Bundle",
    type: "bundle",
    style: "minimal",
    price: 45,
    compareAtPrice: 49,
    createdAt: "2026-01-24",
    shortDescription: "The full wedding website and its Save the Date, in one palette.",
    description:
      "Both Canva templates in one purchase: the full Modern Ivory wedding website and its Save the Date page. One palette, one typographic voice, from the first announcement to the final RSVP.",
    palette: "ivory",
    features: bundleFeatures,
    whatsIncluded: bundleWhatsIncluded,
    sections: [...saveTheDateSections, ...weddingSections],
  },
  {
    slug: "garden-party-bundle",
    name: "Garden Party Bundle",
    type: "bundle",
    style: "garden",
    price: 45,
    compareAtPrice: 49,
    createdAt: "2025-11-26",
    shortDescription: "The Garden Party website and Save the Date, together.",
    description:
      "The Garden Party website and its Save the Date page together - for outdoor celebrations that begin with an announcement months before the first table is set.",
    palette: "garden",
    features: bundleFeatures,
    whatsIncluded: bundleWhatsIncluded,
    sections: [...saveTheDateSections, ...weddingSections],
  },
];

/** The purchasable template catalogue. */
export const products: Product[] = seeds.map(toProduct);

/**
 * Custom design is a SERVICE, not an instant template purchase: it is quoted
 * after a conversation and delivered bespoke, so it has no instant checkout and
 * no standard delivery assets.
 */
export const customDesignProduct: Product = {
  id: "custom-wedding-website",
  slug: "custom-wedding-website",
  name: "Custom Wedding Website",
  type: "custom",
  style: "editorial",
  price: 250,
  currency: "USD",
  priceFrom: true,
  shortDescription: "A wedding website designed from a blank page for your celebration.",
  description:
    "A wedding website designed specifically for your celebration: your story, your palette, your photographs, built from a blank page in Canva and delivered ready to publish.",
  coverImage: imagesFor("custom-wedding-website", "custom")[0],
  previewImages: imagesFor("custom-wedding-website", "custom"),
  previewAlts: altsFor("Custom Wedding Website", "custom"),
  demoUrl: "/demo/custom-wedding-website",
  includedSections: weddingSections,
  features: customFeatures,
  whatsIncluded: customWhatsIncluded,
  palette: palettes.stone,
  createdAt: "2026-02-10",
  published: true,
};

/** Every product in the catalogue, template and service alike. */
export const allProducts: Product[] = [...products, customDesignProduct];

/** True when the product is an instantly purchasable digital template. */
export function isPurchasableTemplate(
  product: Pick<Product, "type">,
): boolean {
  return (
    product.type === "wedding-website" ||
    product.type === "save-the-date" ||
    product.type === "bundle"
  );
}