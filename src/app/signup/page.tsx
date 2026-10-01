import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-xl">
        <Eyebrow>Your account</Eyebrow>
        <SectionHeading
          as="h1"
          title="Create an account"
          description="One account for your purchases, your Canva templates and your setup guides."
        />
        <div className="mt-10 border border-line bg-shell p-8 lg:p-10">
          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
        <div className="mt-8">
          <Button href="/login" variant="ghost">
            Already have an account
          </Button>
        </div>
      </Container>
    </section>
  );
}