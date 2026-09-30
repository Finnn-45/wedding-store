import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your purchase of a Blanc Weddings template. Digital delivery, instant access — nothing is shipped.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Checkout"
          title="Complete your purchase"
          description="Two quiet steps: your details, then your template. Everything is delivered digitally and immediately."
        />
        <div className="mt-12 lg:mt-16">
          <CheckoutView />
        </div>
      </Container>
    </section>
  );
}
