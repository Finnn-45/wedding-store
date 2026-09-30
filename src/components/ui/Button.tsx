import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-xs font-sans text-eyebrow uppercase transition-colors duration-300 ease-editorial disabled:pointer-events-none disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ivory hover:bg-brown",
  outline: "border border-ink/20 text-ink hover:border-ink/60 hover:bg-ink/3",
  ghost: "text-stone hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5",
  md: "px-7 py-3.5",
  lg: "px-9 py-4",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export type ButtonProps =
  | (CommonProps & { href: string } & Omit<
        ComponentProps<typeof Link>,
        "href" | "className" | "children"
      >)
  | (CommonProps & { href?: undefined } & Omit<
        ComponentProps<"button">,
        "className" | "children"
      >);

/**
 * Understated editorial button. Renders a `next/link` when `href` is given,
 * otherwise a real `<button>`. Server Component safe — no client JS.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { href, ...linkProps } = props;

    // Protocol links (mailto:, tel:, http) must not pass through the router.
    if (/^(?:https?:|mailto:|tel:)/.test(href)) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type, ...buttonProps } = props as Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

  return (
    <button type={type ?? "button"} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
