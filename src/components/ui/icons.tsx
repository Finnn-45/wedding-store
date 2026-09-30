import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...defaults} {...props}>
      <circle cx="11" cy="11" r="6.25" />
      <path d="M15.6 15.6 20 20" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...defaults} {...props}>
      <path d="M3.5 7.5h17M3.5 16.5h17" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...defaults} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...defaults} {...props}>
      <path d="M5.5 8.5h13l-1 11.5h-11z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...defaults} {...props}>
      <path d="M4 12h15.5M14 6.5 19.5 12 14 17.5" />
    </svg>
  );
}
