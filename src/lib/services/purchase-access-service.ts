import { randomBytes } from "node:crypto";
import type { Order, Product } from "@/lib/repositories";
import {
  orderRepository,
  purchaseAccessRepository,
  productRepository,
} from "@/lib/repositories";
import {
  getDeliveryAssets,
  hasDeliveryAssets,
} from "@/lib/private/delivery-assets";

/**
 * Purchase access layer — the ONLY door to delivery assets.
 *
 * Everything a customer receives is resolved here, server-side, after a token
 * is verified against a PAID order. Public product pages, metadata, client
 * bundles and JSON APIs never touch this module.
 *
 * SECURITY MODEL — stated honestly (§8):
 * a token is a bearer credential. It is long, random, single-purpose and
 * revocable, and it only works while the order is paid. But once a customer
 * has a Canva template link they could share it, and NO link-based system can
 * prevent that. Our defences are BLANC-side access control, private PDF
 * storage, licence terms, and Canva's own copy mechanism (the customer edits
 * their own copy; the master workspace is never shared).
 *
 * FUTURE PRODUCTION IMPLEMENTATION:
 *   1. Verify the token (hashed at rest, compared in constant time)
 *   2. Load the order
 *   3. Require status === "paid"
 *   4. Confirm the product is in that order
 *   5. Return delivery assets — for the PDF a SHORT-LIVED SIGNED URL from
 *      private storage, never a permanent path
 *
 * MOCK ONLY: tokens are plain random hex in a local JSON file and the "signed
 * URL" is a local route. Not production-grade.
 */
export type PurchaseAccessState =
  | "ready"
  | "invalid_token"
  | "revoked"
  | "expired"
  | "unpaid"
  | "asset_missing";

/** What the access page needs. Contains no secret — assets stay server-side. */
export type PurchaseAccessGrant = {
  state: PurchaseAccessState;
  order?: Order;
  product?: Product;
  productName?: string;
  orderNumber?: string;
  purchasedAt?: string;
  /** Token-scoped routes that re-verify server-side. Safe to render. */
  canvaAccessPath?: string;
  setupGuidePath?: string;
  canvaLabel?: string;
  /** Customer-facing explanation, never a technical error. */
  message?: string;
};

export interface PurchaseAccessService {
  /** Full grant for a token — order + product + delivery paths. */
  getPurchaseAccess(token: string): Promise<PurchaseAccessGrant>;
  /** Resolves the Canva destination, or null. Server → server only. */
  getCanvaTemplateAccess(token: string): Promise<string | null>;
  /** Resolves the setup guide destination, or null. Server → server only. */
  getSetupGuideAccess(token: string): Promise<string | null>;
}

const FAILURES: Record<Exclude<PurchaseAccessState, "ready">, string> = {
  invalid_token:
    "This access link is not valid. Please use the link from your purchase confirmation email.",
  revoked:
    "This access link has been revoked. Please contact the studio for help with your order.",
  expired: "This access link has expired. Please contact the studio for help.",
  unpaid: "This order has not been paid yet, so delivery is not available yet.",
  asset_missing:
    "We are preparing the files for this template. You will get an email as soon as they are ready.",
};

/** 32 random bytes, hex encoded. Unguessable, opaque, no structure. */
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

const fail = (
  state: Exclude<PurchaseAccessState, "ready">,
): PurchaseAccessGrant => ({ state, message: FAILURES[state] });


type VerifiedAccess = { order: Order; productId: string };

class MockPurchaseAccessService implements PurchaseAccessService {
  /** Tokens are 32 hex bytes. Anything else is rejected without a lookup. */
  private static readonly TOKEN_PATTERN = /^[a-f0-9]{64}$/;

  /**
   * Shared verification used by all three methods — one place to audit:
   * well-formed token → exists → not revoked → not expired → PAID order →
   * product really is on that order.
   */
  private async verify(
    token: string,
  ): Promise<VerifiedAccess | PurchaseAccessGrant> {
    const invalid = fail("invalid_token");
    if (!MockPurchaseAccessService.TOKEN_PATTERN.test(token)) return invalid;

    const access = await purchaseAccessRepository.getByToken(token);
    if (!access) return invalid;
    if (access.revoked) return fail("revoked");
    if (access.expiresAt && new Date(access.expiresAt).getTime() < Date.now()) {
      return fail("expired");
    }

    // A token is worthless without a paid order behind it.
    const order = await orderRepository.getById(access.orderId);
    if (!order) return invalid;
    if (order.status !== "paid") return fail("unpaid");

    // …and the product must actually be on that order.
    const purchased = order.items.some(
      (item) => item.productId === access.productId,
    );
    if (!purchased) return invalid;

    return { order, productId: access.productId };
  }

  async getPurchaseAccess(token: string): Promise<PurchaseAccessGrant> {
    const verified = await this.verify(token);
    if ("state" in verified) return verified;

    const product = await productRepository.getById(verified.productId);
    if (!product || !hasDeliveryAssets(product.id)) {
      return { state: "asset_missing", message: FAILURES.asset_missing };
    }

    const item = verified.order.items.find(
      (entry) => entry.productId === product.id,
    );

    return {
      state: "ready",
      order: verified.order,
      product,
      productName: item?.productName,
      orderNumber: verified.order.orderNumber,
      purchasedAt: verified.order.paidAt ?? verified.order.createdAt,
      // Token-scoped internal routes. The browser never sees the real Canva
      // URL or the real PDF path — the server re-verifies on every request.
      canvaAccessPath: `/api/delivery/${token}/canva`,
      setupGuidePath: `/api/delivery/${token}/setup-guide`,
      canvaLabel: getDeliveryAssets(product.id).canvaLabel,
    };
  }

  async getCanvaTemplateAccess(token: string): Promise<string | null> {
    const verified = await this.verify(token);
    if ("state" in verified) return null;
    if (!hasDeliveryAssets(verified.productId)) return null;
    return getDeliveryAssets(verified.productId).canvaTemplateUrl;
  }

  async getSetupGuideAccess(token: string): Promise<string | null> {
    const verified = await this.verify(token);
    if ("state" in verified) return null;
    if (!hasDeliveryAssets(verified.productId)) return null;
    return getDeliveryAssets(verified.productId).setupPdfUrl;
  }
}

export const purchaseAccessService: PurchaseAccessService =
  new MockPurchaseAccessService();
