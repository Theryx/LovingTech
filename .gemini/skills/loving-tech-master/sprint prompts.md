# Loving Tech — Sprint Prompts
> The agent shoould execute one prompt per sprint. The agent should read and understand the entire prompt requirement.
> The agent should also reference SKILL.md alongside the sprint prompt — the agent needs both.

---

## How the agent uses these Prompts

1. **Read `SKILL.md`** before or alongside every prompt
2. **The agent should read and understand the entire full sprint block** — including the instruction line at the top
3. **After the sprint**, the agent: *"Write a handover note listing every decision, file, schema change, component, and assumption made in this sprint."*
4. **Agent should update the handover note** into the `[SPRINT N DECISIONS]` section of `SKILL.md`
5. **Start the next sprint** by reading and understanding the updated `SKILL.md`

---

## Sprint 1 — Design System & Brand Correction

**Goal:** Fix all brand colors. Set up Tailwind tokens. Build shared component library.
**Type:** Refactor
**Depends on:** Nothing — do this first.

---

```
You are working on an existing Next.js + Tailwind CSS e-commerce project called Loving Tech.
Read the attached SKILL.md carefully before doing anything. It is your complete project reference.

## Your task for this sprint

Audit the entire codebase and correct the brand color system, then build a shared component library.

### Step 1 — Color Audit & Fix

1. Search the entire codebase for every hardcoded color value (hex codes, Tailwind color classes like `blue-500`, `orange-400`, etc.)
2. List every file and line where an off-brand color is used
3. Replace all colors with the correct brand tokens defined in SKILL.md
4. Update `tailwind.config.js` to add the brand color tokens:

```js
// tailwind.config.js — add inside theme.extend.colors
brand: {
  blue:   '#4494F3',
  orange: '#F88810',
  grey:   '#D2D1D1',
  dark:   '#111111',
}
```

### Step 2 — Build Shared Components at `/components/ui/`

Build these 5 components. Use the brand tokens only.

**Button.tsx**
Three variants:
- `primary` — bg-brand-orange, white text, rounded-full, hover: slight darken
- `secondary` — border-2 border-brand-blue, brand-blue text, transparent bg, hover: light blue bg
- `whatsapp` — bg-brand-dark, white text, full width, includes WhatsApp icon (SVG inline or lucide)

Props: `variant`, `children`, `onClick`, `href` (optional, renders as <a>), `disabled`, `fullWidth`

**Badge.tsx**
Six variants (all rounded-full, small text, padding px-3 py-1):
- `new`          — bg #D1FAE5, text #065F46, label: "Neuf / New"
- `refurbished`  — bg #DBEAFE, text #1E3A8A, label: "Reconditionné / Refurbished"
- `second_hand`  — bg #FEF3C7, text #92400E, label: "Occasion / Second-hand"
- `out_of_stock` — bg #FEE2E2, text #991B1B, label: "Rupture de stock / Out of Stock"
- `low_stock`    — bg #FEF3C7, text #92400E, label: "Stock limité / Low Stock"
- `sale`         — bg brand-orange, text white, label: "Promo"

Props: `variant`, optional `label` override

**Card.tsx**
A product card shell:
- White bg, rounded-2xl, subtle shadow, hover: shadow-md + slight scale
- Image slot (top, aspect-ratio 4:3, overflow hidden, rounded-t-2xl)
- Badge slot (absolute top-left on image)
- Brand label slot (absolute top-right on image, grey pill)
- Content area: product name, price, optional crossed-out compare_at_price, CTA slot
- Out-of-stock state: image darkened + "Rupture de stock" badge overlay

Props: `image`, `badge`, `brandLabel`, `name`, `price`, `compareAtPrice`, `ctaSlot`, `isOutOfStock`

**Input.tsx**
Standard text input:
- Border: 1px solid brand-grey
- Focus: border-brand-blue, ring-2 ring-brand-blue/20
- Placeholder: text-brand-grey
- Error state: border-red-400 + error message below

Props: `label`, `placeholder`, `value`, `onChange`, `error`, `prefix` (for phone number +237)

**LanguageToggle.tsx**
- Pill toggle: "FR" | "EN"
- Active language: bg-brand-blue, white text
- Inactive: transparent, grey text
- On toggle: updates global language context

### Step 3 — Verify Dark Mode

Check that every component works correctly in both light and dark mode.
Fix any broken styles in dark mode.

### Rules
- Do NOT change page layouts, routing, or business logic
- Do NOT change the database
- Orange is ONLY for: primary CTA buttons, sale/promo badges, low-stock badges
- Blue is ONLY for: nav, links, secondary buttons, focus rings, trust elements

### End of sprint — write a handover note
At the end, write a markdown handover note with:
- Every file you changed and why
- Every file you created
- Any color values you replaced and what you replaced them with
- Any decisions or assumptions you made
- Anything the next sprint needs to know
```

---

## Sprint 2 — Product Conditions, Variants & Category System

