import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { licenseTerms } from "@/data/license";
import { typeLabels } from "@/data/products";
import { formatOrderDate } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/services/checkout-service";
import { purchaseAccessService } from "@/lib/services/purchase-access-service";

type AccessPageProps = PageProps<"/access/[token]">;

/**
 * Purchase access page — the customer's private delivery page.
 *
 * Noindex + no-store: it is reachable only with a valid token, and the token
 * must resolve to a PAID order. The Canva and PDF destinations are NOT in this
 * HTML — only the two token-scoped redirect routes, which re-verify server-side
 * on every click.
 */
export const metadata: Metadata = {
  title: "Your Purchase Access",
  description: "Access your purchased BLANC WEDDINGS template.",
  // Never index a credential-bearing URL.
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccessPage(props: AccessPageProps) {
  const { token } = await props.params;
  const grant = await purchaseAccessService.getPurchaseAccess(token);

  if (grant.state !== "ready" || !grant.order) {
    return (
      <section className="py-14 lg:py-20">
        <Container className="max-w-2xl">
          <Eyebrow>Purchase access</Eyebrow>
          <SectionHeading
            as="h1"
            title="This link is not available"
            description={grant.message}
          />
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href="/shop" size="lg">
              Browse templates
            </Button>
            <Link
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-body-sm text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              Contact the studio
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  const { order, product } = grant;


  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-3xl">
        <div className="flex flex-col gap-4">
          <Eyebrow>Purchase confirmed</Eyebrow>
          <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
            Your purchase is ready
          </h1>
          <p className="text-lead text-stone">
            Hello {order.customerName.split(" ")[0]} — your Canva template and
            setup guide are available below.
          </p>
        </div>

        <dl className="mt-10 grid gap-4 border-y border-line py-6 text-body sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Order</dt>
            <dd className="tabular-nums">{order.orderNumber}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Purchased</dt>
            <dd className="tabular-nums">
              {formatOrderDate(grant.purchasedAt ?? order.createdAt)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Product</dt>
            <dd className="text-right">{grant.productName}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Type</dt>
            <dd className="text-right">
              {product ? typeLabels[product.type] : "Digital template"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-stone">Total paid</dt>
            <dd className="tabular-nums">${order.total}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="shrink-0 text-stone">Delivered to</dt>
            <dd className="min-w-0 break-words text-right">
              {order.customerEmail}
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-col gap-4 border border-line bg-shell p-8 lg:p-10">
          <h2 className="font-serif text-title-sm uppercase tracking-[0.02em]">
            Your template
          </h2>
          <p className="text-body text-stone">
            Opening the template takes you to Canva, where you get your own
            editable copy. The original template stays private to the studio.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {/* Token-scoped redirect: the real Canva URL is never in this HTML. */}
            <Button href={grant.canvaAccessPath ?? "#"} size="lg">
              {grant.canvaLabel ?? "Open Template"}
            </Button>
            <Button
              href={grant.setupGuidePath ?? "#"}
              variant="outline"
              size="lg"
            >
              Download Setup Guide
            </Button>
          </div>
          <p className="text-body-sm text-stone">
            The setup guide PDF walks through editing names, dates, locations
            and text, publishing your site and sharing it with guests.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-eyebrow text-stone uppercase">Licence reminder</h2>
          <ul className="mt-4 flex flex-col gap-2 text-body-sm text-stone">
            {licenseTerms.slice(0, 5).map((term) => (
              <li key={term.title}>
                <span className="text-ink">{term.title}:</span> {term.text}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-body-sm text-stone">
            Please keep this page to yourself — anyone with the link can open
            your files. Need help? Email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-ink underline decoration-line underline-offset-4 transition-colors duration-300 hover:decoration-ink"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            with your order number {order.orderNumber}.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href="/account/purchases" variant="outline">
            My purchases
          </Button>
          <Button href="/shop" variant="ghost">
            Browse more templates
          </Button>
        </div>
      </Container>
    </section>
  );
}
