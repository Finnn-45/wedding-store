/**
 * ==========================================================================
 * PRIVATE — DELIVERY ASSETS. NEVER IMPORT THIS FROM A CLIENT COMPONENT.
 * ==========================================================================
 * This module holds the ONLY place where purchased delivery URLs live:
 *
 *   canvaTemplateUrl → the customer's own editable copy of the Canva template
 *   setupPdfUrl      → the setup / instruction guide PDF
 *
 * SECURITY RULES (enforced by review, see `PurchaseAccessService`):
 *  1. Never import this file from anything under `src/components/**` with a
 *     "use client" directive, or from `src/data/**`. Both are shipped to the
 *     browser.
 *  2. These values must never be rendered into public HTML, JSON, metadata,
 *     sitemap, or any client component payload. They are only ever resolved
 *     server-side, after a purchase-access token is verified, and then handed
 *     to the browser as a redirect target (never as a visible link).
 *  3. The mock values below are placeholders. In production these resolve to
 *     signed, short-lived URLs from private storage — see README "Future
 *     production implementation".
 *
 * IMPORTANT — the honest security model (§8):
 * Once a customer has a Canva template link they can share it. We do not
 * pretend otherwise. The mitigations are: BLANC-side access control, private
 * storage for the PDF, licence terms, and Canva's own copy/view mechanism
 * (customers work in their own copy; they are never given the master).
 * ==========================================================================
 */

export type DeliveryAssets = {
  /**
   * Opens the customer's own editable copy of the Canva template.
   * Prefer a Canva "view + make a copy" URL over a shared edit link, so the
   * master workspace is never exposed.
   */
  canvaTemplateUrl: string;
  /** Setup / instruction guide PDF (private storage in production). */
  setupPdfUrl: string;
  /** Short human label for the Canva destination. */
  canvaLabel: string;
};

/**
 * Keyed by product id. Custom design is a service and therefore absent: it is
 * delivered by a conversation, not by a self-service download.
 */
const assets: Record<string, DeliveryAssets> = {
  "modern-ivory": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-MODERN-IVORY-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/modern-ivory?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "olive-green": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-OLIVE-GREEN-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/olive-green?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  burgundy: {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BURGUNDY-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/burgundy?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "brown-and-ivory": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BROWN-IVORY-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/brown-and-ivory?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "dusty-blue": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-DUSTY-BLUE-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/dusty-blue?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "black-and-white": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BLACK-WHITE-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/black-and-white?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "garden-party": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-GARDEN-PARTY-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/garden-party?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "classic-ivory": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-CLASSIC-IVORY-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/classic-ivory?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "editorial-stone": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-EDITORIAL-STONE-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/editorial-stone?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "plein-air": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-PLEIN-AIR-WEBSITE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/plein-air?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "pearl-and-ivory": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-PEARL-IVORY-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/pearl-and-ivory?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "sage-and-ivory": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-SAGE-IVORY-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/sage-and-ivory?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "blush-and-sage": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BLUSH-SAGE-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/blush-and-sage?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "modern-ivory-save-the-date": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-MODERN-IVORY-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/modern-ivory-save-the-date?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "burgundy-save-the-date": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BURGUNDY-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/burgundy-save-the-date?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "dusty-blue-save-the-date": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-DUSTY-BLUE-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/dusty-blue-save-the-date?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "brown-and-ivory-save-the-date": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BROWN-IVORY-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/brown-and-ivory-save-the-date?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "black-and-white-save-the-date": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-BLACK-WHITE-STD/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/black-and-white-save-the-date?order=BW-MOCK&token=mock",
    canvaLabel: "Open in Canva",
  },
  "modern-ivory-bundle": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-MODERN-IVORY-BUNDLE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/modern-ivory-bundle?order=BW-MOCK&token=mock",
    canvaLabel: "Open both in Canva",
  },
  "garden-party-bundle": {
    canvaTemplateUrl:
      "https://www.canva.com/design/MOCK-GARDEN-PARTY-BUNDLE/edit?utm_content=blanc",
    setupPdfUrl:
      "/api/delivery/mock/guides/garden-party-bundle?order=BW-MOCK&token=mock",
    canvaLabel: "Open both in Canva",
  },
};

/**
 * Server-only accessor. There is deliberately no way to enumerate this map
 * from the client: callers must already know the product id.
 *
 * @throws if the product has no delivery assets (e.g. the custom service).
 */
export function getDeliveryAssets(productId: string): DeliveryAssets {
  const found = assets[productId];
  if (!found) {
    throw new Error(`No delivery assets configured for product "${productId}"`);
  }
  return found;
}

/** Whether this product can be delivered self-service. */
export function hasDeliveryAssets(productId: string): boolean {
  return Object.hasOwn(assets, productId);
}

