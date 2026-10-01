import type { Metadata } from "next";
import { WeddingCountdown } from "@/components/wedding/WeddingCountdown";
import { WeddingDetails } from "@/components/wedding/WeddingDetails";
import { WeddingFooter } from "@/components/wedding/WeddingFooter";
import { WeddingGallery } from "@/components/wedding/WeddingGallery";
import { WeddingHero } from "@/components/wedding/WeddingHero";
import { WeddingNav } from "@/components/wedding/WeddingNav";
import { WeddingRsvp } from "@/components/wedding/WeddingRsvp";
import { WeddingStory } from "@/components/wedding/WeddingStory";

export const metadata: Metadata = {
  title: "Julia & Alex — 24.08.2027",
  description:
    "Julia & Alex are getting married — 24 August 2027, Jakarta, Indonesia. Join us to celebrate.",
  alternates: { canonical: "/wedding" },
  robots: { index: false, follow: false },
};

/**
 * Standalone wedding microsite (fictional demo couple, Modern Ivory
 * direction). Rendered on its own page without the store header so the
 * demo reads exactly like a finished invitation.
 */
export default function WeddingPage() {
  return (
    <div className="wedding-demo flex flex-1 flex-col">
      <p className="border-b border-line bg-shell px-5 py-2 text-center text-[0.625rem] tracking-[0.22em] text-stone uppercase">
        Demo invitation — fictional couple, sample content
      </p>
      <WeddingNav />
      <main id="main" className="flex-1">
        <WeddingHero />
        <WeddingStory />
        <WeddingDetails />
        <WeddingCountdown />
        <WeddingGallery />
        <WeddingRsvp />
      </main>
      <WeddingFooter />
    </div>
  );
}
