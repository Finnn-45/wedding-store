import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  size?: "default" | "large";
  as?: "h1" | "h2" | "h3";
  className?: string;
  descriptionClassName?: string;
};

/**
 * Editorial section header: tracked eyebrow, large serif title, quiet lead
 * paragraph. Used by every storefront section so rhythm stays identical.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  size = "default",
  as: Tag = "h2",
  className,
  descriptionClassName,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        centered && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

      <Tag
        className={cn(
          "font-serif font-light uppercase tracking-[0.02em]",
          size === "large" ? "text-display" : "text-heading",
        )}
      >
        {title}
      </Tag>

      {description ? (
        <p
          className={cn(
            "max-w-xl text-lead text-stone",
            centered && "mx-auto",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
