import { getDeliveryAssets, hasDeliveryAssets } from "@/lib/private/delivery-assets";
import type {
  DeliveryAssetRepository,
  ResolvedDeliveryAsset,
} from "@/lib/repositories/delivery-asset-repository";

/**
 * Mock delivery assets: the hardcoded demo map in
 * `src/lib/private/delivery-assets.ts`. Used when Supabase is not configured.
 *
 * NOT production-grade — the Canva URLs are placeholders and the "signed URL"
 * is a local route that generates a demo PDF. The production path lives in
 * `src/lib/supabase/repositories/delivery-asset-repository.ts`.
 */
export const mockDeliveryAssetRepository: DeliveryAssetRepository = {
  async getByProductId(productId) {
    if (!hasDeliveryAssets(productId)) return null;
    const asset = getDeliveryAssets(productId);
    const resolved: ResolvedDeliveryAsset = {
      canvaTemplateUrl: asset.canvaTemplateUrl,
      setupGuideUrl: asset.setupPdfUrl,
    };
    return resolved;
  },
};