**Goal:** Extend the product model and all product UI to support conditions, variants, categories, and bilingual fields.
**Type:** Rebuild + Extend
**Depends on:** Sprint 1 (Badge, Card, Button components)

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
The Sprint 1 components (Button, Badge, Card, Input) are already built and available in /components/ui/.

## Your task for this sprint

Extend the product data model and update all related UI to support:
- Product conditions (new / refurbished / second_hand)
- Product variants (color, type, length — with per-variant stock and price)
- A proper category system (5 categories replacing brand-only filtering)
- Bilingual product content (name_fr/name_en, description_fr/description_en)

### Step 1 — Database Changes

Run this migration:

```sql
-- Add condition (required)
ALTER TABLE products ADD COLUMN condition TEXT NOT NULL DEFAULT 'new'
  CHECK (condition IN ('new', 'refurbished', 'second_hand'));

-- Add category (required)
ALTER TABLE products ADD COLUMN category TEXT NOT NULL DEFAULT 'keyboard'
  CHECK (category IN ('keyboard', 'mouse', 'cable', 'speaker', 'solar_lamp'));

-- Bilingual fields (rename or add if not already split)
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_fr TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_fr TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Replace boolean stock with quantity
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3;

-- Compare-at price for sales
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price INTEGER;

-- Warranty info
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_info TEXT;

-- Variants (JSONB)
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';

-- Tags
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
```

### Step 2 — Admin Product Form

Update `/admin/products/add` and `/admin/products/[id]/edit`:

**Section: Informations de base**
- Nom (FR) — text input — required
- Name (EN) — text input — required
- Condition — dropdown: Neuf / Reconditionné / Occasion — required
  - On select "Occasion": show warning banner "⚠️ Les photos doivent montrer le produit réel / Photos must show the actual item"
  - On select "Reconditionné": pre-fill warranty_info with "30 jours / 30 days"
  - On select "Neuf": pre-fill warranty_info with "Garantie fabricant / Manufacturer warranty"
- Catégorie — dropdown: Clavier / Souris / Câble / Enceinte / Lampe Solaire — required
- Prix (XAF) — number input
- Prix barré / Compare-at price (XAF) — number input, optional
- Marque / Brand — text input
- Garantie / Warranty — text input (pre-filled based on condition, editable)
- Stock — number input (shown only when no variants defined)

**Section: Description**
- Two side-by-side textareas: Description (FR) + Description (EN)

**Section: Variantes / Variants**
- "Ajouter un groupe de variantes / Add variant group" button
- Each variant group:
  - Label input: e.g. "Couleur / Color" or "Longueur / Length"
  - Options list: each option has Name + Stock + Price delta (±FCFA)
  - "Ajouter une option / Add option" button
  - Delete button per option, delete button per group
- When variants exist: hide the main stock_qty field (stock is per variant)

**Section: Images**
- Drag-and-drop, up to 8 images
- If condition = "Occasion": require minimum 2 images before save
- Show image count: "3 / 8 images"
- First image = main product image

**Validation before save:**
- condition is required
- category is required
- At least name_fr OR name_en filled
- If condition = second_hand AND images < 2: block save + show error

### Step 3 — Product Listing Page (PLP)

Update `/produits` and `/products`:

**Add category filter tabs** (above existing filters):
- Tous / All · Claviers / Keyboards · Souris / Mice · Câbles / Cables · Enceintes / Speakers · Lampes / Lamps
- Active tab: bg-brand-blue, white text
- Clicking a tab filters products by category

**Add condition filter:**
- Dropdown or pill group: Toutes conditions / Neuf / Reconditionné / Occasion

**Update product cards to show:**
- Condition Badge component (top-left corner of image)
- OUT OF STOCK overlay (red, semi-transparent) when stock_qty = 0
- "Stock limité" badge (orange) when stock_qty ≤ low_stock_threshold
- Crossed-out compare_at_price above main price (if set)
- Price in FCFA: "35 000 FCFA"

### Step 4 — Product Detail Page (PDP)

Update `/produits/[slug]` and `/products/[slug]`:

**Above the title:**
- Brand label (grey pill, small caps)
- Condition Badge (using Badge component)

**Price area:**
- Main price in FCFA
- Crossed-out compare_at_price if set (grey, smaller)
- Stock indicator:
  - "En stock" — green dot + text (if stock_qty > low_stock_threshold)
  - "Stock limité — X restant(s)" — orange dot + text (if stock_qty ≤ threshold and > 0)
  - "Rupture de stock" — red dot + text (if stock_qty = 0)

**Variant selector (if variants exist):**
- One row of buttons per variant group
- Button label: option name
- Selecting an option: highlights button (bg-brand-blue, white text)
- Updates displayed stock and price (base + price_delta) live
- Out-of-stock option: show but disable (grey, strikethrough)

**Description:**
- Two tabs: FR | EN (using brand-blue underline for active tab)
- Tab shows the respective description_fr or description_en

**Warranty section:**
- Below description
- Label: "Garantie / Warranty"
- Value: warranty_info from product

**Technical specs:**
- Existing specs section — keep, ensure it displays correctly

### Step 5 — Admin Products List Update

