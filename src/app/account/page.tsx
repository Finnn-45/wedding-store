import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/account/OrderLookupForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Look up your BLANC WEDDINGS purchases and open your template access pages.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHeading
            as="h1"
            eyebrow="Your purchases"
            title="My account"
            description="Every template you have bought, its order status and its private access page — looked up with the email you checked out with."
          />

          <p className="max-w-xl text-body text-stone">
            Sign-in arrives with the production build. Until then this lookup is
            the front door: no passwords are stored, and only your own orders
            are shown.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="/account/purchases" size="lg">
              My purchases
            </Button>
            <Button href="/shop" variant="outline" size="lg">
              Browse templates
            </Button>
          </div>
        </div>

        <aside className="border border-line bg-shell p-8 lg:p-10">
          <OrderLookupForm />
        </aside>
      </Container>
    </section>
  );
}
