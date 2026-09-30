"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/useCart";
import { BagIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-xs px-2 py-2 text-stone transition-colors duration-300 ease-editorial hover:text-ink",
        className,
      )}
    >
      <BagIcon />
      <span className="hidden text-eyebrow uppercase lg:inline">Cart</span>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.5625rem] leading-none text-ivory tabular-nums lg:static lg:h-auto lg:min-w-0 lg:bg-transparent lg:p-0 lg:text-eyebrow lg:text-ink"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