Add columns: Condition (badge) · Catégorie · Stock (qty number, red if 0, orange if ≤ threshold)

### End of sprint — write a handover note
List: schema changes made, files created/modified, decisions on variant storage format, any migration notes, anything Sprint 3 needs to know.
```

---

## Sprint 3 — Full Order System

**Goal:** Replace the "Prospects" system with a complete order pipeline. Extend the WhatsApp order modal. Build admin order management.
**Type:** Rebuild
**Depends on:** Sprint 2 (product model), Sprint 1 (components)

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
Sprints 1 and 2 are complete. Check SKILL.md section 15 (Decisions Log) for what was built.

## Your task for this sprint

Replace the "Prospects" system with a full order pipeline.

### Step 1 — Database

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref       TEXT UNIQUE NOT NULL,

  product_id      UUID REFERENCES products(id),
  product_name    TEXT NOT NULL,
  variant_chosen  TEXT,
  quantity        INTEGER DEFAULT 1,
  unit_price      INTEGER NOT NULL,
  total_price     INTEGER NOT NULL,

  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,

  city            TEXT NOT NULL,
  bus_agency      TEXT,
  quartier        TEXT NOT NULL,
  address_details TEXT,
  delivery_fee    INTEGER NOT NULL,

  promo_code      TEXT,
  promo_discount  INTEGER DEFAULT 0,

  status          TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','dispatched','delivered','cancelled')),

  admin_notes     TEXT,
  status_history  JSONB DEFAULT '[]',

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

Order reference generation (server-side utility):
```typescript
// lib/generateOrderRef.ts
export function generateOrderRef(): string {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `LT-${date}-${rand}`;
}
```

### Step 2 — WhatsApp Order Modal (3-step)

Replace the current simple modal with a 3-step modal.

**Step 1 — Contact**
- Numéro WhatsApp * — Input with "+237" prefix, validate 9 digits after prefix
- Nom complet / Full name *

**Step 2 — Livraison / Delivery**
- Ville * — dropdown populated from delivery_zones table (available cities only)
  - On city select: show "Frais de livraison: X FCFA · Délai: Y jours"
  - If order qualifies for free delivery: show "✅ Livraison gratuite!"
  - If city is unavailable: show "Livraison non disponible dans votre ville / Delivery not available in your city"
- Agence de bus — dropdown of agencies for selected city (from delivery_zones.agencies)
  + below it: text input "Autre agence / Other agency" for custom entry
- Quartier / Neighbourhood *
- Instructions de livraison — optional text

**Step 3 — Résumé / Summary**
- Product + variant + quantity
- Unit price in FCFA
- Delivery fee (0 if free delivery applies)
- Promo code input + "Appliquer / Apply" button
  - Valid: show "✅ Code appliqué — -X FCFA"
  - Invalid: show specific error
- Total in FCFA
- Legal line: "En commandant, vous acceptez nos Conditions et notre Politique de retour"
- "Commander via WhatsApp →" button (full-width, dark/whatsapp variant)

**On submit:**
1. Create order in DB (status = pending)
2. Open WhatsApp: `wa.me/237655163248?text=[encoded message]`
   Message format is defined in SKILL.md section 11
3. Redirect to `/suivi/[order_ref]` or show confirmation screen

### Step 3 — Admin Orders Panel

**List page `/admin/orders`:**
- Page title: "Commandes / Orders" (NOT "Prospects")
- Columns: Référence · Produit · Client · Ville · Agence · Statut · Date · Actions
- Status badge per row (color-coded: yellow=pending, blue=confirmed, orange=dispatched, green=delivered, red=cancelled)
- Pending orders: highlighted with orange left border
- Filters: status · date range · city · search (order ref or customer name)
- "Exporter CSV / Export CSV" button — exports filtered results

**Detail page `/admin/orders/[id]`:**
- Full customer info section
- Product + variant + quantity + price breakdown table
- Delivery info: city, agency, quartier, address
- Promo: code + discount applied
- Total in FCFA
- Admin notes: textarea, saves inline on blur
- Status update buttons: Confirmer / Expédier / Marquer livré / Annuler
  - Each update: ask confirmation dialog before saving
  - Each update: appends to status_history JSONB with timestamp
- "Contacter le client / Contact customer" button:
  Opens `wa.me/[customer_phone]?text=Bonjour [customer_name], concernant votre commande [order_ref]...`
- Status timeline: shows all status changes with timestamps

### Step 4 — Customer Order Status Page

**Route:** `/suivi/[order-ref]` (FR) + `/track/[order-ref]` (EN)

- Public — no login required
- Input: order reference number
- Shows: product name, quantity, status badge, status timeline, city + agency, estimated delivery
- Bilingual status messages:
  - pending: "Votre commande a été reçue. Nous vous contacterons bientôt. / Your order has been received. We will contact you shortly."
  - confirmed: "Votre commande est confirmée et en cours de préparation. / Your order is confirmed and being prepared."
  - dispatched: "Votre commande a été expédiée via [agency]. / Your order has been shipped via [agency]."
  - delivered: "Votre commande a été livrée. Merci! / Your order has been delivered. Thank you!"
  - cancelled: "Votre commande a été annulée. Contactez-nous sur WhatsApp. / Your order was cancelled. Contact us on WhatsApp."

### Step 5 — Dashboard Updates

Add to admin dashboard home:
- Commandes aujourd'hui / Orders today (count)
- Revenu aujourd'hui / Revenue today (FCFA)  
- Commandes en attente / Pending orders (count, highlighted in orange if > 0)
- Quick link: "Voir les commandes en attente →"

### Remove
- Delete all "Prospects" routes, components, and DB tables
- Remove all "Prospect" labels from nav, dashboard, and anywhere else

### End of sprint — write a handover note
List: tables created, routes added, how order ref is generated, how delivery fee is calculated, how promo is applied, modal state management approach, anything Sprint 4 needs to know.
```

