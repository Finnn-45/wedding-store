export type NavLink = {
  label: string;
  href: string;
};

/** Primary shop navigation — the left side of the header. */
export const primaryNav: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Save the Date", href: "/shop?type=save-the-date" },
  { label: "Wedding Websites", href: "/shop?type=wedding-website" },
];

/** Secondary studio navigation — slim strip above the main bar. */
export const secondaryNav: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
];

/** Footer link columns. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Templates", href: "/shop" },
      { label: "Wedding Websites", href: "/shop?type=wedding-website" },
      { label: "Save the Date", href: "/shop?type=save-the-date" },
      { label: "Bundles", href: "/shop?type=bundle" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "About", href: "/about" },
      { label: "Custom Design", href: "/custom" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Your Cart", href: "/cart" },
      { label: "My Purchases", href: "/account/purchases" },
    ],
  },
];
