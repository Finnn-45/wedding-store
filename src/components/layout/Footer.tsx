import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerNav } from "@/data/navigation";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-shell lg:mt-32">
      <Container className="py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-x-8">
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-1">
            <Link
              href="/"
              className="font-serif text-title uppercase tracking-[0.28em]"
            >
              Blanc Weddings
            </Link>
            <p className="max-w-xs text-body text-stone">
              Digital wedding websites for modern couples. An independent
              template studio — every design is a complete website you can make
              your own.
            </p>
            <p className="text-eyebrow uppercase text-stone">
              Digital products only · Instant download
            </p>
          </div>

          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-eyebrow uppercase text-stone">
                {column.title}
              </h2>
              <ul className="mt-6 flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-ink/80 transition-colors duration-300 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 text-body-sm text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Blanc Weddings. All rights reserved.</p>
          <p>Digital product — no physical item will be shipped.</p>
        </div>
      </Container>
    </footer>
  );
}
