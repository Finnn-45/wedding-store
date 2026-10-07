/**
 * Domain types for the Supabase layer.
 *
 * These mirror the SQL tables. The repository interfaces in
 * `src/lib/repositories/*` stay the contract the UI depends on; these types
 * are the storage-layer shapes.
 */

export type ProfileRole = "customer" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  type: string;
  style: string;
  price: number | string;
  compare_at_price: number | string | null;
  currency: string;
  price_from: boolean;
  cover_image: string | null;
  demo_url: string | null;
  included_sections: unknown;
  features: unknown;
  whats_included: unknown;
  palette: unknown;
  /** Etsy-style option group (0003); absent before that migration. */
  options?: unknown;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  image_path: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

/** PRIVATE row — never returned to the browser. */
export type DeliveryAssetRow = {
  id: string;
  product_id: string;
  canva_template_url: string;
  setup_pdf_path: string;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  customer_notes: string | null;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  subtotal: number | string;
  discount: number | string;
  total: number | string;
  currency: string;
  payment_ref: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  confirmation_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string | null;
  price: number | string;
  quantity: number;
  /** Option snapshot (0003); absent before that migration. */
  option_label?: string | null;
  option_choice?: string | null;
  created_at: string;
};

/** Coupon row (0004) — service-role reads only, RLS has no public policy. */
export type CouponRow = {
  id: string;
  code: string;
  percent_off: number | string;
  active: boolean;
  note: string | null;
  max_redemptions: number | null;
  redemptions: number | string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseAccessRow = {
  id: string;
  order_id: string;
  product_id: string;
  customer_email: string;
  token_hash: string;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
};

export type DownloadRow = {
  id: string;
  order_id: string;
  user_id: string | null;
  product_id: string;
  asset_type: "setup-guide" | "digital-asset" | "canva";
  downloaded_at: string;
};

/** Narrows a jsonb array column to string[]. */
export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : [];
}