---

## Sprint 4 — Delivery Zone & Bus Agency System

**Goal:** Build the full delivery zone management system in admin. Power the city + agency dropdowns in the order modal.
**Type:** New build
**Depends on:** Sprint 3 (order modal uses delivery zones)

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
Sprints 1, 2, and 3 are complete. Check SKILL.md section 15 (Decisions Log) for context.

## Your task for this sprint

Build the complete delivery zone and bus agency management system.

### Step 1 — Database

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

-- Seed: Douala (always first, cannot be deleted)
INSERT INTO delivery_zones (city_name_fr, city_name_en, delivery_fee, estimated_days, is_available, sort_order)
VALUES ('Douala', 'Douala', 2000, 'Même jour – lendemain / Same day – next day', true, 0);

-- Seed: settings
INSERT INTO delivery_settings (free_delivery_threshold) VALUES (50000);
```

### Step 2 — Admin Delivery Panel `/admin/delivery`

**Page layout:**
- Title: "Zones de livraison / Delivery Zones"
- Free delivery settings card (top):
  - Label: "Livraison gratuite à partir de:"
  - Number input showing current threshold (FCFA)
  - "Enregistrer / Save" button
  - Helper: "Actuellement: livraison gratuite à partir de 50 000 FCFA"

- Zones table:
  - Columns: Ville (FR/EN) · Frais · Agences configurées · Délai · Disponible (toggle) · Actions (Edit/Delete)
  - Douala row: no delete button (permanent), can edit
  - "Ajouter une ville / Add city" button — opens side panel or modal

- Add/Edit city form:
  - Nom (FR) * — text input
  - Name (EN) * — text input
  - Frais de livraison (FCFA) * — number input
  - Délai estimé * — text, e.g. "2–3 jours ouvrables / 2–3 business days"
  - Disponible — toggle (on = shows at checkout, off = greyed out + unavailability message)
  - Agences de bus section:
    - List of current agency names, each with a remove (×) button
    - "+ Ajouter une agence / Add agency" button — adds a text input inline
    - No limit on number of agencies
  - Save / Cancel buttons

### Step 3 — Connect to Order Modal

The Sprint 3 order modal Step 2 (Delivery) has a city dropdown.
Connect it to the delivery_zones table:

```typescript
// API route: GET /api/delivery-zones
// Returns: all zones where is_available = true
// Sorted: Douala first (sort_order = 0), then alphabetical
// Shape: { id, city_name_fr, city_name_en, delivery_fee, estimated_days, agencies }
```

In the modal:
- City dropdown shows `city_name_fr` (or `city_name_en` when EN toggle active)
- On select: fetch delivery fee + agencies for that city
- Agency dropdown: shows agencies[].name for selected city
- Below agency dropdown: text input "Autre agence / Other agency"
  - If admin has configured no agencies for a city, show only the text input (no dropdown)
- If city is_available = false (should not appear, but guard anyway): show unavailability message

Delivery fee calculation:
```typescript
// lib/deliveryFee.ts
export function calcDeliveryFee(zoneDeliveryFee: number, orderSubtotal: number, threshold: number): number {
  return orderSubtotal >= threshold ? 0 : zoneDeliveryFee;
}
```

Show fee update in real-time in the modal as the customer changes city or quantity.

### Step 4 — Dashboard Link

Add to admin dashboard quick links:
"Gérer les zones de livraison →" → `/admin/delivery`

### End of sprint — write a handover note
List: tables created, seed data inserted, API routes created, how agencies are stored and retrieved, how Douala is protected from deletion, anything Sprint 5 needs to know.
```

---

## Sprint 5 — Homepage & PLP Redesign

**Goal:** Upgrade the homepage with category grid, social links, and correct sections. Improve PLP with full filter system.
**Type:** Refactor + Extend
**Depends on:** Sprint 1 (components), Sprint 2 (categories + conditions)

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
Sprints 1–4 are complete. Check SKILL.md section 15 (Decisions Log) for what was built and decided.

## Your task for this sprint

Redesign the homepage and upgrade the product listing page.

### Homepage — Full Section Spec

Creatively propose a new homepage layout direction. Refine and extend as follows:

