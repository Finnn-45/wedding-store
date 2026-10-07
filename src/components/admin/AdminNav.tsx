"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = {
  href: string;
  label: string;
  note: string;
};

/** Admin navigation — deliberately small, matching the studio's tone. */
export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", note: "Overview" },
  { href: "/admin/products", label: "Products", note: "Catalogue" },
  { href: "/admin/orders", label: "Orders", note: "Sales" },
  { href: "/admin/coupons", label: "Coupons", note: "Discounts" },
  { href: "/admin/customers", label: "Customers", note: "Accounts" },
  { href: "/admin/delivery", label: "Delivery", note: "Assets" },
];

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-1">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex items-baseline justify-between gap-3 border-l-2 border-ink py-2 pl-3 text-body-sm text-ink"
                    : "flex items-baseline justify-between gap-3 border-l-2 border-transparent py-2 pl-3 text-body-sm text-stone transition-colors duration-300 hover:text-ink"
                }
              >
                <span>{item.label}</span>
                <span className="text-eyebrow uppercase text-stone-soft">
                  {item.note}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}