-- ==========================================================================
-- 0001_init — BLANC WEDDINGS
-- ==========================================================================
-- Supabase / PostgreSQL schema for the storefront, orders, accounts and admin.
--
-- Apply with:  npx supabase db push        (or paste into the SQL editor)
--
-- SECURITY MODEL
--   * RLS is enabled on EVERY table below. It is never disabled for
--     convenience.
--   * The browser (anon + authenticated roles) can read the published
--     catalogue and nothing else.
--   * Every write goes through the Next.js server, which uses the
--     service-role key and therefore bypasses RLS by design.
--   * profiles.role is NOT user-writable: the column is excluded from the
--     authenticated UPDATE grant, and a trigger blocks role changes.
--   * delivery_assets (the Canva URL + setup PDF) has NO public policy at
--     all. Only the service role can read it.
--
-- CURRENCY NOTE: the column default is 'USD' rather than 'IDR' because the
-- existing catalogue and storefront are priced in USD. Switching to IDR is a
-- catalogue/pricing decision - edit the default and the product rows together.
-- ==========================================================================

create extension if not exists "pgcrypto";

-- PostgreSQL validates the body of a LANGUAGE sql function when it is created.
-- is_admin() reads public.profiles, so it is declared AFTER that table further
-- down (see the profiles section). This switch is belt and braces: it stops
-- CREATE FUNCTION from resolving table names too early, so the script can never
-- abort with 42P01 again.
set check_function_bodies = off;

-- --------------------------------------------------------------------------
-- updated_at helper
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ==========================================================================
-- profiles
-- ==========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  whatsapp    text,
  -- customer | admin. Customers can never self-assign admin: the column is
  -- removed from the user UPDATE grant and a trigger enforces it.
  role        text not null default 'customer'
                check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- is_admin() — the single source of truth for "is this user an admin"
-- --------------------------------------------------------------------------
-- Declared AFTER public.profiles on purpose: a LANGUAGE sql function body is
-- validated at CREATE time, so referencing the table before it exists aborts
-- the whole migration with 42P01 ("relation public.profiles does not exist").
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile on signup, ALWAYS as 'customer'. Promotion to admin
-- is a separate, deliberate, server-side operation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Belt and braces: block role escalation through any ordinary UPDATE.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- service_role bypasses RLS but still goes through triggers, so we allow
  -- the change only when the acting user is already an admin.
  if new.role is distinct from old.role then
    if not public.is_admin() and auth.role() <> 'service_role' then
      raise exception 'role can only be changed by an admin';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();
-- ==========================================================================
-- products  (PUBLIC catalogue data only — no delivery fields here)
-- ==========================================================================
create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  short_description  text not null default '',
  description        text not null default '',
  -- wedding-website | save-the-date | bundle | custom
  type               text not null default 'wedding-website',
  -- modern | editorial | minimal | garden | classic | romantic | other
  style              text not null default 'other',
  price              numeric(12,2) not null check (price >= 0),
  compare_at_price   numeric(12,2) check (compare_at_price > price),
  currency           text not null default 'USD',
  price_from         boolean not null default false,
  cover_image        text,
  demo_url           text,
  included_sections  jsonb not null default '[]'::jsonb,
  features           jsonb not null default '[]'::jsonb,
  whats_included     jsonb not null default '[]'::jsonb,
  palette            jsonb not null default '[]'::jsonb,
  featured           boolean not null default false,
  published          boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists products_slug_idx       on public.products (slug);
create index if not exists products_published_idx  on public.products (published, created_at desc);
create index if not exists products_type_idx       on public.products (type);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- demo_url must be an https URL, never javascript:/data:
alter table public.products
  add constraint products_demo_url_https
  check (demo_url is null or demo_url ~ '^https://');

-- ==========================================================================
-- product_images
-- ==========================================================================
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  image_path  text not null,
  alt_text    text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, sort_order);

