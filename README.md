# BLANC WEDDINGS

A storefront for **editable Canva wedding website templates** plus a setup guide
PDF. Next.js (App Router) + TypeScript + Tailwind CSS v4.

**BLANC WEDDINGS is the storefront, checkout and delivery layer. Canva is the
editor and the publishing platform.** We are not a website builder, we do not
host wedding websites, and we do not run an RSVP or guest database.

```
Browse template -> View public demo -> Add to cart -> Checkout
  -> Mock payment -> PAID order -> Secure access page
  -> Open Canva template (customer's own copy) + Download setup guide PDF
  -> Customer personalises in Canva -> Publishes from Canva -> Shares the link
```

## Current state

**Supabase is connected and live.** The migration in `supabase/migrations/` is
applied to the project referenced by `.env.local`, so products, orders and
purchase access come from the database, and the staff panel at `/admin` runs on
real data - the operator manual is `ADMIN.md`. Delete the credentials and the app
falls back to the mock repositories described below.

**Everything else is still mocked.** No payment provider (Stripe, Midtrans,
Xendit), messaging (WhatsApp API, Twilio), email (Resend, Postmark, SES) or Canva
API is connected, and payment is simulated - it always succeeds. This build is
**not production-secure**; see "Security notes" below.

## Commands

```bash
npm install
npm run dev        # development server
npm run build      # production build (includes type checking)
npm start          # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run mockups    # regenerate the demo preview SVGs
npm run db:check   # verify .env.local against a real Supabase project
```

## Admin panel

Staff sign in at `/admin` and run the catalogue, the private delivery assets and
orders from there. The operator manual - every screen, field rule, error message,
and how to promote another admin - is `ADMIN.md`.

## Deploy to Vercel

Import the repository in Vercel (framework preset: Next.js, no build overrides)
and set these project environment variables:

| Variable | Where it comes from / value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → `anon` / `publishable` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → `service_role` / `secret` key. Server only - never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL of the deployment, e.g. `https://your-app.vercel.app`. Purchase access links (`/access/<token>`) are built from it - the fallback default is `https://blancweddings.com`, so leaving it unset sends buyers to the wrong domain |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Inbox shown across the site and in delivery messages |

Then work through the list:

1. **Supabase Auth URLs** - Authentication → URL Configuration: set *Site URL*
   to the Vercel domain and add `<site>/login` and `<site>/signup` to *Redirect
   URLs*, otherwise sign-in redirects bounce back to `localhost`.
2. **Mock checkout is disabled in production.** The only payment service wired
   in is `MockPaymentService`, which marks every order paid and issues the paid
   files - so a public deployment refuses checkout with `503 payments_disabled`
   unless `ENABLE_MOCK_CHECKOUT=true` is set. Set that flag only to demo the
   full purchase flow on your own deployment, and remove it before real
   traffic. Local `npm run dev` is unaffected.
3. **First admin account** - sign up at `/signup` (web sign-ups are always
   `role = 'customer'`), then promote it from the Supabase SQL editor:
   `update public.profiles set role = 'admin' where email = 'you@example.com';`
   The full manual is `ADMIN.md`.
4. **Rate limits live in memory** and reset on every cold start (checkout: 30
   requests / 10 minutes per IP). Fine for a demo; put Vercel WAF or an edge
   limiter in front for real traffic.

Run `npm run build` before importing: it must finish with the route table and
no "Build error". The product routes (`/templates/[slug]`, `/demo/[slug]`) are
declared `force-dynamic`: the repository reads request cookies (RLS), so they
render per request and must never be prerendered - if Next classifies them as
static, the first live request fails with `DYNAMIC_SERVER_USAGE` (HTTP 500).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Storefront home |
| `/shop` | Catalogue with type / style / sort filters |
| `/templates/[slug]` | Product detail: demo button, what is included, sections, features, licence |
| `/demo/[slug]` | **Public demo** - the design with demo content, no editing access |
| `/cart`, `/checkout` | Client cart and checkout (WhatsApp + email collected) |
| `/order/success/[orderId]` | Post-payment confirmation (requires the access token) |
| `/access/[secureToken]` | **Purchase access page** - Canva + setup guide delivery |
| `/account`, `/account/purchases` | Purchases by email lookup (no auth yet) |
| `/login`, `/signup` | Customer sign-in and registration (Supabase Auth) |
| `/admin/**` | Staff panel - dashboard, products, delivery assets, orders, customers |
| `/custom` | Custom design service + enquiry form (not a purchase) |
| `/about`, `/how-it-works`, `/faq` | Editorial pages |
| `POST /api/checkout` | Creates the order server-side |
| `GET /api/delivery/[token]/canva` | Token-verified 302 to the Canva template |
| `GET /api/delivery/[token]/setup-guide` | Token-verified 302 to the setup PDF |
| `GET /api/delivery/mock/guides/[slug]` | MOCK PDF generator (demo only) |
| `POST /api/inquiries` | Custom design enquiry (logged, not stored) |

## Architecture

```
src/app/**                 routes - Server Components by default
src/components/**          UI (client components only where interactive)
src/data/products.ts       PUBLIC product catalogue (mock, Supabase-shaped)
src/data/license.ts        usage licence terms
src/lib/repositories/      ProductRepository - OrderRepository - PurchaseAccessRepository
src/lib/mock/              mock implementations (JSON files in .blanc-data/)
src/lib/services/          checkout - payment - purchase access - email - whatsapp - inquiry - cart
src/lib/private/           delivery-assets.ts  <- PRIVATE, server only
```

