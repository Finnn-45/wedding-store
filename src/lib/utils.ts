import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default `text-*` sizes, so our custom
 * editorial tokens (see the @theme block in globals.css) were classified as
 * text-colours and silently dropped whenever a colour class followed them —
 * e.g. "text-eyebrow text-stone" lost the whole eyebrow style. Registering
 * them under font-size restores correct merging.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "eyebrow",
            "body-sm",
            "body",
            "lead",
            "title-sm",
            "title",
            "heading-sm",
            "heading",
            "display",
            "display-xl",
          ],
        },
      ],
    },
  },
});

/** Merge conditional class names, resolving Tailwind conflicts predictably. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
