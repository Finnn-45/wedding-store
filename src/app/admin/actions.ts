"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKETS, isServiceRoleConfigured } from "@/lib/supabase/config";

/**
 * Admin server actions.
 *
 * Every action starts with `requireAdmin()`. That is the entire security
 * model for writes: the caller must hold a Supabase session AND a profiles
 * row with role = 'admin'. The browser cannot influence the outcome — there is
 * no role parameter, no hidden field, nothing to forge.
 *
 * The service-role client bypasses RLS, so this check is the ONLY thing
 * standing between the anonymous internet and the catalogue. It is therefore
 * called first, before any input is even read.
 */

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTPS_PATTERN = /^https:\/\/[^\s]+$/;
const TYPES = ["wedding-website", "save-the-date", "bundle", "custom"] as const;
const STYLES = [
  "modern",
  "editorial",
  "minimal",
  "garden",
  "classic",
  "romantic",
  "other",
] as const;

/** Signed URL lifetime for a purchased setup guide. Short by design. */
const PDF_URL_TTL_SECONDS = 120;

function text(formData: FormData, key: string, max = 5000): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function numberOf(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Rejects javascript:, data:, http: and relative URLs. */
function validateHttps(value: string, field: string, errors: Record<string, string>) {
  if (!value) return null;
  if (!HTTPS_PATTERN.test(value)) {
    errors[field] = "Must be a full https:// URL";
    return null;
  }
  return value;
}

function logAction(
  action: string,
  entityType: string,
  entityId: string | null,
  adminUserId: string,
  metadata: Record<string, unknown> = {},
) {
  // Best effort: an audit failure must never fail the operation. The
  // PostgREST builder is thenable but not a real Promise, so it is wrapped
  // before an error handler is attached.
  try {
    void Promise.resolve(
      createAdminClient()
        .from("admin_audit_logs")
        .insert({
          admin_user_id: adminUserId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata,
        }),
    ).catch((error: unknown) => {
      console.error("[admin:audit] could not write log:", error);
    });
  } catch (error) {
    console.error("[admin:audit] could not queue log:", error);
  }
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export async function saveProductAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const admin = createAdminClient();

  const errors: Record<string, string> = {};
  const id = text(formData, "id", 64);
  const name = text(formData, "name", 120);
  const slug = text(formData, "slug", 120).toLowerCase();
  const type = text(formData, "type", 40);
  const style = text(formData, "style", 40);
  const price = numberOf(text(formData, "price", 20));
  const compareAt = numberOf(text(formData, "compareAtPrice", 20));

  if (!name) errors.name = "Name is required";
  if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and hyphens only";
  }
  if (!TYPES.includes(type as (typeof TYPES)[number])) errors.type = "Pick a type";
  if (!STYLES.includes(style as (typeof STYLES)[number])) {
    errors.style = "Pick a style";
  }
  if (price === null) errors.price = "Price must be zero or more";

  const demoUrl = validateHttps(
    text(formData, "demoUrl", 500),
    "demoUrl",
    errors,
  );

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields", fieldErrors: errors };
  }

  const row = {
    name,
    slug,
    type,
    style,
    price,
    compare_at_price: compareAt,
    short_description: text(formData, "shortDescription", 300),
    description: text(formData, "description", 8000),
    currency: text(formData, "currency", 3) || "USD",
    cover_image: text(formData, "coverImage", 500) || null,
    demo_url: demoUrl,
    included_sections: text(formData, "includedSections", 4000)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    features: text(formData, "features", 4000)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    whats_included: text(formData, "whatsIncluded", 4000)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    price_from: formData.get("priceFrom") === "on",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };

  if (id) {
    const { error } = await admin.from("products").update(row).eq("id", id);
    if (error) {
      console.error("[admin:products] update failed:", error.message);
      return { ok: false, message: "Could not save the product" };
    }
    logAction("product_updated", "product", id, session.user.id, { slug });
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/admin/products");
    return { ok: true, message: "Product saved" };
  }

  const { data, error } = await admin
    .from("products")
    .insert(row)
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    console.error("[admin:products] insert failed:", error?.message);
    return {
      ok: false,
      message: "Could not create the product (is the slug already used?)",
    };
  }

  logAction("product_created", "product", data.id, session.user.id, { slug });
  revalidatePath("/admin/products");
  return { ok: true, message: "Product created", fieldErrors: {} };
}

