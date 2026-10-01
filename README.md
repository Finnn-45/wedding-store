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

## Current state: MOCK, not production

Everything below runs on local mock services. **No external service is
connected** - no Supabase, Stripe, Midtrans, Xendit, WhatsApp API, Twilio,
Resend, SendGrid or Canva API. This build is **not production-secure**; see
"Security notes" and "Before go-live".

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

- Canva template URLs - `src/lib/private/delivery-assets.ts`
- Setup PDF URLs - same file
- Purchase access tokens - `.blanc-data/purchase-access.json` (server only)
- Order records - `.blanc-data/orders.json` (server only)

The access page renders only `/api/delivery/[token]/*` routes, which re-verify
the token on every request and then redirect server-side.

## Mock services

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
- **Mock storage is not production storage.** Tokens are plain random hex in a
  JSON file. Production needs hashed tokens, row level security and signed URLs.
- **Payment is simulated.** Never mark an order paid from the browser; a real
  build confirms payment from a signed webhook.
- **Email / WhatsApp are simulated.** No message is sent.
- **No authentication.** `/account/purchases` is an email lookup - anyone who
  knows an email can list those orders. Replace with Supabase Auth.
- `hello@blancweddings.com` and the Canva/PDF URLs are placeholders.
- Rate limits: checkout 30 / 10 min per IP, delivery and enquiry routes are
  limited too. In production put a real limiter at the edge.

## Supabase schema

`supabase/migrations/0001_init.sql` holds the whole schema: nine tables, two
storage buckets (`blanc-public`, `blanc-private`) and row level security. It is
**written but not applied** - until `.env.local` contains a real project URL and
keys the app keeps serving the mock repositories (see `.env.example`). Check the
keys and the schema in one go:

```bash
npm run db:check
```


```
products            id, slug, name, short_description, description, type, style,
                    price, compare_at_price, currency, cover_image, published,
                    demo_url, created_at
product_images      id, product_id, url, alt, position
profiles            id, full_name, email, whatsapp, role, created_at, updated_at
orders              id, order_number, customer_name, customer_email,
                    customer_whatsapp, customer_notes, status, subtotal,
                    discount, total, currency, payment_ref, created_at, paid_at
order_items         id, order_id, product_id, product_name, product_slug,
                    price, quantity
delivery_assets     id, product_id, canva_template_url, setup_pdf_path
purchase_access     id, order_id, product_id, token_hash, expires_at, revoked
downloads           id, order_id, user_id, product_id, asset_type, downloaded_at
admin_audit_logs    id, admin_user_id, action, entity_type, entity_id, metadata,
                    created_at
custom_inquiries    not in the migration yet - the enquiry form emails the
                    studio instead of storing rows
```

Order items snapshot `product_name` and `price` at purchase time, so a later
catalogue change never rewrites history.
