-- ==========================================================================
-- BLANC WEDDINGS - Supabase schema
-- ==========================================================================
-- NOT applied yet. This file is the contract the mock repositories are built
-- to satisfy, so switching to Supabase is a binding change, not a rewrite.
--
-- Apply with:  supabase db push   (or paste into the SQL editor)
--
-- Design notes:
--   * money and product names are snapshotted onto order_items at purchase
--     time, so a later catalogue change never rewrites history
--   * purchase_access stores HASHED tokens, never the raw token
--   * RLS is enabled on every table; the anon role gets no direct access
--   * delivery_assets is readable only through a service-role server call
-- ==========================================================================

-- --------------------------------------------------------------------------
-- products
-- --------------------------------------------------------------------------
create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  short_description  text not null default '',
  description        text not null default '',
  type               text not null check (type in
                       ('wedding-website', 'save-the-date', 'bundle', 'custom')),
  style              text not null,
  price              integer not null check (price >= 0),
  compare_at_price   integer check (compare_at_price > price),
  currency           text not null default 'USD',
  price_from         boolean not null default false,
  cover_image        text not null,
  preview_images     text[] not null default '{}',
  demo_url           text,
  included_sections  text[] not null default '{}',
  features           text[] not null default '{}',
  whats_included     text[] not null default '{}',
  palette            jsonb not null default '[]'::jsonb,
  featured           boolean not null default false,
  published          boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists products_published_idx
  on public.products (published, created_at desc);
create index if not exists products_type_idx on public.products (type);

-- --------------------------------------------------------------------------
-- product_images (optional split once the catalogue grows)
-- --------------------------------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  position    integer not null default 0
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

-- --------------------------------------------------------------------------
-- orders
-- --------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  customer_name      text not null,
  customer_email     text not null,
  customer_whatsapp  text not null,
  customer_notes     text,
  status             text not null default 'pending' check (status in
                       ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  subtotal           integer not null check (subtotal >= 0),
  discount           integer not null default 0 check (discount >= 0),
  total              integer not null check (total >= 0),
  currency           text not null default 'USD',
  -- Set by the payment WEBHOOK only. Never by the browser.
  payment_ref        text,
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (customer_email);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- --------------------------------------------------------------------------
-- order_items (snapshot of what was actually bought)
-- --------------------------------------------------------------------------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id),
  product_name  text not null,
  product_slug  text,
  price         integer not null check (price >= 0),
  quantity      integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);
create index if not exists order_items_product_idx
  on public.order_items (product_id);


-- --------------------------------------------------------------------------
-- purchase_access  (the credential that unlocks delivery)
-- --------------------------------------------------------------------------
create table if not exists public.purchase_access (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     uuid not null references public.products (id),
  customer_email text not null,
  -- SHA-256 of a 32-byte random token. The raw token is NEVER stored and is
  -- shown to the buyer exactly once (success page / email / WhatsApp).
  token_hash     text not null unique,
  expires_at     timestamptz,
  revoked        boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists purchase_access_order_idx
  on public.purchase_access (order_id);

-- --------------------------------------------------------------------------
-- delivery_assets  (PRIVATE: the Canva URL and the setup PDF)
-- --------------------------------------------------------------------------
create table if not exists public.delivery_assets (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null unique references public.products (id) on delete cascade,
  -- Prefer a "view + make a copy" URL: the customer edits their OWN copy and
  -- the master workspace is never shared with them.
  canva_template_url text not null,
  -- A PRIVATE STORAGE PATH, not a public URL. The server turns it into a
  -- short-lived signed URL after verifying purchase access.
  setup_pdf_path     text not null,
  updated_at         timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- downloads (audit trail: who fetched which asset, when)
-- --------------------------------------------------------------------------
create table if not exists public.downloads (
  id          uuid primary key default gen_random_uuid(),
  access_id   uuid not null references public.purchase_access (id) on delete cascade,
  asset       text not null check (asset in ('canva', 'setup_pdf')),
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- custom_inquiries  (a service enquiry, never an order)
-- --------------------------------------------------------------------------
create table if not exists public.custom_inquiries (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  email            text not null,
  whatsapp         text,
  wedding_date     text,
  preferred_style  text,
  budget           text,
  timeline         text,
  notes            text,

-- --------------------------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------------------------
-- Every table is locked down: the browser (anon role) can read the published
-- catalogue and nothing else. All writes go through the server with the
-- service-role key, which bypasses RLS by design.
alter table public.products           enable row level security;
alter table public.product_images     enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.purchase_access    enable row level security;
alter table public.delivery_assets    enable row level security;
alter table public.downloads          enable row level security;
alter table public.custom_inquiries   enable row level security;

-- Published products are public. Delivery assets are NOT in this table.
create policy "published products are public"
  on public.products for select
  using (published = true);

create policy "product images of published products are public"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.published = true
    )
  );

-- No anon policy on orders / order_items / purchase_access / delivery_assets
-- / downloads / custom_inquiries: the client has no direct access at all.

-- --------------------------------------------------------------------------
-- Helper: order number sequence (BW-<year>-000001)
-- --------------------------------------------------------------------------
create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_seq  integer;
  candidate text;
begin
  select coalesce(max(substring(order_number from '[0-9]+$')::int), 0) + 1
    into next_seq
    from public.orders;

  candidate := 'BW-' || extract(year from now())::int
               || '-' || lpad(next_seq::text, 6, '0');

  return candidate;
end;
$$;

-- --------------------------------------------------------------------------
-- Private storage for the setup guide PDFs
-- --------------------------------------------------------------------------
-- Run once. The bucket is NOT public: the server signs a short-lived URL per
-- verified download, so the file is never guessable or cacheable.
--
--   insert into storage.buckets (id, name, public)
--   values ('setup-guides', 'setup-guides', false);

  status           text not null default 'new'
                     check (status in ('new', 'replied', 'closed')),
  created_at       timestamptz not null default now()
);

create index if not exists custom_inquiries_status_idx
  on public.custom_inquiries (status, created_at desc);