export async function setProductPublishedAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const id = text(formData, "id", 64);
  const published = formData.get("published") === "true";

  if (!id) return { ok: false, message: "Missing product id" };

  const { error } = await createAdminClient()
    .from("products")
    .update({ published })
    .eq("id", id);

  if (error) return { ok: false, message: "Could not update the product" };

  logAction(published ? "product_published" : "product_unpublished", "product", id, session.user.id);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true, message: published ? "Product published" : "Product unpublished" };
}

export async function deleteProductAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const id = text(formData, "id", 64);
  if (!id) return { ok: false, message: "Missing product id" };

  const admin = createAdminClient();

  // A product with order history must not be deleted: the order_items rows
  // reference it and the customer still needs the record.
  const { count } = await admin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message:
        "This product has sales history and cannot be deleted. Unpublish it instead.",
    };
  }

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not delete the product" };

  logAction("product_deleted", "product", id, session.user.id);
  revalidatePath("/admin/products");
  return { ok: true, message: "Product deleted" };
}

/* ------------------------------------------------------------------ */
/* Delivery assets (PRIVATE)                                           */
/* ------------------------------------------------------------------ */

export async function saveDeliveryAssetAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const admin = createAdminClient();

  const errors: Record<string, string> = {};
  const productId = text(formData, "productId", 64);
  const canvaUrl = validateHttps(
    text(formData, "canvaTemplateUrl", 800),
    "canvaTemplateUrl",
    errors,
  );
  const setupPath = text(formData, "setupPdfPath", 500);

  if (!productId) errors.productId = "Missing product";
  if (!canvaUrl) errors.canvaTemplateUrl = "A Canva template URL is required";
  if (!setupPath) errors.setupPdfPath = "A setup guide path is required";
  else if (!setupPath.startsWith(`${BUCKETS.private}/`)) {
    errors.setupPdfPath = `The path must start with ${BUCKETS.private}/`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields", fieldErrors: errors };
  }

  const row = {
    product_id: productId,
    canva_template_url: canvaUrl,
    setup_pdf_path: setupPath,
  };

  const { error } = await admin
    .from("delivery_assets")
    .upsert(row, { onConflict: "product_id" });

  if (error) return { ok: false, message: "Could not save the delivery assets" };

  logAction("delivery_asset_updated", "delivery_asset", productId, session.user.id);
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, message: "Delivery assets saved" };
}

/** Uploads a setup guide PDF to the PRIVATE bucket and returns its path. */
export async function uploadSetupGuideAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isServiceRoleConfigured()) {
    return { ok: false, message: "Storage is not configured" };
  }

  const productId = text(formData, "productId", 64);
  const file = formData.get("file");

  if (!productId) return { ok: false, message: "Missing product" };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a PDF to upload" };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, message: "The setup guide must be a PDF" };
  }
  if (file.size > 15 * 1024 * 1024) {
    return { ok: false, message: "The PDF must be under 15 MB" };
  }

  const safeSlug = productId.replace(/[^a-z0-9-]/gi, "-");
  const path = `${BUCKETS.private}/${safeSlug}/${Date.now()}-setup-guide.pdf`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKETS.private)
    .upload(path, file, { contentType: "application/pdf", upsert: true });

  if (error) {
    console.error("[admin:storage] upload failed:", error.message);
    return { ok: false, message: "The upload failed" };
  }

  return { ok: true, message: path };
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/**
 * Manual payment confirmation.
 *
 * Deliberately explicit: it records WHO confirmed, WHEN and WHY, because a
 * hand-set "paid" is the one operation that can grant product access without
 * money moving. The payment webhook must replace this in production.
 */
