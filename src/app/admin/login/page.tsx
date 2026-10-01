import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="py-20 lg:py-28">
      <Container className="max-w-md">
        <Eyebrow>BLANC WEDDINGS</Eyebrow>
        <h1 className="mt-4 font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Admin
        </h1>
        <p className="mt-4 text-body text-stone">
          Staff access only. Access is granted per account in the database — there
          is no public registration.
        </p>
        <div className="mt-10 border border-line bg-shell p-8">
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}