**Section 1 — Navigation**
- Logo
- FR/EN language toggle (brand-blue active state)
- WhatsApp CTA button (brand-orange): "Commander / Order"

**Section 2 — Hero (update to a carousel, update content)**
- Pill badges row: "ÉQUIPEMENTS 100% AUTHENTIQUES" · "LIVRAISON AU CAMEROUN"
- FR headline: Propose a new headline
- EN headline: Propose a new headline
- FR subline: "Achetez vos accessoires tech avec paiement à la livraison et assistance WhatsApp."
- EN subline: "Buy your tech accessories with cash on delivery and WhatsApp support."
- CTAs: "Parcourir le catalogue →" + "Commander sur WhatsApp"
- Stats row: "10+ Produits · 2–3j Livraison · 100% Inspection avant paiement"

**Section 3 — Trust Badges (3 cards, light grey bg)**
- 🛡️ Authenticité garantie / Authenticity guaranteed
  FR: "Des marques premium, jamais de contrefaçons."
  EN: "Premium brands, never counterfeits."
- 🚚 Livraison nationale / Nationwide delivery
  FR: "Partout au Cameroun via agences de bus."
  EN: "Anywhere in Cameroon via bus agencies."
- 🛍️ Paiement à la livraison / Pay on delivery
  FR: "Inspectez avant de payer."
  EN: "Inspect before you pay."

**Section 4 — Category Navigation Grid**
5 cards in a grid (2 columns mobile, 5 columns desktop):
- Each card: SVG icon (outline style) + bilingual label
- Clicking navigates to `/produits?category=[slug]` (or EN equivalent)
- Categories: Claviers/Keyboards · Souris/Mice · Câbles/Cables · Enceintes/Speakers · Lampes Solaires/Solar Lamps
- Active/hover: border-brand-blue, icon turns brand-blue

**Section 5 — Featured Products**
- Label: "EN VEDETTE / FEATURED"
- Headline (FR): "Les meilleurs choix pour le travail, la mobilité et le gaming"
- Headline (EN): "The best picks for work, mobility and gaming"
- Products where is_featured = true, max 8, using existing Card component
- "Voir tous les produits / View all products →" link

**Section 6 — How It Works (3 steps)**
- "01 · Choisissez votre équipement" / "01 · Choose your gear"
- "02 · Confirmez en quelques minutes" / "02 · Confirm in minutes"
- "03 · Inspectez avant de payer" / "03 · Inspect before paying"
Keep the existing layout/styling if it works — just ensure bilingual text.

**Section 7 — Brand Statement (keep existing dark card)**
Keep as-is, ensure colors use brand tokens.

**Section 8 — Footer**
- Logo + tagline: "Des accessoires premium pour les professionnels, créateurs et gamers au Cameroun."
- Nav links: Produits / Products · Politique de retour / Return Policy · Conditions
- Social media icons + links (open in new tab):
  - Facebook: https://facebook.com/LovingTech
  - Instagram: https://instagram.com/lovingtechcmr
  - TikTok: https://tiktok.com/@lovingtech.shop
  - WhatsApp: https://wa.me/237655163248
- Copyright: "© 2026 Loving Tech Cameroun. Tous droits réservés."

**Floating WhatsApp button (every page):**
- Bottom-right, fixed position, z-index above all content
- Circle button, bg-brand-orange, white WhatsApp icon
- Links to: https://wa.me/237655163248
- Should NOT cover footer content — add margin-bottom to footer if needed

### PLP Upgrades `/produits` + `/products`

**Filters bar (top of results):**
- Category tabs: Tous/All · Claviers · Souris · Câbles · Enceintes · Lampes
- Condition pills: Toutes/All · Neuf/New · Reconditionné/Refurbished · Occasion/Second-hand
- Brand dropdown (keep existing)
- Stock toggle: "En stock seulement / In stock only" checkbox
- Sort dropdown: Nouveautés/Newest · Prix ↑ · Prix ↓ · Mieux notés/Top rated

**Product cards** (use Card + Badge components):
- Condition badge top-left
- Brand label top-right (grey pill)
- OUT OF STOCK overlay when stock = 0
- Stock limité badge when stock ≤ threshold
- Crossed-out compare_at_price if set
- Star rating + review count (show 0 if no reviews yet)

**Empty state:**
"Aucun produit trouvé. / No products found."
+ links to category tabs

**URL state:**
Filters update URL query params so results are shareable:
`/produits?category=keyboard&condition=new&sort=price_asc`

### End of sprint — write a handover note
List: homepage sections built, footer links added, PLP filter logic, URL param approach, category icon source/format, anything Sprint 6 needs to know.
```

---

## Sprint 6 — Reviews, Promo Codes & Related Products

**Goal:** Build review system, promo code engine, and related products feature.
**Type:** New build
**Depends on:** Sprint 2 (products), Sprint 3 (orders/order refs for review verification)

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
Sprints 1–5 are complete. Check SKILL.md section 15 (Decisions Log) for context.

## Your task for this sprint

Build three Phase 2 features: reviews, promo codes, and related products.

### Feature 1 — Customer Reviews

**Database:**
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
```

