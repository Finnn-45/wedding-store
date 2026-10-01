"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { wedding, weddingNav } from "@/data/wedding";
import { cn } from "@/lib/utils";

/**
 * Minimal sticky wedding navigation for the standalone microsite. It pins to
 * the very top of the page (the studio header is suppressed on /wedding) and
 * collapses to a quiet hamburger menu on small screens.
 */
export function WeddingNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const sections = weddingNav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  return (
    <div className="sticky top-0 z-40 border-b border-line/70 bg-ivory/95 backdrop-blur-md">
      <Container>
        <nav
          aria-label="Wedding sections"
          className="flex h-14 items-center justify-between"
        >
          <a
            href="#home"
            className="font-serif text-sm tracking-[0.28em] text-ink uppercase"
          >
            {wedding.monogram}
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {weddingNav.map((item) => {
              const id = item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={active === id ? "true" : undefined}
                    className={cn(
                      "group relative py-1 text-eyebrow uppercase transition-colors duration-300",
                      active === id ? "text-ink" : "text-stone hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-0.5 left-0 h-px bg-ink transition-[width] duration-500 ease-editorial",
                        active === id ? "w-full" : "w-0 group-hover:w-full",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="wedding-menu"
            aria-label={open ? "Close wedding menu" : "Open wedding menu"}
            className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
          >
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span
                className={cn(
                  "absolute top-0 left-0 h-px w-5 bg-current transition-transform duration-300 ease-editorial",
                  open && "translate-y-[5.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-300 ease-editorial",
                  open && "-translate-y-[5.5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </nav>

        <div
          id="wedding-menu"
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-editorial md:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <ul className="overflow-hidden">
            {weddingNav.map((item) => (
              <li key={item.href} className="border-t border-line/70">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-eyebrow uppercase"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pb-5" aria-hidden="true" />
          </ul>
        </div>
      </Container>
    </div>
  );
}
