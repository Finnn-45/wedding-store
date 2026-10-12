import "server-only";
import type {
  DeliveryAssetRepository,
  ResolvedDeliveryAsset,
} from "@/lib/repositories/delivery-asset-repository";
import type { DeliveryAssetRow } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKETS, isServiceRoleConfigured } from "@/lib/supabase/config";

/**
 * SupabaseDeliveryAssetRepository — the PRODUCTION delivery path.
 *
 * Reads the private `delivery_assets` row (no public RLS policy — service-role
 * only) and mints a SHORT-LIVED SIGNED URL for the setup PDF from the private
 * `blanc-private` bucket. The signed URL is created here, per request, only
 * after the purchase-access service has already verified a PAID order — so the
 * link cannot be produced without a real purchase, and it expires quickly.
 *
 * The Canva URL is a "view + make a copy" link the customer opens in their own
 * workspace; the master design is never shared. (Once a customer has the Canva
 * link they could share it — that is a known, documented limit of any
 * link-based delivery, mitigated by licence terms and Canva's copy model.)
 */

/** Signed-URL lifetime for a purchased setup guide. Short by design. */
const PDF_URL_TTL_SECONDS = 300;

export const supabaseDeliveryAssetRepository: DeliveryAssetRepository = {
  async getByProductId(productId) {
    if (!isServiceRoleConfigured()) return null;

    const admin = createAdminClient();

    const { data: asset } = await admin
      .from("delivery_assets")
      .select("canva_template_url, setup_pdf_path")
      .eq("product_id", productId)
      .maybeSingle<Pick<DeliveryAssetRow, "canva_template_url" | "setup_pdf_path">>();

    if (!asset?.canva_template_url || !asset.setup_pdf_path) return null;

    // Mint a short-lived signed URL to the PRIVATE bucket. The path itself is
    // never exposed; only this time-boxed URL is, and only to a verified buyer.
    const { data: signed, error } = await admin.storage
      .from(BUCKETS.private)
      .createSignedUrl(asset.setup_pdf_path, PDF_URL_TTL_SECONDS, {
        download: false,
      });

    if (error || !signed?.signedUrl) {
      // Fail closed: a missing/unavailable file must never hand out the Canva
      // link with no way to reach the guide. The caller treats null as
      // "asset_missing" and the customer is told the files are being prepared.
      console.error(
        "[delivery] signed url failed:",
        error?.message ?? "no signed url returned",
      );
      return null;
    }

    const resolved: ResolvedDeliveryAsset = {
      canvaTemplateUrl: asset.canva_template_url,
      setupGuideUrl: signed.signedUrl,
    };
    return resolved;
  },
};
