import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A quiet browser window around a site preview: three dots and a URL pill.
 * Signals "this is a website" without looking like a SaaS screenshot.
 */
export function BrowserFrame({
  url = "yourwedding.com",
  className,
  bodyClassName,
  children,
}: {
  url?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xs border border-line bg-shell",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-line bg-cream/70 px-4 py-2.5">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone/35" />
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone/35" />
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stone/35" />
        <span
          aria-hidden="true"
          className="ml-3 hidden items-center text-[0.625rem] tracking-button text-stone/80 uppercase sm:flex"
        >
          {url}
        </span>
      </div>
      <div className={bodyClassName}>{children}</div>
    </figure>
  );
}