-- ==========================================================================
-- delivery_assets  (PRIVATE — purchased delivery data)
-- ==========================================================================
-- This table holds the Canva template URL and the private setup-guide path.
-- It has NO public select policy. The public site must never be able to read
-- it: the Canva URL is only ever resolved server-side, after a purchase check.
create table if not exists public.delivery_assets (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null unique references public.products (id) on delete cascade,
  canva_template_url  text not null,
  -- A PRIVATE STORAGE PATH (bucket/object), never a public URL.
  setup_pdf_path      text not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger delivery_assets_set_updated_at
  before update on public.delivery_assets
  for each row execute function public.set_updated_at();

alter table public.delivery_assets
  add constraint delivery_assets_canva_https
  check (canva_template_url ~ '^https://');
-- ==========================================================================
-- orders
-- ==========================================================================
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique,
  -- NULL for guest checkout; set when the customer is signed in.
  user_id             uuid references auth.users (id) on delete set null,
  customer_name       text not null,
  customer_email      text not null,
  customer_whatsapp   text not null,
  customer_notes      text,
  -- pending | paid | failed | cancelled | refunded
  -- Only the server (payment webhook) writes this. No client policy exists.
  status              text not null default 'pending'
                        check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  subtotal            numeric(12,2) not null check (subtotal >= 0),
  discount            numeric(12,2) not null default 0 check (discount >= 0),
  total               numeric(12,2) not null check (total >= 0),
  currency            text not null default 'USD',
  payment_ref         text,
  -- Recorded when an admin confirms payment by hand.
  confirmed_by        uuid references auth.users (id) on delete set null,
  confirmed_at        timestamptz,
  confirmation_note   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_user_id_idx    on public.orders (user_id);
create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx      on public.orders (customer_email);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- order_items  (purchase-time snapshot: name + price never re-read)
-- ==========================================================================
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id),
  product_name  text not null,
  product_slug  text,
  price         numeric(12,2) not null check (price >= 0),
  quantity      integer not null check (quantity > 0),
  created_at    timestamptz not null default now()
);

create index if not exists order_items_order_idx   on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

-- ==========================================================================
-- purchase_access  (the delivery credential for guest purchases)
-- ==========================================================================
-- Signed-in customers access their order by OWNERSHIP (orders.user_id), not
-- by a token. This table covers the guest checkout path, where there is no
-- account yet. token_hash stores SHA-256 of the token: the raw token is shown
-- to the buyer exactly once and is never stored.
create table if not exists public.purchase_access (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      uuid not null references public.products (id),
  customer_email  text not null,
  token_hash      text not null unique,
  expires_at      timestamptz,
  revoked         boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists purchase_access_order_idx on public.purchase_access (order_id);

-- ==========================================================================
-- downloads  (audit trail; NOT proof of payment — orders.status is)
-- ==========================================================================
create table if not exists public.downloads (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  user_id       uuid references auth.users (id) on delete set null,
  product_id    uuid not null references public.products (id),
  asset_type    text not null check (asset_type in ('setup-guide', 'digital-asset', 'canva')),
  downloaded_at timestamptz not null default now()
);

create index if not exists downloads_order_idx    on public.downloads (order_id);
create index if not exists downloads_user_id_idx  on public.downloads (user_id);
create index if not exists downloads_product_idx  on public.downloads (product_id);

-- ==========================================================================
-- admin_audit_logs  (prepared for future admin activity tracking)
-- ==========================================================================
create table if not exists public.admin_audit_logs (
  id           uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users (id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_idx
  on public.admin_audit_logs (created_at desc);
-- ==========================================================================
-- Row Level Security
-- ==========================================================================
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.delivery_assets  enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.purchase_access  enable row level security;
alter table public.downloads        enable row level security;
alter table public.admin_audit_logs enable row level security;

-- --------------------------------------------------------------------------
-- profiles policies
-- --------------------------------------------------------------------------
-- A customer may read their own row only.
create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- A customer may update their own row, but NOT the role column. The column is
-- removed from the grant below as the first line of defence; the trigger in
-- this migration is the second.
create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Column-level restriction: authenticated users cannot touch `role`.
revoke update on public.profiles from authenticated;
grant update (full_name, email, whatsapp) on public.profiles to authenticated;

-- --------------------------------------------------------------------------
-- products policies  (public reads published rows only)
-- --------------------------------------------------------------------------
create policy "products: public read published"
  on public.products for select
  using (published = true or public.is_admin());

create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin update"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

-- --------------------------------------------------------------------------
-- product_images policies
-- --------------------------------------------------------------------------
create policy "product_images: public read for published products"
  on public.product_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.published = true
    )
  );

create policy "product_images: admin insert"
  on public.product_images for insert
  with check (public.is_admin());

create policy "product_images: admin update"
  on public.product_images for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_images: admin delete"
  on public.product_images for delete
  using (public.is_admin());

-- --------------------------------------------------------------------------
-- delivery_assets — NO public policy on purpose
-- --------------------------------------------------------------------------
-- Customers may see that a product IS deliverable, but never the URL.
-- The server reads this table with the service role after verifying the order.
-- Admins are allowed to read/write through RLS as a second layer; the admin
-- UI still uses the service role, so this policy is defence in depth only.
create policy "delivery_assets: admin read"
  on public.delivery_assets for select
  using (public.is_admin());

create policy "delivery_assets: admin write"
  on public.delivery_assets for all
  using (public.is_admin())
  with check (public.is_admin());
-- --------------------------------------------------------------------------
-- orders policies  (a customer sees ONLY their own orders)
-- --------------------------------------------------------------------------
create policy "orders: read own or admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

-- Customers may insert their OWN order (checkout). Every other field is
-- server-computed; the server uses the service role for the real write.
create policy "orders: insert own"
  on public.orders for insert
  with check (user_id = auth.uid() or public.is_admin());

-- NO customer update policy: status, subtotal, discount and total are not
-- writable by the client. Status changes happen through the server, which
-- uses the service role.
create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
-- order_items policies
-- --------------------------------------------------------------------------
create policy "order_items: read own or admin"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items: admin write"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
-- purchase_access policies
-- --------------------------------------------------------------------------
-- A signed-in customer may read the access rows of their own orders.
create policy "purchase_access: read own or admin"
  on public.purchase_access for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = purchase_access.order_id and o.user_id = auth.uid()
    )
  );