**PDP — review section (below warranty):**
- Average star rating (calculated from approved reviews only)
- Total review count: "(12 avis / 12 reviews)"
- Review cards: stars · reviewer name · date · comment
- "Laisser un avis / Leave a review" button → inline form or modal:
  - Référence de commande / Order reference * — validated against orders table
  - Votre nom / Your name *
  - Note / Rating: interactive 1–5 star selector
  - Commentaire / Comment: textarea (optional)
  - Submit → status = pending
  - After submit: "✅ Votre avis est en attente de validation. / Your review is awaiting approval."
- If no approved reviews: "Soyez le premier à laisser un avis! / Be the first to leave a review!"

**Admin reviews panel `/admin/reviews`:**
- Table: Produit · Référence commande · Note · Commentaire · Nom · Date · Statut · Actions
- Actions: Approuver / Rejeter
- Filter: Tous / En attente / Approuvés / Rejetés
- Pending count shown on admin dashboard badge

### Feature 2 — Promo Codes

**Database:**
```sql
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
```

**Validation logic:**
```typescript
// lib/validatePromo.ts
type PromoResult =
  | { valid: true; discount: number; message: string }
  | { valid: false; error: string }

export async function validatePromo(code: string, orderSubtotal: number): Promise<PromoResult> {
  // 1. Find code (case-insensitive)
  // 2. Check is_active
  // 3. Check expires_at (if set)
  // 4. Check uses_count < max_uses (if max_uses set)
  // 5. Check orderSubtotal >= min_order_amount
  // 6. Calculate discount:
  //    - type = 'percent': discount = Math.floor(orderSubtotal * value / 100)
  //    - type = 'fixed': discount = value
  // 7. Cap discount so total never goes below delivery fee
  // Return result
}
```

**Order modal — Step 3 (Summary):**
- Promo code input + "Appliquer / Apply" button
- Success: "✅ Code appliqué — Réduction: -X FCFA"
- Error messages (bilingual):
  - "Code invalide / Invalid code"
  - "Code expiré / Code expired"
  - "Montant minimum non atteint (minimum: X FCFA) / Minimum order not reached (minimum: X FCFA)"
  - "Code épuisé / Code fully used"
- Discount reflected in total
- When order is created: increment uses_count

**Admin promo panel `/admin/promos`:**
- Table: Code · Type · Valeur · Utilisations · Expire · Statut · Actions
- "Créer un code / Create code" button → form:
  - Code * (auto-uppercase on input)
  - Type: Pourcentage (%) ou Montant fixe (FCFA) — radio buttons
  - Valeur * — number
  - Montant minimum — number (optional)
  - Utilisations max — number (optional, blank = unlimited)
  - Date d'expiration — date picker (optional)
  - Actif — toggle (default: on)
- Per-code actions: Edit · Désactiver/Activer · Supprimer

### Feature 3 — Related Products

**Logic (server-side):**
```typescript
// lib/relatedProducts.ts
export async function getRelatedProducts(productId: string, category: string, tags: string[]): Promise<Product[]> {
  // 1. Fetch products with same category, exclude current product, limit 8
  // 2. Score each: +2 for each shared tag
  // 3. Sort by score descending
  // 4. Return top 4
  // 5. If fewer than 4: pad with other in-stock products from same category
}
```

**PDP — related products section (below reviews):**
- Label: "Vous aimerez aussi / You might also like"
- Horizontal scrollable row of product cards (mobile) or 4-column grid (desktop)
- Uses Card + Badge components
- Hidden entirely if no related products found

