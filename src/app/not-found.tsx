import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

const suggestions = [
  { label: "All templates", href: "/shop" },
  { label: "How it works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "About the studio", href: "/about" },
];

const underlineLink =
  "text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink";

export default function NotFound() {
  return (
    <section className="flex min-h-[55vh] items-center py-16 lg:py-24">
      <Container className="flex flex-col gap-8">
        <Eyebrow>Error 404</Eyebrow>

        <h1 className="max-w-3xl font-serif text-display leading-[0.98] font-light uppercase tracking-display">
          This page is not
          <br />
          on the guest list
        </h1>

        <p className="max-w-lg text-lead text-stone">
          The link may be old, or the page has moved. Everything we make is
          still here.
        </p>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href="/" size="lg">
            Back to home
          </Button>
          <Link href="/shop" className={underlineLink}>
            Browse the collection
          </Link>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-8 text-body-sm">
          {suggestions.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-stone transition-colors duration-300 hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}