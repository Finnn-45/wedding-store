import Link from "next/link";
import { CartButton } from "@/components/cart/CartButton";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { Container } from "@/components/ui/Container";
import { primaryNav, secondaryNav } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ivory/90 backdrop-blur-md">
      {/* Secondary studio menu — desktop only, keeps the main bar weightless. */}
      <div className="hidden border-b border-line/60 lg:block">
        <Container className="flex h-9 items-center justify-end gap-8">
          {secondaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.625rem] uppercase tracking-button text-stone transition-colors duration-300 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </div>

      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4 lg:grid lg:h-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        <nav aria-label="Shop" className="hidden lg:flex lg:items-center lg:gap-9">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-eyebrow uppercase text-ink/75 transition-colors duration-300 hover:text-ink"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-0 bg-ink transition-[width] duration-500 ease-editorial group-hover:w-full"
              />
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="whitespace-nowrap font-serif text-[0.8125rem] uppercase tracking-[0.18em] text-ink sm:text-[1.0625rem] sm:tracking-[0.25em] lg:justify-self-center lg:text-[1.125rem] lg:tracking-[0.3em]"
        >
          Blanc Weddings
        </Link>

        <div className="flex items-center gap-0.5 lg:justify-self-end lg:gap-3">
          <SearchPanel />
          <MobileNav />
          <CartButton />
        </div>
      </Container>
    </header>
  );
}
