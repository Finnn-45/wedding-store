import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccordionItemData = {
  title: string;
  content: ReactNode;
};

/**
 * Minimal accordion built on native <details>/<summary>: keyboard and screen
 * reader support come from the platform, with no client JavaScript.
 */
export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}) {
  return (
    <div className={cn("border-y border-line", className)}>
      {items.map((item, index) => (
        <details
          key={item.title}
          className={cn("group", index > 0 && "border-t border-line")}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <span className="font-serif text-title-sm">{item.title}</span>
            <span aria-hidden="true" className="relative block h-3 w-3 shrink-0">
              <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-ink" />
              <span className="absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-ink transition-transform duration-300 ease-editorial group-open:scale-y-0 motion-reduce:transition-none" />
            </span>
          </summary>
          <div className="max-w-2xl pb-7 text-body text-stone">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
