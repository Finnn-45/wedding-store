import { createHash, randomBytes } from "node:crypto";
import type {
  PurchaseAccess,
  PurchaseAccessRepository,
} from "@/lib/repositories/order-repository";
import type { PurchaseAccessRow } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * SupabasePurchaseAccessRepository — guest-purchase delivery credentials.
 *
 * SECURITY: only the SHA-256 HASH of a token is stored. The raw token is
 * generated here, handed to the buyer exactly once, and never persisted. A
 * leaked database dump therefore yields no usable access links.
 *
 * Signed-in customers do not need this table at all: they reach their order
 * by ownership (orders.user_id), verified server-side.
 */

/** 32 random bytes, hex encoded. Returned to the buyer, never stored. */
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

/** SHA-256 hex digest — this is what the database stores. */
export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function toAccess(row: PurchaseAccessRow): PurchaseAccess {
  return {
    id: row.id,
    // The raw token cannot be recovered; lookups go through the hash.
    token: "",
    orderId: row.order_id,
    orderNumber: "",
    productId: row.product_id,
    productName: "",
    customerEmail: row.customer_email,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revoked: row.revoked,
  };
}

export const supabasePurchaseAccessRepository: PurchaseAccessRepository = {
  async create(access) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("purchase_access")
      .upsert(
        {
          order_id: access.orderId,
          product_id: access.productId,
          customer_email: access.customerEmail,
          // Hash whatever token we were handed; if the caller already hashed
          // it, `access.token` stays empty and we use it as-is.
          token_hash: access.token ? hashAccessToken(access.token) : "",
          expires_at: access.expiresAt,
          revoked: access.revoked,
        },
        { onConflict: "order_id,product_id" },
      )
      .select("*")
      .single<PurchaseAccessRow>();

    if (error || !data) {
      throw new Error(`Could not create purchase access: ${error?.message ?? "unknown"}`);
    }
    return toAccess(data);
  },

  async getByToken(token) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("purchase_access")
      .select("*")
      .eq("token_hash", hashAccessToken(token))
      .maybeSingle<PurchaseAccessRow>();
    return data ? toAccess(data) : null;
  },

  async getByOrderId(orderId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("purchase_access")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    return ((data ?? []) as PurchaseAccessRow[]).map(toAccess);
  },
};