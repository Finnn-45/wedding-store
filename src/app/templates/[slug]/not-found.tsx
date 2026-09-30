import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Editorial 404 for unknown template slugs (§15). */
export default function TemplateNotFound() {
  return (
    <section className="flex min-h-[55vh] items-center py-16 lg:py-24">
      <Container className="flex flex-col items-start gap-8">
        <Eyebrow>Error 404</Eyebrow>

        <h1 className="max-w-3xl font-serif text-display leading-[0.98] font-light uppercase tracking-display">
          This design could
          <br />
          not be found
        </h1>

        <p className="max-w-lg text-lead text-stone">
          The template you&rsquo;re looking for may have moved. The full
          collection is still here.
        </p>

        <Button href="/shop" size="lg">
          Back to shop
        </Button>
      </Container>
    </section>
  );
}