### Rules
- Reviews: only approved reviews count toward average rating
- Reviews: order_ref validation is a soft check (warn if not found, but don't block)
- Promo: codes are stored uppercase, matched case-insensitively
- Promo: discount cannot reduce order total below delivery fee (minimum = delivery fee)
- Related products: never show out-of-stock products in the related row

### End of sprint — write a handover note
List: tables created, validation logic location, how promo interacts with order creation, related products scoring algorithm, API routes added, anything Sprint 7 needs to know.
```

---

## Sprint 7 — Legal Pages, SEO & Performance

**Goal:** Build Return Policy and T&C pages. Full SEO implementation. Performance optimisation for 3G.
**Type:** New build + optimisation
**Depends on:** All previous sprints (needs correct routes and product data)

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
Sprints 1–6 are complete. Check SKILL.md section 15 (Decisions Log) for context.

## Your task for this sprint

Build legal pages, implement bilingual SEO, and optimise performance for 3G mobile.

### Step 1 — Legal Pages

**Return Policy**
Routes: `/politique-de-retour` (FR) · `/return-policy` (EN)

Display this content (bilingual, formatted cleanly):

Condition | Return Window | Accepted Reasons | Not Accepted
--- | --- | --- | ---
Neuf / New | 7 jours / 7 days from delivery | Defective on arrival, wrong item, damaged packaging | Change of mind, opened and functional
Reconditionné / Refurbished | 5 jours / 5 days | Defective, undisclosed fault, wrong item | Customer-caused physical damage
Occasion / Second-hand | Aucun retour / No returns | N/A — vendu en l'état | All claims

Return process (numbered list):
1. Contact via WhatsApp +237 655 163 248 within the return window
2. Provide: order number + photo or video of the defect
3. Admin reviews within 48 hours
4. If accepted: replacement or store credit valid 90 days
5. If rejected: written explanation via WhatsApp

Void conditions (bullet list):
- After the return window
- Physical damage caused after delivery
- Missing original packaging (New products)
- Second-hand items — no exceptions

**Terms & Conditions**
Routes: `/conditions` (FR) · `/terms` (EN)

10 articles — display with clear numbering and bilingual headings:
1. Général / General — use = acceptance
2. Commandes / Orders — confirmed only by WhatsApp; may be cancelled for stock/fraud
3. Livraison / Delivery — nationwide; 2 000 FCFA Douala, 3 000 FCFA other; free ≥ 50 000 FCFA; customer selects bus agency
4. Paiement / Payment — COD only; exact FCFA at delivery; refusal = potential blacklist
5. Conditions produits / Product conditions — all labelled; second-hand = actual photos + condition report
6. Garantie / Warranty — New: manufacturer; Refurbished: 30 days; Second-hand: none
7. Avis / Reviews — honest + verified; Loving Tech may remove any review
8. Confidentialité / Privacy — data for fulfillment only; never sold; no payment data
9. Responsabilité / Liability — max = order value
10. Contact / Contact — WhatsApp +237 655 163 248; 48h response on business days

**Design:** Same header/footer as rest of site. Clean, readable, max-width prose layout.

**Link in:**
- Footer: "Politique de retour / Return Policy" + "Conditions / Terms"
- Order modal Step 3: "En commandant, vous acceptez nos [Conditions] et notre [Politique de retour]"

### Step 2 — SEO

**Meta tags (Next.js Metadata API):**

Homepage:
```typescript
export const metadata: Metadata = {
  title: 'Loving Tech — Accessoires Tech Premium | Cameroun',
  description: 'Achetez des accessoires tech authentiques (claviers, souris, câbles) livrés partout au Cameroun. Paiement à la livraison. WhatsApp: +237 655 163 248',
  openGraph: {
    title: 'Loving Tech',
    description: '...',
    url: 'https://loving-tech.vercel.app',
    siteName: 'Loving Tech',
  }
}
```

PDP (dynamic, per product):
```typescript
title: `${product.name_fr} — ${product.price_xaf.toLocaleString()} FCFA | Loving Tech`
description: product.description_fr?.slice(0, 155) ?? ''
og:image: product.images[0]
```

**JSON-LD on PDP:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[product name]",
  "image": ["[image url]"],
  "description": "[description_fr]",
  "brand": { "@type": "Brand", "name": "[brand]" },
  "offers": {
    "@type": "Offer",
    "price": "[price_xaf]",
    "priceCurrency": "XAF",
    "availability": "https://schema.org/[InStock|OutOfStock]",
    "seller": { "@type": "Organization", "name": "Loving Tech", "url": "https://loving-tech.vercel.app" }
  }
}
```

**hreflang tags:**
For each product: add `<link rel="alternate" hreflang="fr" href="/produits/[slug-fr]">` and `<link rel="alternate" hreflang="en" href="/products/[slug-en]">`

**Sitemap `/sitemap.xml`:**
Auto-generated including: homepage, /produits, /products, all active product pages (FR + EN), legal pages, category pages

**Robots.txt:**
```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://loving-tech.vercel.app/sitemap.xml
```

### Step 3 — Performance

- All images: use Next.js `<Image>` component (never `<img>`)
- Hero/above-fold images: add `priority` prop
- All other images: lazy load (default Next.js behavior)
- Use `next/font` for font loading with `display: 'swap'`
- Cloudinary: ensure uploaded images are served as WebP
- Remove any unused CSS or JS imports
- Run Lighthouse on homepage (simulated 3G) and report: LCP, CLS, FID scores before and after changes

**Target:** LCP < 3s on simulated 3G mobile

### End of sprint — write a handover note
List: routes created, meta tag implementation approach, sitemap generation method, Lighthouse scores before/after, any performance changes made, anything Sprint 8 needs to know.
```

---

## Sprint 8 — QA, Mobile Polish & Launch

**Goal:** Full QA pass. Mobile experience polish. Brand audit. Launch checklist.
**Type:** QA + Polish
**Depends on:** All previous sprints complete

---

```
You are working on Loving Tech. Read the attached SKILL.md carefully — it is your complete project reference.
All sprints 1–7 are complete. This is the final sprint before launch.

## Your task for this sprint

Complete a full QA pass, polish the mobile experience, and prepare the launch checklist.

### Step 1 — Full QA

Test every flow listed below. Fix every bug you find. Document each fix.

**Customer flows:**
- [ ] Homepage loads correctly (all sections visible, no broken images)
- [ ] Category grid navigates to filtered PLP
- [ ] PLP filters work: category · condition · brand · stock · sort
- [ ] Search returns relevant results; autocomplete works
- [ ] PDP: variant selector updates stock + price
- [ ] PDP: bilingual tabs switch FR/EN content
- [ ] PDP: condition badge, warranty, related products all display
- [ ] Order modal: 3-step flow completes correctly
- [ ] Order modal: city dropdown populates agencies
- [ ] Order modal: custom agency text input works
- [ ] Order modal: promo code validates + applies discount
- [ ] Order modal: free delivery auto-applies when threshold met
- [ ] WhatsApp message is correctly pre-filled with all order details
- [ ] Order status page loads with valid order ref
- [ ] Language toggle: all content switches FR ↔ EN correctly
- [ ] Dark mode: no broken colors or invisible text

**Admin flows:**
- [ ] Login works
- [ ] Add product: all fields save correctly including variants + bilingual
- [ ] Second-hand product: blocks save with < 2 images
- [ ] Product list: condition badge + stock qty + category shown
- [ ] Featured toggle: product appears on homepage
- [ ] Order list: filters work
- [ ] Order detail: status update works + adds to timeline
- [ ] Contact customer button: opens WhatsApp correctly
- [ ] Delivery zone: add city with agencies
- [ ] Delivery zone: disable city → greyed out in order modal
- [ ] Free delivery threshold: changing it reflects in order modal
- [ ] Promo code: create code → test in order modal
- [ ] Reviews: approve a review → appears on PDP
- [ ] Reviews: pending count shows on dashboard

### Step 2 — Mobile Polish (test at 375px — iPhone SE size)

Fix any issues:
- [ ] No horizontal scroll anywhere
- [ ] All touch targets ≥ 44px (buttons, links, toggles)
- [ ] Images size correctly — no overflow, no distortion
- [ ] Order modal is scrollable on small screens
- [ ] Floating WhatsApp button does not cover page content
- [ ] Category grid wraps correctly (2 cols on mobile)
- [ ] Admin panel is usable on mobile (functional, not perfect)
- [ ] Footer links are tappable (not too close together)

### Step 3 — Brand Audit

Check every page:
- [ ] All CTA buttons use #F88810 (brand-orange) or #111111 (brand-dark)
- [ ] All links and focus states use #4494F3 (brand-blue)
- [ ] No purple, no unauthorized gradients, no off-brand colors
- [ ] Condition badges use correct colors (green/blue/orange as specified in SKILL.md)
- [ ] Logo visible in header; favicon uses simplified icon version
- [ ] Tagline "Elevate Your Performance" appears in footer

### Step 4 — Performance Final Check

- [ ] Run Lighthouse on homepage (simulated 3G mobile): target LCP < 3s
- [ ] All product images loading as WebP
- [ ] No render-blocking resources
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] `/robots.txt` disallows `/admin`
- [ ] Admin route returns 401/redirect if not authenticated

