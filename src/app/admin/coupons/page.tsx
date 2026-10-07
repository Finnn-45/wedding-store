import type { Metadata } from "next";
import {
  deleteCouponAction,
  setCouponActiveAction,
} from "@/app/admin/actions";
import { CouponForm } from "@/components/admin/CouponForm";
import { requireAdmin } from "@/lib/auth/guards";
import { couponRepository, usingSupabase } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Coupons",
  robots: { index: false, follow: false },
};

/**
 * Discount codes — create, pause, delete.
 *
 * Codes are validated server-side at checkout against the coupons table
 * (RLS enabled, no public policy), so this page is presentation only:
 * requireAdmin() runs here, and again inside every action.
 */
export default async function AdminCouponsPage() {
  await requireAdmin();

  const coupons = usingSupabase
    ? await couponRepository.list().catch(() => [])
    : [];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-heading-sm font-light uppercase tracking-[0.02em]">
          Discount codes
        </h1>
        <p className="max-w-2xl text-body text-stone">
          Codes are checked by the server during checkout and applied to the
          order total before payment instructions are shown. Buyers never see
          this list.
        </p>
      </div>

      {!usingSupabase ? (
        <p className="border border-line bg-shell px-4 py-3 text-body-sm text-stone">
          Coupons need the Supabase database — this build is running on local
          mock data.
        </p>
      ) : null}

      <CouponForm />

      {coupons.length === 0 ? (
        <p className="text-body text-stone">
          {usingSupabase ? "No codes yet — create the first one above." : ""}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {coupons.map((coupon) => (
            <li
              key={coupon.id}
              className="flex flex-wrap items-baseline justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="font-serif text-title-sm uppercase">
                  {coupon.code}
                </p>
                <p className="mt-1 text-body-sm text-stone">
                  {coupon.percentOff}% off
                  {" · "}
                  {coupon.maxRedemptions !== null
                    ? `${coupon.redemptions}/${coupon.maxRedemptions} uses`
                    : `${coupon.redemptions} uses`}
                  {coupon.expiresAt
                    ? ` · expires ${coupon.expiresAt.slice(0, 10)}`
                    : ""}
                  {coupon.note ? ` · ${coupon.note}` : ""}
                  {" · "}
                  <span className={coupon.active ? "text-ink" : ""}>
                    {coupon.active ? "active" : "inactive"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <form action={setCouponActiveAction}>
                  <input type="hidden" name="id" value={coupon.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={String(!coupon.active)}
                  />
                  <button
                    type="submit"
                    className="text-body-sm text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    {coupon.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form action={deleteCouponAction}>
                  <input type="hidden" name="id" value={coupon.id} />
                  <button
                    type="submit"
                    className="text-body-sm text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}