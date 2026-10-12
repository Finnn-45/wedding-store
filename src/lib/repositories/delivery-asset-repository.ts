/**
 * Delivery assets — the private Canva template URL and the setup-guide PDF.
 *
 * This is the ONLY seam through which a customer ever receives a delivery
 * destination. The values are resolved server-side, after a purchase-access
 * token has been verified against a PAID order (see PurchaseAccessService),
 * and are never rendered into public HTML, JSON, metadata or bundles.
 *
 * Two implementations satisfy the same interface and are chosen in
 * `repositories/index.ts`:
 *   - Supabase: reads the private `delivery_assets` row and mints a SHORT-LIVED
 *     SIGNED URL for the PDF from private storage. Production path.
 *   - Mock: returns the hardcoded demo map. Development / fresh-clone path.
 *
 * Server only — a client component must never import this.
 */

export type ResolvedDeliveryAsset = {
  /** The customer's "view + make a copy" Canva link (master stays private). */
  canvaTemplateUrl: string;
  /**
   * A ready-to-use setup-guide URL. In production this is a short-lived signed
   * URL to private storage; in the mock it is a local demo route. Either way it
   * is minted only after the token check, never cached, never public.
   */
  setupGuideUrl: string;
};

export interface DeliveryAssetRepository {
  /**
   * Both delivery destinations for a product, or null when the product has no
   * delivery configured (e.g. the custom service, or an admin who has not
   * uploaded the files yet). A null here surfaces as "asset_missing".
   */
  getByProductId(productId: string): Promise<ResolvedDeliveryAsset | null>;
}
