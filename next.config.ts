import type { NextConfig } from "next";

/**
 * SECURITY HEADERS.
 *
 * Applied to every dynamic route (excluding Next.js internal static assets).
 * Next.js automatically applies its own strict CSP to its client scripts, so
 * we deliberately skip `default-src` CSP here — a restrictive one needs a
 * full audit of inline scripts/styles and `next/script` usage first.
 *
 * References:
 *  - OWASP Secure Headers Project
 *  - MDN CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
 */
const securityHeaders = [
  // Prevent the page from being framed (clickjacking). `DENY` is stricter than
  // `SAMEORIGIN` and is the right default for a self-contained web app.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from guessing the MIME type of a response.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Drop the full origin when navigating away; keep only the path/scheme.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable features the app never needs (geolocation, camera, mic, USB).
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=(), usb=(), speaker=(self)",
  },
  // Isolate this origin from cross-origin iframes (COOP).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Require CORP/SRI for cross-origin loads (COEP).
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
];

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Match every route except Next.js-internal static assets.
        source: "/((?!_next/static|_next/image|favicon|images).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

