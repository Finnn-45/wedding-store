import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { siteUrl } from "@/lib/site";
import "./globals.css";
/* Editorial serif — headings, collection titles, brand statements. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Quiet sans — navigation, product names, prices, buttons. */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BLANC WEDDINGS | Elegant Digital Wedding Website Templates",
    template: "%s | BLANC WEDDINGS",
  },
  description:
    "Editable Canva wedding website templates for modern couples — elegant, mobile-ready and delivered instantly.",
  applicationName: "BLANC WEDDINGS",
  keywords: [
    "wedding website template",
    "canva wedding website template",
    "digital wedding invitation",
    "wedding website design",
    "modern wedding template",
  ],
  creator: "BLANC WEDDINGS",
  publisher: "BLANC WEDDINGS",
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* Next 16 no longer forces instant scroll on navigation: this opt-in
         keeps our global smooth scrolling from animating route changes. */
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-ivory font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2.5 focus:text-eyebrow focus:text-ivory focus:uppercase"
        >
          Skip to content
        </a>

        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