### Step 5 — Produce Pre-Launch Checklist

Write a markdown file `PRE_LAUNCH.md` the shop owner can verify before going live:

**Content:**
- [ ] All products have bilingual names + descriptions
- [ ] All products have a condition badge set
- [ ] Second-hand products have ≥ 2 actual photos
- [ ] Featured products selected (at least 4 is_featured = true)
- [ ] All delivery zones configured with fees + agencies
- [ ] Free delivery threshold confirmed: 50 000 FCFA
- [ ] WhatsApp number confirmed: +237 655 163 248

**Legal:**
- [ ] Return policy page live and linked in footer + order modal
- [ ] Terms & conditions page live and linked in footer + order modal

**Technical:**
- [ ] Admin password changed from default
- [ ] HTTPS enabled on production domain
- [ ] Sitemap submitted to Google Search Console
- [ ] Plausible Analytics installed and tracking

**Social:**
- [ ] Facebook link → Loving Tech (correct page)
- [ ] Instagram link → @lovingtechcmr
- [ ] TikTok link → @lovingtech.shop
- [ ] WhatsApp button → wa.me/237655163248

### Final deliverable from agent

After QA and fixes, write a complete final handover note:
- List of every bug found and how it was fixed
- Mobile issues fixed
- Brand audit issues fixed
- Final Lighthouse scores
- Any known limitations or deferred items
- The complete `PRE_LAUNCH.md` file content
```

---

## Sprint Summary

| # | Sprint | Type | Est. Duration |
|---|---|---|---|
| 1 | Design System & Brand Correction | Refactor | 1–2 days |
| 2 | Product Conditions, Variants & Categories | Rebuild + Extend | 2–3 days |
| 3 | Full Order System | Rebuild | 2–3 days |
| 4 | Delivery Zone & Bus Agency System | New build | 1–2 days |
| 5 | Homepage & PLP Redesign | Refactor + Extend | 1–2 days |
| 6 | Reviews, Promo Codes & Related Products | New build | 2–3 days |
| 7 | Legal Pages, SEO & Performance | New build | 1–2 days |
| 8 | QA, Mobile Polish & Launch | QA + Polish | 1–2 days |
| **Total** | | | **11–19 days** |

---

*Loving Tech — Sprint Prompts · April 2026*