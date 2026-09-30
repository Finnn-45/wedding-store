import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your wedding website templates and continue to checkout. Digital delivery, instant access.",
};

export default function CartPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Checkout"
          title="Your cart"
          description="Review your templates, then continue to checkout. Nothing is shipped — your files and access details are delivered digitally."
        />
        <div className="mt-12 lg:mt-16">
          <CartView />
        </div>
      </Container>
    </section>
  );
}
