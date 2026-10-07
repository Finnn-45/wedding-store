-- 0003: product options (Etsy-style variations) + order-item snapshots.
--
-- A product may define ONE option group (label "Colour" with choices
-- "Ivory" / "Burgundy (+5)"). The buyer picks a choice on the product page;
-- the choice travels with the cart line, the SERVER re-resolves its price
-- delta at checkout, and the choice is snapshotted onto order_items so a
-- later catalogue edit never rewrites a historical order.
--
-- The storefront is safe to deploy BEFORE this migration runs:
--   * products.options is read via select(*) and parsed defensively — a
--     missing column simply renders as "no options",
--   * order_items option columns are only written when a choice was made,
--     which can only happen once this migration has added the column.
--
-- Safe to re-run. Apply once in the Supabase SQL editor (alongside 0001 and
-- 0002 on a fresh project).

alter table public.products
  add column if not exists options jsonb;

comment on column public.products.options is
  'Etsy-style option group {"label": "Colour", "choices": [{"name": "Ivory", "priceDelta": 0}]}. null = the product sells without a choice.';

alter table public.order_items
  add column if not exists option_label text,
  add column if not exists option_choice text;

comment on column public.order_items.option_label is
  'Snapshot of the chosen option label at purchase time (e.g. Colour).';
comment on column public.order_items.option_choice is
  'Snapshot of the chosen option value at purchase time (e.g. Burgundy).';