The UI imports repository and service TYPES plus the singletons from
`src/lib/repositories/index.ts` and each service module. To move to Supabase,
swap the bindings in those files - no component changes.

## What is private (never in public HTML, JSON, metadata or bundles)

- Canva template URLs - `delivery_assets.canva_template_url` (admin-only RLS), or
  `src/lib/private/delivery-assets.ts` in the mock
- Setup guide PDFs - the private `blanc-private` bucket; the path is stored in the
  same two places and only ever handed out as a 120-second signed URL
- Purchase access tokens - `purchase_access.token_hash`; the mock keeps plaintext
  in `.blanc-data/purchase-access.json` (server only)
- Order records - `orders` / `order_items` behind RLS; `.blanc-data/orders.json`
  (server only) without credentials

The access page renders only `/api/delivery/[token]/*` routes, which re-verify
the token on every request and then redirect server-side.

## Mock services

These implementations are what you get **without** Supabase credentials. With a
project URL and keys in `.env.local`, products, orders and purchase access read
and write the database instead - the single switch is `isSupabaseConfigured()` in
`src/lib/repositories/index.ts`.

| Service | Today | Production replacement |
| --- | --- | --- |
| `MockPaymentService` | Always succeeds, no card, no provider | Stripe / Midtrans / Xendit + **verified webhook** |
| `MockEmailDeliveryService` | Builds the message, logs it, sends nothing | Resend / Postmark / SES |
| `MockWhatsAppDeliveryService` | Builds the message, logs it, sends nothing | WhatsApp Cloud API / Twilio |
| `MockPurchaseAccessService` | Token in a local JSON file | Hashed tokens + signed URLs + RLS |
| `MockInquiryService` | Logs the enquiry | `custom_inquiries` table + notification |
| `MockOrderRepository` | JSON file, atomic writes, serialised queue | Supabase `orders` + `order_items` |
| `MockProductRepository` | In-memory catalogue | Supabase `products` |

## Security notes (honest list)

- **The access token is a bearer credential.** Anyone who has it can open the
  files, and a customer could share a Canva link. We do not claim this is
  technically preventable. Mitigations: token must resolve to a PAID order, PDF
  from private storage, licence terms, and Canva's copy mechanism (the customer
  edits their own copy; the master is never shared).
- **The legacy mock store is not production storage.** Without Supabase
  credentials the mock keeps access tokens as plain random hex in a JSON file. In
  Supabase mode `purchase_access` stores only a hash, RLS keeps the table private,
  and the setup guide is served as a short-lived signed URL - but the Canva link
  is still a bearer URL once a verified buyer receives it.
- **Payment is simulated.** Never mark an order paid from the browser; a real
  build confirms payment from a signed webhook.
- **Email / WhatsApp are simulated.** No message is sent.
- **`/account/purchases` has no authentication.** It is still an email lookup -
  anyone who knows an email can list those orders. Supabase Auth is wired up for
  `/login`, `/signup` and `/admin` (the role is re-checked server-side on every
  admin page and every admin write), and `orders.user_id` is set for signed-in
  buyers, so binding this page to the session is the next step.
- `hello@blancweddings.com` and the Canva/PDF URLs are placeholders.
- Rate limits: checkout 30 / 10 min per IP, delivery and enquiry routes are
  limited too. In production put a real limiter at the edge.

## Supabase schema

`supabase/migrations/0001_init.sql` holds the whole schema: nine tables, two
storage buckets (`blanc-public`, `blanc-private`) and row level security. It is
**applied** to the Supabase project in `.env.local` - re-run it in the Supabase
SQL editor (or `supabase db push`) when standing up another project. While
`.env.local` holds no project URL and keys, the app keeps serving the mock
repositories (see `.env.example`). Check the keys and the schema in one go:

```bash
npm run db:check
```


```
products            id, slug (unique), name, short_description, description,
                    type, style, price, compare_at_price, currency, price_from,
                    cover_image, demo_url, included_sections, features,
                    whats_included, palette (the last four are jsonb), featured,
                    published, created_at, updated_at
product_images      id, product_id, image_path, alt_text, sort_order, created_at
profiles            id, full_name, email, whatsapp, role, created_at, updated_at
orders              id, order_number, user_id, customer_name, customer_email,
                    customer_whatsapp, customer_notes, status, subtotal,
                    discount, total, currency, payment_ref, confirmed_by,
                    confirmed_at, confirmation_note, created_at, updated_at
order_items         id, order_id, product_id, product_name, product_slug,
                    price, quantity
delivery_assets     id, product_id, canva_template_url, setup_pdf_path
purchase_access     id, order_id, product_id, token_hash, expires_at, revoked,
                    created_at
downloads           id, order_id, user_id, product_id, asset_type, downloaded_at
admin_audit_logs    id, admin_user_id, action, entity_type, entity_id, metadata,
                    created_at
custom_inquiries    not in the migration yet - the enquiry form emails the
                    studio instead of storing rows
```

Two guards live in the database rather than in the UI: `products.compare_at_price`
must be **greater** than `price`, and `products.demo_url` must match `^https://`.
`orders.user_id` stays null for guest checkout and is filled in when the buyer is
signed in.

Order items snapshot `product_name` and `price` at purchase time, so a later
catalogue change never rewrites history.
