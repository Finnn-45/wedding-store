import { CustomDesignCta } from "@/components/home/CustomDesignCta";
import { EditorialBanner } from "@/components/home/EditorialBanner";
import { FaqSection } from "@/components/home/FaqSection";
import { FeaturedWebsites } from "@/components/home/FeaturedWebsites";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ShopByStyle } from "@/components/home/ShopByStyle";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedWebsites />
      <ShopByStyle />
      <EditorialBanner />
      <HowItWorks />
      <CustomDesignCta />
      <FaqSection />
    </>
  );
}


