-- 0002: orders.paid_at — when payment was actually verified.
--
-- 0001 recorded only the ADMIN side of a hand confirmation
-- (confirmed_by / confirmed_at / confirmation_note), but the code reads and
-- writes `paid_at` in two places:
--   * confirmOrderPaidAction sets it when the money is verified by hand,
--   * OrderRepository.toOrder maps it back to Order.paidAt.
-- Without this column every "Confirm payment received" click fails with
-- PGRST204: Could not find the 'paid_at' column of 'orders'.
--
-- Safe to re-run. Apply once in the Supabase SQL editor (alongside 0001 on a
-- fresh project).

alter table public.orders
  add column if not exists paid_at timestamptz;

comment on column public.orders.paid_at is
  'When payment was verified: webhook in production, admin confirm in the manual flow.';
