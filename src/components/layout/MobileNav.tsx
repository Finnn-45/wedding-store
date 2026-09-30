"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { primaryNav, secondaryNav } from "@/data/navigation";

/**
 * Mobile menu. Built on the native <dialog> element so focus trapping,
 * Escape-to-close and inert background come from the platform.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Any navigation closes the menu.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-xs px-2 py-2 text-stone transition-colors duration-300 ease-editorial hover:text-ink lg:hidden"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-ivory p-0 backdrop:bg-ink/30 lg:hidden"
      >
        <div className="flex h-full flex-col overflow-y-auto overscroll-contain">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <Link
              href="/"
              className="font-serif text-[1.0625rem] uppercase tracking-[0.3em] text-ink"
            >
              Blanc Weddings
            </Link>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close menu"
              className="rounded-xs p-2 text-stone transition-colors duration-300 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Shop" className="border-b border-line px-5 py-8">
            <ul className="flex flex-col gap-6">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-serif text-heading-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Studio" className="border-b border-line px-5 py-8">
            <ul className="flex flex-col gap-5">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-eyebrow uppercase text-stone"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-5 py-8">
            <Link href="/custom" className="flex flex-col gap-2">
              <span className="text-eyebrow uppercase text-stone">
                Need something personal?
              </span>
              <span className="font-serif text-title">
                Custom Wedding Website Design
              </span>
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
