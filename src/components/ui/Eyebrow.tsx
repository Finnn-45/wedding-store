import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/utils";

type EyebrowProps = ComponentProps<"p"> & {
  as?: ElementType;
};

/**
 * Small tracked label used above editorial headings.
 * Size, tracking and weight come from the `text-eyebrow` design token.
 */
export function Eyebrow({
  as: Tag = "p",
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <Tag className={cn("text-eyebrow text-stone uppercase", className)} {...props}>
      {children}
    </Tag>
  );
}
