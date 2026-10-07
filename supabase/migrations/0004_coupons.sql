-- 0004: coupon codes — the discount seam `orders.discount` always anticipated.
--
-- Checkout validates a code SERVER-side through the service-role client, so
-- the anon and authenticated roles get NO policy on this table at all (same
-- model as 0001): a browser can never read, write or brute-force a code.
--
-- The storefront is safe to deploy BEFORE this migration runs: the coupons
-- table is only touched when the buyer actually types a discount code.
--
-- Safe to re-run. Apply once in the Supabase SQL editor.

create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  percent_off     integer not null check (percent_off between 1 and 100),
  active          boolean not null default true,
  -- Internal reminder for the shop, never shown to buyers.
  note            text,
  max_redemptions integer check (max_redemptions > 0),
  redemptions     integer not null default 0,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists coupons_active_idx on public.coupons (active);

-- RLS enabled with ZERO policies: only the service role (server code) can
-- touch this table. This matches the 0001 security model.
alter table public.coupons enable row level security;

create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();
