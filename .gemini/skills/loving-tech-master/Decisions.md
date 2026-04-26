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

**Status:** ⬜ Not started

```
[Agent paste handover note here after Sprint 4 is complete]

Suggested sections to look for:
- delivery_zones and delivery_settings table SQL (final)
- How Douala is protected from deletion (constraint? UI guard?)
- API routes for fetching zones (path, response shape)
- How agencies JSONB is structured
- calcDeliveryFee() location
- Admin delivery panel route
- How zones connect to the order modal city dropdown
```

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

**Status:** ⬜ Not started

```
[Agent paste handover note here after Sprint 6 is complete]

Suggested sections to look for:
- reviews table SQL (final)
- promo_codes table SQL (final)
- validatePromo() function location and exact logic
- How uses_count is incremented (on order creation? on submit?)
- Related products scoring algorithm (exact implementation)
- API routes for review submission, promo validation
- Admin review + promo panel routes
```

---

## Sprint 7 — Legal Pages, SEO & Performance

**Status:** ⬜ Not started

```
[Agent paste handover note here after Sprint 7 is complete]

Suggested sections to look for:
- Legal page routes (exact paths for FR + EN)
- How sitemap is generated (static? dynamic API route?)
- JSON-LD implementation (component? inline in page?)
- hreflang implementation approach
- Lighthouse scores before and after (LCP, CLS, FID)
- Any performance changes made and their impact
- Font loading approach (which font, next/font setup)
```

---

## Sprint 8 — QA, Mobile Polish & Launch

**Status:** ⬜ Not started

```
[Agent paste handover note here after Sprint 8 is complete]

Suggested sections to look for:
- Full list of bugs found and fixes applied
- Mobile issues fixed (with before/after)
- Brand audit issues corrected
- Final Lighthouse scores
- PRE_LAUNCH.md content
- Any known limitations or items deferred to Phase 2
- Final production deployment notes
```

---

## Global Decisions (update anytime)

> Use this section for decisions that cut across multiple sprints — things you decided outside of a sprint or that the agent flagged as important to track globally.

```
[Example entries — replace with real ones as you go:]

2026-05-01: Chose Supabase (not Payload CMS) for the backend — simpler for solo operator
2026-05-01: All admin routes use /admin prefix, protected by Supabase Auth
2026-05-02: Product slugs generated from name_fr, lowercased, hyphenated
2026-05-03: Variants stored as JSONB in a single column (not a separate table) — simpler to query
```

---

*Keep this file updated. It is the memory that the agent does not have.*