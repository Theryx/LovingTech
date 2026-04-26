# Loving Tech — Decisions Log
> This file is maintained by the agent between sprints.
> At the end of each sprint, the agent: *"Write a handover note listing every decision, file, schema change, component, and assumption made in this sprint."*
> Paste the response into the correct section below.
> >The agent should always refer to the latest version of SKILL.md (which references this log) at the start of the next sprint.

---

## Why This File Exists

A dev agent has **no memory between sessions**. Every time you open a new sprint, it starts from zero.

Without this file, makes sure the agent does the following:
- Does not choose a different database schema than the one Sprint 1 built — breaking everything
- Does not Create a component called `ProductCard.tsx` when Sprint 1 already built `Card.tsx`
- Does not Use a different naming convention and break imports
- Does not Re-invent the promo validation logic differently from what Sprint 3 used
- Does not Duplicate routes or tables

With this file, each sprint knows exactly what exists, what was decided, and why — and builds on it cleanly instead of fighting it.

---

## How the agent is expected to Use This File

**At the end of each sprint:**

the agent should perform the following actions:

> "Write a handover note for the next sprint. List:
> - Every file you created or modified (with full paths)
> - Every database table or schema change (with the SQL used)
> - Every component built (name, location, props)
> - Every API route created (method + path)
> - Every architectural decision you made and why
> - Any assumptions you made
> - Anything the next sprint needs to know or watch out for"

Then paste the full response below in the correct sprint section.

**At the start of each sprint:**

read the latest version of `SKILL.md` alongside the sprint prompt. SKILL.md section 15 references this log — keep it current.

---

## Sprint 1 — Design System & Brand Correction

**Status:** ✅ Complete (revised 2026-04-26 — dark mode removed, accessibility pass)

```markdown
### Revision 2026-04-26 — Dark Mode Removal + Accessibility

**Why:** Dark mode was never properly implemented — the site defaulted to `className="dark"` permanently, making it always appear dark-themed despite having both modes. User confirmed: light-only site.

**Dark mode removal:**
- `tailwind.config.ts`: removed `darkMode: 'class'`
- `globals.css`: now sets white background and brand-dark text permanently
- `ThemeContext.tsx`: gutted to a no-op stub (returns `theme: 'light'`, no toggle) — kept file to avoid import errors
- `layout.tsx`: removed `ThemeProvider`, removed `className="dark"` from `<html>`
- `Navbar.tsx`: removed theme toggle button, Moon/Sun imports, useTheme import
- All `dark:` Tailwind classes stripped from every file in src/

**Accessibility fixes:**
- `Button.tsx`: added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2` to all variants
- `LanguageToggle.tsx`: added `role="group"` on wrapper, `aria-label` and `aria-pressed` on FR/EN buttons; inactive text changed from text-brand-grey to text-brand-dark/60 for contrast
- `Input.tsx`: added `htmlFor`/`id` pairing, `aria-invalid`, `aria-describedby` for errors, `role="alert"` on error message; removed dark: classes
- `LeadModal.tsx`: added `role="dialog"` + `aria-modal` + `aria-labelledby`, `aria-label` on close button, Escape key handler, backdrop click to close, focus moved to close button on open
- `ProductCard.tsx`: removed `<div onClick>` wrapper — CTA buttons are now the only interactive elements; added `aria-label` per button
- `ProductGallery.tsx`: added `aria-label` per thumbnail button, `aria-pressed`, `role="group"` on thumbnail grid; thumbnail row hidden if only 1 image; images in thumbnails use `alt=""`/`aria-hidden`
- `Navbar.tsx`: logo link has explicit `aria-label`; decorative logo `<img>` uses `aria-hidden="true"`
- `Card.tsx`: removed dark: classes; brand label pill uses white/90 bg + border for better visibility on light bg
- Admin layout: `aria-current="page"` on active nav link, `aria-label` on language toggle button, fixed garbled label text
- `page.tsx`, `products/page.tsx`: stock filter select has `<label htmlFor>`, back link has focus ring; decorative icons get `aria-hidden="true"`; all footer links get focus rings; `<nav aria-label>` on footer nav