export async function confirmOrderPaidAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const orderId = text(formData, "orderId", 64);
  const note = text(formData, "note", 300);

  if (!orderId) return { ok: false, message: "Missing order" };
  if (!note) {
    return {
      ok: false,
      message: "A reason is required for a manual confirmation",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      confirmed_by: session.user.id,
      confirmed_at: new Date().toISOString(),
      confirmation_note: note,
    })
    .eq("id", orderId);

  if (error) return { ok: false, message: "Could not update the order" };

  logAction("order_payment_confirmed", "order", orderId, session.user.id, { note });
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Order marked as paid" };
}

/* ------------------------------------------------------------------ */
/* Delivery: signed URL for a purchased setup guide                    */
/* ------------------------------------------------------------------ */

/**
 * Issues a short-lived signed URL for a purchased PDF.
 *
 * Authorization order matters:
 *   1. signed-in admin?  OR  (token OR order ownership)
 *   2. order exists
 *   3. order.status === "paid"
 *   4. the product is actually on that order
 *   5. only then read delivery_assets (service role) and sign the URL
 *
 * The private storage path is never returned to the client — only the
 * temporary signed URL.
 */
export async function getSetupGuideUrlAction(
  _previous: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSessionForDelivery();
  const orderId = text(formData, "orderId", 64);
  const productId = text(formData, "productId", 64);
  const token = text(formData, "token", 128);

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .maybeSingle<{ id: string; user_id: string | null; status: string }>();

  if (!order) return { ok: false, message: "Order not found" };

  // 1. Authorization
  if (!session.isAdmin) {
    const ownsIt = session.user.id && order.user_id === session.user.id;
    if (!ownsIt && !token) {
      return { ok: false, message: "You do not have access to this order" };
    }
    if (token) {
      const { hashAccessToken } = await import(
        "@/lib/supabase/repositories/purchase-access-repository"
      );
      const { data: grant } = await admin
        .from("purchase_access")
        .select("id")
        .eq("order_id", orderId)
        .eq("token_hash", hashAccessToken(token))
        .eq("revoked", false)
        .maybeSingle<{ id: string }>();
      if (!grant) return { ok: false, message: "Invalid access token" };
    }
  }

  // 2. Paid?
  if (order.status !== "paid") {
    return { ok: false, message: "This order is not paid yet" };
  }

  // 3. Is this product actually on the order?
  const { data: item } = await admin
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle<{ id: string }>();

  if (!item) return { ok: false, message: "That product is not on this order" };

  // 4. Private asset + signed URL
  const { data: asset } = await admin
    .from("delivery_assets")
    .select("setup_pdf_path")
    .eq("product_id", productId)
    .maybeSingle<{ setup_pdf_path: string }>();

  if (!asset) {
    return { ok: false, message: "The setup guide has not been uploaded yet" };
  }

  const { data: signed, error } = await admin.storage
    .from(BUCKETS.private)
    .createSignedUrl(asset.setup_pdf_path, PDF_URL_TTL_SECONDS, {
      download: false,
    });

  if (error || !signed?.signedUrl) {
    console.error("[admin:storage] signed url failed:", error?.message);
    return { ok: false, message: "The setup guide is temporarily unavailable" };
  }

  await admin.from("downloads").insert({
    order_id: orderId,
    user_id: session.user.id || null,
    product_id: productId,
    asset_type: "setup-guide",
  });

  return { ok: true, message: signed.signedUrl };
}

/** Session lookup without redirecting, for API-shaped actions. */
async function getSessionForDelivery() {
  const { getSession } = await import("@/lib/auth/guards");
  return getSession();
}