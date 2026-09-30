import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  default: "max-w-editorial",
  narrow: "max-w-narrow",
  wide: "max-w-wide",
} as const;

export type ContainerProps = ComponentProps<"div"> & {
  size?: keyof typeof sizes;
};

/**
 * Editorial page gutter. Generous, responsive horizontal rhythm used by every
 * section so vertical rails line up across the site.
 */
export function Container({
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