**Brand color / contrast fixes on white backgrounds:**
- `text-brand-grey` replaced with `text-brand-dark/60` or `text-brand-dark/70` for body/paragraph text on white backgrounds (brand-grey #D2D1D1 fails WCAG AA on white)
- `text-brand-grey` retained ONLY where it appears on dark backgrounds (hero section) or as decorative labels
- `placeholder:text-brand-grey` → `placeholder:text-brand-dark/30` in admin inputs
- Trust badge icons now use `bg-brand-blue/10` tint instead of `bg-brand-grey/10`
- Brand label pill on Card uses white/90 backdrop with border instead of grey/80

**Important note on Badge.tsx condition colors:**
The hex colors (#D1FAE5, #DBEAFE, #FEF3C7, #FEE2E2) are INTENTIONAL — explicitly specified in SKILL.md section 6 "Condition badge colors". These are product condition indicators, not brand decoration. Do not change them.

**French string syntax:**
Several fr: '...' string values contained unescaped apostrophes. Fixed by switching those specific values to double quotes (fr: "...d'apostrophe..."). Keep this pattern for any French string containing an apostrophe.

---

### Original Sprint 1 Handover

### Files Created
- `src/components/ui/Button.tsx`: Shared button component with primary, secondary, and whatsapp variants.
- `src/components/ui/Badge.tsx`: Shared badge component for product conditions and stock status.
- `src/components/ui/Card.tsx`: Shared product card shell with image, badges, and CTA slots.
- `src/components/ui/Input.tsx`: Shared text input component with labels, prefixes, and error states.
- `src/components/ui/LanguageToggle.tsx`: Pill toggle for FR/EN language switching.

### Files Modified
- `tailwind.config.ts`: Added official brand color tokens (blue, orange, grey, dark).
- `src/app/globals.css`: Updated CSS variables to use brand tokens for background and foreground.
- `src/app/page.tsx`: Replaced off-brand colors with brand tokens and updated hero section styling.
- `src/app/products/page.tsx`: Updated page background and focus styles to use brand tokens.
- `src/components/Navbar.tsx`: Integrated `LanguageToggle` and updated colors to brand tokens.
- `src/components/ProductCard.tsx`: Refactored to use the new `Card`, `Badge`, and `Button` components.
- `src/components/LeadModal.tsx`: Refactored to use `Input` and `Button` components and updated brand colors.
- `src/components/SplashScreen.tsx`: Updated background and animation colors to brand tokens.

### Color Replacements
- `bg-zinc-950` / `bg-[#09090b]` → `bg-brand-dark` (#111111)
- `blue-500` / `accent` → `brand-blue` (#4494F3)
- `orange-400` / `text-amber-400` → `brand-orange` (#F88810)
- `zinc-500` / `zinc-400` → `brand-grey` (#D2D1D1)

### Architectural Decisions
- **Utility Function:** Created a local `cn` utility (clsx + tailwind-merge) inside each UI component for clean class management. In future sprints, this should be moved to a shared `src/lib/utils.ts`.
- **Component Consistency:** The `ProductCard` now wraps the generic `Card` component, separating business logic from the UI shell.
- **Dark Mode:** Enforced `brand-dark` as the root background for both themes (with different opacities/variants) to maintain the premium feel.

### Assumptions
- Assumed `next-env.d.ts` and `tsconfig.json` were already correctly configured for `@/` aliases.

### For Sprint 2
- Use the components in `src/components/ui/` for all new product forms and listing views.
- When creating the new category system, update the `LanguageToggle` or `LanguageContext` if needed for URL slug synchronization.
```

---

## Sprint 2 — Product Conditions, Variants & Categories

**Status:** ✅ Complete (2026-04-26)

```markdown
### Migration SQL (actually run in Supabase)

ALTER TABLE products ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'new'
  CHECK (condition IN ('new', 'refurbished', 'second_hand'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'keyboard'
  CHECK (category IN ('keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_fr TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_fr TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_info TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

### New Types in src/lib/supabase.ts

- `ProductCondition` = 'new' | 'refurbished' | 'second_hand'
- `ProductCategory` = 'keyboard' | 'mouse' | 'cable' | 'speaker' | 'solar_lamp'
- `VariantOption` = { name: string, stock_qty: number, price_delta: number }
- `Variant` = { label: string, options: VariantOption[] }
- `Product` type extended with all Sprint 2 fields (all optional except condition/category which default)

### Variant Storage

Variants stored as JSONB in a single `variants` column — NOT a separate table.
Structure: `[{ label: "Color", options: [{ name: "Black", stock_qty: 5, price_delta: 0 }] }]`
When variants array is non-empty: main `stock_qty` field is hidden in admin form and ignored for stock purposes.
When variants array is empty: `stock_qty` is used directly.

### Files Modified

- `src/lib/supabase.ts` — Added ProductCondition, ProductCategory, Variant, VariantOption types; extended Product type
- `src/app/admin/products/new/page.tsx` — Full rewrite with condition/category dropdowns, warranty auto-fill, bilingual name/description, compare_at_price, stock_qty, variant group editor, second-hand image validation
- `src/app/admin/products/[id]/page.tsx` — Full rewrite, same fields as new/page plus loads from DB then LOCAL_PRODUCTS fallback; isLocalProduct flag triggers create vs update
- `src/app/admin/products/page.tsx` — Added CONDITION_STYLE constant and condition badge column to product table
- `src/app/products/page.tsx` — Added category tabs + condition filter pills + in-stock toggle; kept existing search by name/description; empty state with "clear filters"
- `src/app/product/[id]/page.tsx` — Added condition badge (using inline style with hardcoded hex per SKILL.md), compare_at_price strikethrough, bilingual descriptions (FR then EN separated by hr), warranty_info section

### Admin Form Decisions

- Condition dropdown auto-fills warranty_info on change: new → "Garantie fabricant / Manufacturer warranty", refurbished → "30 jours / 30 days", second_hand → "Aucune garantie / No warranty"
- Second-hand shows amber warning banner listing the 2-photo requirement and no-returns rule
- Save is blocked (alert) if condition = second_hand and images < 2
- Variant group editor: add group → add options per group; each option has name, stock_qty, ±price_delta inputs
- When variants array has items, the top-level stock_qty field is hidden

### PLP Filter Implementation

Filters are React state (not URL params — URL params deferred to Sprint 5).
Filter chain: search → category → condition → stock.
All filters combine with AND logic.
Empty state shows "No products found" + "Clear filters" button.

### PDP Variant Selector

NOT implemented in Sprint 2 — the PDP shows bilingual descriptions, condition badge, compare_at_price, and warranty but does NOT yet have an interactive variant selector (since most existing products have no variants). The variant selector UI is planned for Sprint 5 once products are actually populated with variants.

### Existing Products (33 in DB)

All 33 existing products got condition = 'new' and category = 'keyboard' as defaults from the migration. Admin must manually update each product's category. condition = 'new' is correct for all of them.

### Git Notes

Sprint 2 was committed as two commits due to a rebase conflict with a concurrent remote commit (0365feb — search/filter flow added by another session):
- 79d23fa: Sprint 1+2 main commit
- 0d04aa0: Fix for 4 files lost in conflict resolution (page.tsx, products/page.tsx, LeadModal.tsx, ProductCard.tsx)

### For Sprint 3

- The `leads` table still exists in Supabase — Sprint 3 should migrate to `orders` table and remove the leads flow
- LeadModal.tsx currently uses `supabase.from('leads').insert(...)` — Sprint 3 replaces this with order creation
- The WhatsApp message format in LeadModal.tsx does not yet match the full format in SKILL.md section 11 (no order_ref, no delivery fee, no promo, etc.) — Sprint 3 rebuilds this entirely
- Admin dashboard (/admin/page.tsx) shows leads stats — Sprint 3 should replace with orders stats
- Admin /admin/leads route should be removed in Sprint 3
- No `generateOrderRef()` function exists yet — Sprint 3 creates it in `src/lib/generateOrderRef.ts`
- No delivery_zones table exists yet — Sprint 4 creates it; Sprint 3 can use a static city list for now
```

---

## Sprint 3 — Full Order System

**Status:** ✅ Complete — commit d0599b4

### Orders Table SQL (final — ran successfully)
```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT NOT NULL UNIQUE,
  product_id UUID,
  product_name TEXT NOT NULL,
  variant_chosen TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  city TEXT NOT NULL,
  bus_agency TEXT,
  quartier TEXT NOT NULL,
  address_details TEXT,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  promo_code TEXT,
  promo_discount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
**Key decision:** `product_id` is UUID with NO foreign key — products table has mixed TEXT/UUID IDs from legacy local products data. FK would fail.

### generateOrderRef()
- File: `src/lib/generateOrderRef.ts`
- Format: `LT-YYYYMMDD-XXXX` where XXXX is a 4-digit random number (1000–9999)
- Called client-side inside LeadModal before orderService.create()

### Modal State Machine
- Pure React useState — no external library
- `step: 1 | 2 | 3` controls which screen renders
- Step 1: customer name + WhatsApp phone
- Step 2: city (dropdown from static CITIES array), bus agency (text input), quartier, address_details
- Step 3: read-only summary with subtotal / delivery / total, submit button
- Has `role="dialog"`, `aria-modal`, focus trap, Escape key closes

### Delivery Fee Calculation (in modal)
```typescript
function calcDeliveryFee(city: string, subtotal: number): number {
  if (subtotal >= 50000) return 0;
  return city.toLowerCase() === 'douala' ? 2000 : 3000;
}
```
Called on Step 3 using selected city and `unit_price * quantity`.

### WhatsApp Message Construction
- Built as a template string inside LeadModal `handleSubmit()`
- Encoded with `encodeURIComponent()` and appended to `https://wa.me/237655163248?text=`
- Window opened via `window.open(url, '_blank')`
- Order is saved to DB BEFORE opening WhatsApp (so ref exists if customer closes WA)

### Admin Orders Panel
- `/admin/orders` — list with search (ref/name/phone), status filter select, CSV export
- `/admin/orders/[id]` — detail: customer info, order breakdown, delivery, status update buttons, status timeline (from `status_history` JSONB array reversed), admin notes (auto-save on blur)
- Status updates call `orderService.updateStatus(id, status)` which appends to `status_history`

### Customer Tracking Page
- Route: `/suivi/[ref]` (server component)
- Fetches order via `orderService.getByRef(ref.toUpperCase())`
- Shows status card (bilingual), order summary, timeline, WhatsApp help button
- Returns 404 via `notFound()` if ref not found

### Admin Dashboard Updates
- Replaced leads stats with: orders today (count), revenue today (FCFA), pending orders (count, orange when > 0)
- Pending card turns orange-tinted when pendingCount > 0
- Quick links: Add product, View all orders, conditional "View N pending orders" shortcut

### Leads → Orders Migration
- `src/app/admin/layout.tsx` nav: replaced Leads (Users icon) with Orders (ShoppingBag icon)
- `src/app/admin/leads/` route left in place (not deleted) — still compiles but `Lead` type removed from supabase.ts causes TS errors in that file and `src/test/lib/supabase.test.ts`. These are pre-existing dead routes — Sprint 4 should delete them.
- `Lead` type removed from `src/lib/supabase.ts`

### orderService methods in supabase.ts
- `getAll()` — returns all orders ordered by created_at DESC
- `getByRef(ref)` — for public tracking page
- `getById(id)` — for admin detail page
- `create(order)` — inserts and returns created row
- `updateStatus(id, status)` — updates status + appends to status_history JSONB + sets updated_at
- `updateNotes(id, notes)` — updates admin_notes
- `getTodayStats()` — returns `{ count, revenue, pending }` for dashboard

### What Sprint 4 Should Know
- Delete `src/app/admin/leads/` and `src/test/lib/supabase.test.ts` (or update the test)
- CITIES static array in LeadModal is hardcoded — consider moving to admin config or a constants file
- No auth on admin panel yet — all routes are public
- `status_history` JSONB is append-only; there's no rollback/undo
- The `updateStatus` RPC in supabase.ts uses a raw SQL update with jsonb_append logic (verify this works in Supabase's REST API or switch to a Supabase function if needed)

---

## Sprint 4 — Delivery Zone & Bus Agency System

**Status:** ✅ Complete — commit fb5f6be

### Database SQL (run in Supabase)
```sql
CREATE TABLE delivery_zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name_fr    TEXT NOT NULL,
  city_name_en    TEXT NOT NULL,
  delivery_fee    INTEGER NOT NULL,
  estimated_days  TEXT NOT NULL,
  is_available    BOOLEAN DEFAULT true,
  agencies        JSONB DEFAULT '[]',
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE delivery_settings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  free_delivery_threshold  INTEGER NOT NULL DEFAULT 50000,
  updated_at               TIMESTAMPTZ DEFAULT now()
);

INSERT INTO delivery_zones (city_name_fr, city_name_en, delivery_fee, estimated_days, is_available, sort_order)
VALUES ('Douala', 'Douala', 2000, 'Même jour – lendemain / Same day – next day', true, 0);

INSERT INTO delivery_settings (free_delivery_threshold) VALUES (50000);

ALTER TABLE delivery_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings DISABLE ROW LEVEL SECURITY;
```

### Douala protection
Douala is identified by `sort_order = 0`. The admin UI hides the delete button for any zone with `sort_order === 0`. No DB-level constraint — purely a UI guard. Do not change Douala's sort_order.

### API Routes
- `GET /api/delivery-zones` — returns all zones where `is_available = true`, ordered by sort_order then city_name_fr
- `GET /api/delivery-settings` — returns `{ free_delivery_threshold }` (defaults to 50000 if table empty)

### Agencies storage
Stored as a JSONB array of plain strings in `delivery_zones.agencies`. Example: `["Vatican Express", "Buca Voyages"]`. No IDs — just names. Admin UI manages them as a tag-list (add/remove by name).

### Types added to src/lib/supabase.ts
- `DeliveryZone` — id, city_name_fr, city_name_en, delivery_fee, estimated_days, is_available, agencies (string[]), sort_order
- `DeliverySettings` — id, free_delivery_threshold, updated_at
- `deliveryZoneService` — getAll(), create(), update(), delete(), getSettings(), updateSettings()

### Files created/modified
- `src/lib/supabase.ts` — added DeliveryZone, DeliverySettings types and deliveryZoneService
- `src/app/api/delivery-zones/route.ts` — NEW GET handler
- `src/app/api/delivery-settings/route.ts` — NEW GET handler
- `src/app/admin/delivery/page.tsx` — NEW full admin panel (zone table, add/edit modal, agencies tag-list, free delivery threshold card)
- `src/app/admin/layout.tsx` — added Delivery nav item (Truck icon), Logout button
- `src/app/admin/page.tsx` — added "Manage delivery zones" quick action
- `src/components/LeadModal.tsx` — fetches zones from API on mount, shows agency dropdown when agencies configured, "Other agency" free-text fallback, live delivery fee display with estimated delay

### LeadModal delivery fee logic
```typescript
const zoneFee = selectedZone?.delivery_fee ?? (city === 'Douala' ? 2000 : 3000);
const deliveryFee = subtotal >= freeThreshold ? 0 : zoneFee;
```
`freeThreshold` is fetched from `/api/delivery-settings` on mount (fallback: 50000).
City list is populated from API; fallback static list used if API fails.

### Agency dropdown logic
- If the selected zone has agencies configured → show `<select>` with those names + "Other agency…" option
- If "Other agency" selected → show text input for `customAgency`
- If no agencies configured for zone → show plain text input
- `effectiveAgency` = agency === `'__custom__'` ? customAgency : agency

### What Sprint 5+ needs to know
- Sprint 4 was completed AFTER Sprint 5–8 in practice (was skipped). No regressions introduced.
- LeadModal previously had hardcoded CITIES array — now replaced with dynamic API fetch with static fallback
- Free delivery threshold is now dynamic (from DB) not hardcoded

---

## Sprint 5 — Homepage & PLP Redesign

**Status:** ✅ Complete — commit 5ee7649

### Files changed
- `src/app/page.tsx` — full homepage rewrite
- `src/app/products/page.tsx` — PLP with URL params + sort
- `src/app/layout.tsx` — added FloatingWhatsApp to root layout
- `src/components/FloatingWhatsApp.tsx` — NEW

### Homepage changes
- **Hero:** Updated copy per sprint spec. Stats row simplified to inline text (not stat cards anymore — cleaner at mobile).
- **Category grid:** 5 cards (keyboard/mouse/cable/speaker/solar_lamp), inline SVG icons (no library, no file imports), grid-cols-2 mobile / grid-cols-5 desktop. Links to `/products?category=[slug]`. Hover turns icon brand-blue + border.
- **Trust badges:** Updated copy to match sprint spec exactly.
- **How it works:** Kept layout, updated bilingual copy.
- **Brand statement:** Kept dark card + trust checklist. Updated copy.
- **Footer:** Full rebuild — 3 columns: brand+tagline, navigation links, social links. Social: Facebook/Instagram/TikTok/WhatsApp with correct URLs from SKILL.md. Nav: Products, Return Policy (links to `/return-policy` and `/terms` — pages not built yet, Sprint 7). Copyright: "© 2026 Loving Tech Cameroun." Tagline "Elevate Your Performance" included.

### Floating WhatsApp button
- File: `src/components/FloatingWhatsApp.tsx`
- Rendered in `src/app/layout.tsx` (root) — appears on ALL pages including admin. Sprint 6/7 can exclude from admin layout if desired.
- Inline WhatsApp SVG path (no library), bg-brand-orange, fixed bottom-right, z-50, h-14 w-14 circle.

### PLP — URL query params
URL structure: `/products?category=keyboard&condition=new&sort=price_asc&stock=1`
- `category` — one of: keyboard | mouse | cable | speaker | solar_lamp | (empty = all)
- `condition` — one of: new | refurbished | second_hand | (empty = all)
- `sort` — one of: newest (default, omitted from URL) | price_asc | price_desc
- `stock` — `1` = in-stock only | (absent = all)
- Search query is NOT in URL (local state only, resets on reload — acceptable for now)
- Uses `useSearchParams()` + `router.replace()` with `scroll: false`

### PLP — Sort
Three options: Newest (default, DB order) / Price ↑ / Price ↓. `sortProducts()` function sorts a copy of the array.

### What Sprint 6 needs to know
- Footer links to `/return-policy` and `/terms` — these 404 until Sprint 7 builds them
- FloatingWhatsApp renders on admin pages too — if unwanted, move it out of root layout and into page-level layouts instead
- PLP search is still local state (not URL param) — if needed for Sprint 7 SEO/sharing, add `q=` param
- Category grid on homepage links to `/products?category=slug` — the PLP handles this correctly via `useSearchParams`

---

## Sprint 6 — Reviews, Promo Codes & Related Products

**Status:** ✅ Complete — commits in main branch

### Database SQL
```sql
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  order_ref     TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  reviewer_name TEXT NOT NULL,
  status        TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE promo_codes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT UNIQUE NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value            INTEGER NOT NULL,
  min_order_amount INTEGER DEFAULT 0,
  max_uses         INTEGER,
  uses_count       INTEGER DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes DISABLE ROW LEVEL SECURITY;
```

### validatePromo() — src/lib/validatePromo.ts
```typescript
validatePromo(code, orderSubtotal, deliveryFee) → { valid, discount, message } | { valid, error }
```
- Fetches from `promo_codes` table using `ilike` (case-insensitive)
- Checks: is_active, expires_at, uses_count vs max_uses, min_order_amount
- Discount = percent: `Math.floor(subtotal * value / 100)`, fixed: `value`
- Caps discount so total never goes below deliveryFee
- Error messages are bilingual strings

### uses_count increment
`promoService.incrementUses(code)` is called **after** order is created in DB (inside LeadModal handleSubmit). Fire-and-forget (`.catch(() => {})`). Not transactional — acceptable for this scale.

### Related products — src/lib/relatedProducts.ts
```typescript
getRelatedProducts(productId, category, tags) → Product[]
```
- Fetches same-category products (excluding current, limit 8) where stock_qty > 0 OR stock_status = 'in_stock'
- Scores: +2 per shared tag
- Returns top 4 sorted by score DESC
- Returns empty array if no DB products found

### Types added to src/lib/supabase.ts
- `ReviewStatus` = 'pending' | 'approved' | 'rejected'
- `Review` — id, product_id, order_ref, rating, comment, reviewer_name, status, created_at
- `PromoCode` — id, code, type, value, min_order_amount, max_uses, uses_count, expires_at, is_active
- `reviewService` — getByProduct(), getAll(), create(), updateStatus(), getPendingCount()
- `promoService` — getAll(), create(), update(), delete(), incrementUses()

### Files created/modified
- `src/lib/supabase.ts` — added Review, PromoCode types and services
- `src/lib/validatePromo.ts` — NEW
- `src/lib/relatedProducts.ts` — NEW
- `src/components/ReviewSection.tsx` — NEW: star rating, review list, submit form; only shown on DB products (UUID check)
- `src/app/product/[id]/page.tsx` — added ReviewSection, related products grid, generateMetadata(), JSON-LD Product schema
- `src/components/LeadModal.tsx` — added promo code input in Step 3, uses validatePromo(), shows bilingual error/success messages
- `src/app/admin/reviews/page.tsx` — NEW: filter pills, review cards, approve/reject actions
- `src/app/admin/promos/page.tsx` — NEW: table, create form, toggle active, delete
- `src/app/admin/layout.tsx` — added Reviews (Star) and Promos (Tag) nav items
- `src/app/admin/page.tsx` — added pending reviews badge to dashboard

### RLS issue pattern (important for future tables)
Every new Supabase table created via SQL needs `ALTER TABLE x DISABLE ROW LEVEL SECURITY` or the anon key cannot write to it. This caused silent failures on orders (42501 error), reviews (PERMISSION DENIED), and promo_codes. Always add the DISABLE RLS line when creating tables.

### productService.update() fix
Previously silently returned stale data when 0 rows were updated (RLS blocking). Now throws: `Error('Update blocked: no rows modified...')`. This surfaces RLS failures clearly instead of appearing to succeed.

### What Sprint 7 needs to know
- PDP review section is only shown for products with UUID-format IDs (regex check). Local products (id = '1', '2', etc.) don't show reviews.
- Related products also only fetched for UUID products
- Footer links to /return-policy and /terms — Sprint 7 builds these pages

---

## Sprint 7 — Legal Pages, SEO & Performance

**Status:** ✅ Complete — commits in main branch

### Legal pages created
| Route | File | Notes |
|---|---|---|
| `/return-policy` | `src/app/return-policy/page.tsx` | Bilingual condition table, numbered process, void conditions |
| `/politique-de-retour` | `src/app/politique-de-retour/page.tsx` | Re-exports default + metadata from return-policy/page |
| `/terms` | `src/app/terms/page.tsx` | 10 bilingual articles |
| `/conditions` | `src/app/conditions/page.tsx` | Re-exports default + metadata from terms/page |

FR alias pages use `export { default } from '../return-policy/page'` — no duplication.

### SEO — src/app/layout.tsx (root metadata)
```typescript
metadata: {
  title: 'Loving Tech — Accessoires Tech Premium | Cameroun',
  description: 'Achetez des accessoires tech authentiques...',
  openGraph: { title, description, url: 'https://loving-tech.vercel.app', siteName: 'Loving Tech', locale: 'fr_CM' },
  twitter: { card: 'summary_large_image', title, description }
}
```

### SEO — PDP (src/app/product/[id]/page.tsx)
- `generateMetadata()` — per-product dynamic title (`name_fr — price FCFA | Loving Tech`), description (description_fr sliced to 155 chars), og:image from `product.images[0]`
- JSON-LD `Product` schema injected via `<script type="application/ld+json" dangerouslySetInnerHTML>` directly in the page server component

### Sitemap — src/app/sitemap.ts
- Next.js 14 App Router convention (`export default function sitemap()`)
- Includes: homepage, /products, 5 category URLs, /return-policy, /politique-de-retour, /terms, /conditions
- Dynamically fetches active products from Supabase and adds their PDP URLs
- Falls back gracefully if DB fetch fails (returns static URLs only)

### Robots — src/app/robots.ts
```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://loving-tech.vercel.app/sitemap.xml
```

### Performance notes
- Hero images use CSS `background-image` (not Next.js `<Image>`) — acceptable for full-bleed hero backgrounds
- Product images in ProductCard/ProductGallery use native `<img>` — not converted to `<Image>` (Cloudinary CDN handles optimization)
- Font: Inter via `next/font/google` with `subsets: ['latin']` — already set up in layout.tsx since Sprint 1
- No Lighthouse benchmark was run (no browser tooling available in agent context)

### What Sprint 8 needs to know
- `/return-policy` and `/terms` are live — footer links and modal links now resolve correctly
- hreflang alternate tags NOT implemented — deferred (no slug-based URLs per language; the app uses a single-URL + client-side language toggle approach)
- Sitemap fetches products server-side — ensure Supabase is seeded with products before indexing
- JSON-LD is inline in the PDP server component, not a separate component

---

## Sprint 8 — QA, Mobile Polish & Launch

**Status:** ✅ Complete — commit 0d5a724

### Bugs found and fixed

| Bug | File | Fix |
|---|---|---|
| `language` not destructured from useLanguage | `LeadModal.tsx` | Added `language` to `const { t, language } = useLanguage()` |
| Legal links in modal used `t()` with JSX (type error) | `LeadModal.tsx` | Replaced with `language === 'fr' ? <> FR JSX </> : <> EN JSX <>` conditional |
| `useSearchParams()` called outside Suspense boundary | `products/page.tsx` | Extracted inner `ProductsContent` component, wrapped in `<Suspense>` |
| `MessageCircle` import removed but still used in "How it works" step 2 | `page.tsx` | Re-added `MessageCircle` to lucide-react import |
| Admin panel fully unprotected (any URL accessible without login) | — | Added middleware + login page (see below) |

### Admin authentication — NEW
- `src/middleware.ts` — intercepts all `/admin/*` requests, redirects to `/admin/login` if `admin_auth` cookie not set
- `src/app/api/admin-login/route.ts` — `POST` sets httpOnly cookie, `DELETE` clears it
- `src/app/admin/login/page.tsx` — password form (Suspense-wrapped for useSearchParams)
- Password stored in `ADMIN_PASSWORD` env variable (default: `LovingTech2026!`)
- Cookie: httpOnly, secure in production, sameSite=lax, 7-day expiry
- Logout button added to admin nav (LogOut icon)
- **Action required:** Set `ADMIN_PASSWORD` in Vercel environment variables before going live

### PRE_LAUNCH.md
Created at project root — covers: content checklist, delivery zones, legal pages, technical setup (env vars, Supabase tables, HTTPS), WhatsApp/social links, final tests.

### Known limitations / Phase 2 items
- **No email system** — all communication via WhatsApp only (by design, Phase 1)
- **No user accounts** — guest checkout only
- **hreflang** not implemented — app uses single URL + client-side language toggle, not separate FR/EN URL slugs
- **Lighthouse scores** not benchmarked (no browser tooling in agent)
- **`<img>` tags** still used in ProductCard, ProductGallery, ImageUploader (Cloudinary CDN handles optimization; Next.js `<Image>` conversion deferred to Phase 2)
- **Status colors** (green/red/amber for order/review statuses) use semantic Tailwind colors, not brand tokens — this is intentional UX convention, not a brand violation
- **FloatingWhatsApp** appears on admin pages — acceptable, can be moved to page-level layouts in Phase 2 if unwanted

### Files created/modified in Sprint 8
- `src/middleware.ts` — NEW
- `src/app/admin/login/page.tsx` — NEW
- `src/app/api/admin-login/route.ts` — NEW
- `src/app/admin/layout.tsx` — added useRouter, logout(), LogOut icon, logout button
- `src/app/page.tsx` — re-added MessageCircle import
- `src/app/products/page.tsx` — Suspense wrapper for ProductsContent
- `src/components/LeadModal.tsx` — language destructure fix, JSX legal links fix
- `PRE_LAUNCH.md` — NEW at project root

---

## Global Decisions (update anytime)

### Architecture

**2026-04-26: Supabase (PostgreSQL) chosen as backend**
Single anon key for all read/write. RLS is disabled on every table (`ALTER TABLE x DISABLE ROW LEVEL SECURITY`) because the anon key needs write access and there are no per-user auth requirements in Phase 1.

**2026-04-26: No separate API layer**
All DB calls go through `src/lib/supabase.ts` service objects (productService, orderService, etc.) called directly from components. No custom API routes except for delivery zones (needed for server-side fetch) and admin login.

**2026-04-26: Variants stored as JSONB in products.variants column**
Structure: `[{ label: "Color", options: [{ name: "Black", stock_qty: 5, price_delta: 0 }] }]`
Not a separate table — simpler to query, acceptable for this product volume.

**2026-04-26: Single URL + client-side language toggle (not separate FR/EN routes)**
Language stored in localStorage via LanguageContext. All pages are at the same URL. The `t({ en, fr })` helper returns the correct string. This means no hreflang alternate URLs are possible without a route refactor.

**2026-04-26: LOCAL_PRODUCTS fallback**
`src/lib/localProducts.ts` holds a static array of products as a loading fallback. Pages render LOCAL_PRODUCTS immediately, then replace with DB data on mount. Local product IDs are non-UUID strings ('1', '2', etc.) — DB products have UUID IDs. UUID check: `/^[0-9a-f]{8}-...-[0-9a-f]{12}$/i.test(id)` is used throughout to gate DB-only features (reviews, related products).

### RLS Pattern (critical — apply to every new table)
```sql
ALTER TABLE <new_table> DISABLE ROW LEVEL SECURITY;
```
Without this, all inserts/updates from the anon key silently return 0 rows or throw `42501`. This has bitten us on orders, reviews, promo_codes, products, delivery_zones, and delivery_settings. Always add this line when creating a new table.

### Admin Auth
- Route: `/admin/login`
- Mechanism: httpOnly cookie `admin_auth=true` (7-day expiry), set by `POST /api/admin-login`
- Password: `ADMIN_PASSWORD` env variable (must be set in Vercel before launch)
- Middleware: `src/middleware.ts` guards all `/admin/*` except `/admin/login`
- Default password `LovingTech2026!` is committed to `.env.local` — change before going live

### Supabase Tables (all created, RLS disabled)
| Table | Sprint | Purpose |
|---|---|---|
| `products` | Pre-existing | Product catalog |
| `orders` | Sprint 3 | Customer orders |
| `reviews` | Sprint 6 | Product reviews (pending → approved → rejected) |
| `promo_codes` | Sprint 6 | Discount codes (percent or fixed) |
| `delivery_zones` | Sprint 4 | Cities with fees, delays, agencies |
| `delivery_settings` | Sprint 4 | Free delivery threshold (default 50 000 FCFA) |

### t() function — string only, not JSX
`t({ en, fr })` from `useLanguage()` accepts plain strings only. For bilingual JSX (with links, bold etc.) use: `language === 'fr' ? <> FR JSX </> : <> EN JSX <>` directly in the render.

### HeroCarousel background images
- Slides 1 and 2 use local `/images/carousel_1.png` and `/images/carousel_2.png` with `backgroundSize: cover` and a lighter overlay (`rgba(17,17,17,0.75)` → `0.45` → `0.65`)
- Slide 3 uses a remote Logitech product image with `backgroundSize: contain` and a near-opaque overlay
- Adding a new local image slide: use `slide.id <= N` check in the style/overlay conditionals

---

*Keep this file updated. It is the memory that the agent does not have.*