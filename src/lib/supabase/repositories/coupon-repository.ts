import type {
  Coupon,
  CouponRepository,
} from "@/lib/repositories/coupon-repository";
import type { CouponRow } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * SupabaseCouponRepository — same contract as the mock.
 *
 * WRITES and lookups use the SERVICE-ROLE client: coupons have RLS enabled
 * with no public policy (0004), so the browser can never read or write a
 * code. Callers are trusted server code only (checkout service, admin
 * actions).
 */

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
};

function toCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    percentOff: num(row.percent_off),
    active: row.active,
    note: row.note,
    maxRedemptions:
      row.max_redemptions === null || row.max_redemptions === undefined
        ? null
        : num(row.max_redemptions),
    redemptions: num(row.redemptions),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function isUsable(coupon: Coupon): boolean {
  if (!coupon.active) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return false;
  }
  if (
    coupon.maxRedemptions !== null &&
    coupon.redemptions >= coupon.maxRedemptions
  ) {
    return false;
  }
  return true;
}

export const supabaseCouponRepository: CouponRepository = {
  async findValid(code) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toLowerCase())
        .maybeSingle<CouponRow>();
      if (error) {
        // Missing table before migration 0004 — reported here so the buyer
        // just sees an invalid code and the log names the fix.
        console.error("[supabase:coupons] lookup failed:", error.message);
        return null;
      }
      if (!data) return null;
      const coupon = toCoupon(data);
      return isUsable(coupon) ? coupon : null;
    } catch (error) {
      console.error("[supabase:coupons] lookup threw:", error);
      return null;
    }
  },

  async redeem(id) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("coupons")
        .select("redemptions")
        .eq("id", id)
        .maybeSingle<{ redemptions: number | string }>();
      if (!data) return;
      await admin
        .from("coupons")
        .update({ redemptions: num(data.redemptions) + 1 })
        .eq("id", id);
    } catch (error) {
      // Counting redemptions must never fail an order that already succeeded.
      console.error("[supabase:coupons] redeem failed:", error);
    }
  },

  async list() {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("[supabase:coupons] list failed:", error.message);
        return [];
      }
      return ((data ?? []) as CouponRow[]).map(toCoupon);
    } catch (error) {
      console.error("[supabase:coupons] list threw:", error);
      return [];
    }
  },

  async create(input) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("coupons")
        .insert({
          code: input.code.trim().toLowerCase(),
          percent_off: input.percentOff,
          note: input.note ?? null,
          max_redemptions: input.maxRedemptions ?? null,
          expires_at: input.expiresAt ?? null,
        })
        .select("*")
        .single<CouponRow>();
      if (error || !data) {
        console.error("[supabase:coupons] create failed:", error?.message);
        return null;
      }
      return toCoupon(data);
    } catch (error) {
      console.error("[supabase:coupons] create threw:", error);
      return null;
    }
  },

  async setActive(id, active) {
    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("coupons")
        .update({ active })
        .eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },

  async remove(id) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("coupons").delete().eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },
};