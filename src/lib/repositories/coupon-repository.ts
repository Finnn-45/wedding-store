/**
 * Coupon codes — the discount half of the checkout.
 *
 * SECURITY: this is server-only data. The browser never reads a coupon row;
 * it only SUBMITS a code string and the checkout service validates it here,
 * against its own repository. On Supabase the table has RLS enabled with no
 * public policy, so only the service-role client (this repository) can touch
 * it.
 */
export type Coupon = {
  id: string;
  /** Stored lowercase; lookups are case-insensitive anyway. */
  code: string;
  percentOff: number;
  active: boolean;
  /** Internal reminder for the shop — never shown to buyers. */
  note?: string | null;
  /** null = unlimited redemptions. */
  maxRedemptions: number | null;
  redemptions: number;
  /** ISO timestamp; null = never expires. */
  expiresAt: string | null;
  createdAt?: string;
};

export type NewCoupon = {
  code: string;
  percentOff: number;
  note?: string | null;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
};

/** Server-only — checkout and admin actions, never the browser. */
export interface CouponRepository {
  /** Active, unexpired, under its redemption cap — else null. */
  findValid(code: string): Promise<Coupon | null>;
  /** Best effort: one redemption counted after a successful order. */
  redeem(id: string): Promise<void>;
  /** Admin listing, newest first. */
  list(): Promise<Coupon[]>;
  /** Returns null when the code already exists (or the table is missing). */
  create(input: NewCoupon): Promise<Coupon | null>;
  setActive(id: string, active: boolean): Promise<boolean>;
  remove(id: string): Promise<boolean>;
}