"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Store chrome wrapper. The `/wedding` microsite renders its own editorial
 * chrome (WeddingNav + <main id="main"> + WeddingFooter), so the studio header
 * and footer are suppressed there and restored everywhere else. The bare
 * branch deliberately renders no wrapper of its own — the microsite supplies
 * the single <main> landmark for the skip link.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/wedding" || pathname.startsWith("/wedding/");

  if (bare) return <>{children}</>;

  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