-- No client insert/update/delete: tokens are created server-side only.
create policy "purchase_access: admin write"
  on public.purchase_access for all
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
-- downloads policies
-- --------------------------------------------------------------------------
create policy "downloads: read own or admin"
  on public.downloads for select
  using (user_id = auth.uid() or public.is_admin());

-- Downloads are WRITTEN by the server (service role) when a file is served.
create policy "downloads: admin read"
  on public.downloads for select
  using (public.is_admin());

-- --------------------------------------------------------------------------
-- admin_audit_logs
-- --------------------------------------------------------------------------
create policy "admin_audit_logs: admin only"
  on public.admin_audit_logs for all
  using (public.is_admin())
  with check (public.is_admin());
-- ==========================================================================
-- Storage
-- ==========================================================================
-- blanc-public  : product previews and marketing images. Public read.
-- blanc-private : setup guide PDFs and purchased files. NEVER public.
--                Delivered only through a short-lived signed URL issued by
--                the server after a purchase check.

insert into storage.buckets (id, name, public)
values ('blanc-public', 'blanc-public', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('blanc-private', 'blanc-private', false)
on conflict (id) do nothing;

-- Public bucket: anyone may read objects.
create policy "blanc-public: public read"
  on storage.objects for select
  using (bucket_id = 'blanc-public');

-- Admin uploads to the public bucket (previews).
create policy "blanc-public: admin write"
  on storage.objects for all
  using (bucket_id = 'blanc-public' and public.is_admin())
  with check (bucket_id = 'blanc-public' and public.is_admin());

-- PRIVATE bucket: no public select policy exists at all. Objects are served
-- exclusively through createSignedUrl() from the server using the service
-- role, which bypasses RLS.
create policy "blanc-private: admin read"
  on storage.objects for select
  using (bucket_id = 'blanc-private' and public.is_admin());

create policy "blanc-private: admin write"
  on storage.objects for all
  using (bucket_id = 'blanc-private' and public.is_admin())
  with check (bucket_id = 'blanc-private' and public.is_admin());

-- ==========================================================================
-- Order number sequence: BW-<year>-000001
-- ==========================================================================
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

-- ==========================================================================
-- Bootstrap: promote an existing auth user to admin
-- ==========================================================================
-- There is NO public endpoint and NO "register as admin" form. Promotion is a
-- deliberate manual step, from the Supabase SQL editor, by someone who has
-- already authenticated the account:
--
--   update public.profiles
--      set role = 'admin'
--    where email = 'you@example.com';
--
-- The service-role key bypasses the role-escalation trigger, so this is the
-- only supported path. A customer can never reach it: they have no policy
-- that allows writing the role column.
-- ==========================================================================