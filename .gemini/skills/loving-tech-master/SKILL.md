---
name: loving-tech-master
description: Master skill for the Loving Tech project, covering brand rules, data models, business logic, and sprint workflows.
---

# Loving Tech — Agent Skill File
> Give this file to the agent at the start of every sprint.
> It tells the agent everything it needs to know about the project to work consistently.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project name | Loving Tech |
| Type | Bilingual e-commerce platform (FR/EN) |
| Market | Cameroon — online only, nationwide delivery |
| Live URL | https://loving-tech.vercel.app/ |
| WhatsApp | +237 655 163 248 |
| Facebook | Loving Tech |
| Instagram | @lovingtechcmr |
| TikTok | @lovingtech.shop |
| Tagline | *Elevate Your Performance* |

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (React) — App Router |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Supabase |
| Image CDN | Cloudinary (auto WebP, lazy resize) |
| Hosting | Vercel |
| Search | Algolia or MeiliSearch |
| Analytics | Plausible Analytics |
| Email | None in Phase 1 — WhatsApp only |
| Payment | NONE — Cash on Delivery only, no gateway |

---

## 3. Brand Colors

These are the ONLY colors used in this project. Do not introduce others.

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Blue (primary) | `#4494F3` | `brand-blue` | Nav, links, focus states, trust elements |
| Orange (accent) | `#F88810` | `brand-orange` | CTA buttons, sale badges, low-stock alerts |
| Grey (neutral) | `#D2D1D1` | `brand-grey` | Card borders, dividers, placeholders, neutral bg |
| Dark | `#111111` | `brand-dark` | Hero backgrounds, primary text |
| White | `#FFFFFF` | white | Page backgrounds, card fills |

**Rules:**
- Blue is dominant — used for primary UI elements
- Orange is sparingly used — only for actions and alerts that need immediate attention
- Never use purple, random greens, or any color not in this palette

**Tailwind config (already set up in Sprint 1):**
```js
// tailwind.config.js
colors: {
  brand: {
    blue:   '#4494F3',
    orange: '#F88810',
    grey:   '#D2D1D1',
    dark:   '#111111',
  }
}
```

---

## 4. Typography & Tone

- **Display/Hero:** Bold, heavy-weight — confidence and impact
- **Body:** Clean, simple, readable
- **Tone:** Simple · Confident · Modern · Direct
- Avoid: jargon, long sentences, generic marketing phrases

**Good copy examples:**
- "Upgrade your setup" / "Optimisez votre setup"
- "Work smarter" / "Travaillez mieux"
- "Clean tech. Better focus." / "Tech propre. Focus total."

---

## 5. Language System

- **Default language:** French
- **Second language:** English (toggled by user)
- All UI text must be bilingual
- All product content is entered in both languages by the admin (name_fr / name_en / description_fr / description_en)
- Language preference persists across pages (stored in localStorage or cookie)
- URL slugs are bilingual: `/produits/[slug-fr]` (FR) + `/products/[slug-en]` (EN)

---

## 6. Product Data Model

```typescript
Product {
  id:                 uuid
  name_fr:            string        // required
  name_en:            string        // required
  description_fr:     string (rich) // optional
  description_en:     string (rich) // optional
  category:           'keyboard' | 'mouse' | 'cable' | 'speaker' | 'solar_lamp'
  condition:          'new' | 'refurbished' | 'second_hand'  // REQUIRED
  brand:              string
  price_xaf:          integer       // in FCFA
  compare_at_price:   integer       // optional — shows crossed-out price
  sku:                string
  images:             string[]      // up to 8 URLs; actual photos REQUIRED for second_hand
  variants:           Variant[]     // see below
  stock_qty:          integer       // used when no variants
  low_stock_threshold: integer      // default: 3
  specs:              {key: string, value: string}[]  // dynamic key-value pairs
  warranty_info:      string        // "30 jours / 30 days" | "Garantie fabricant" | "Aucune garantie"
  tags:               string[]      // for search + related products
  is_featured:        boolean
  status:             'active' | 'draft' | 'archived'
}

Variant {
  label:    string           // e.g. "Couleur / Color"
  options:  VariantOption[]
}

VariantOption {
  name:        string   // e.g. "Noir / Black"
  stock_qty:   integer
  price_delta: integer  // added to base price (can be 0)
}
```

**Condition badge colors:**
| Condition | Badge bg | Badge text | Label |
|---|---|---|---|
| new | #D1FAE5 | #065F46 | Neuf / New |
| refurbished | #DBEAFE | #1E3A8A | Reconditionné / Refurbished |
| second_hand | #FEF3C7 | #92400E | Occasion / Second-hand |

**Condition-specific rules:**
- `second_hand` → minimum 2 images required (enforce in admin)
- `refurbished` → warranty_info defaults to "30 jours / 30 days"
- `new` → warranty_info defaults to "Garantie fabricant / Manufacturer warranty"
- `second_hand` → warranty_info = "Aucune garantie / No warranty"; no returns accepted

---

## 7. Order Data Model

```typescript
Order {
  id:             uuid
  order_ref:      string    // format: LT-YYYYMMDD-XXXX (generated server-side)

  // Product
  product_id:     uuid
  product_name:   string
  variant_chosen: string    // e.g. "Couleur: Noir"
  quantity:       integer
  unit_price:     integer   // FCFA
  total_price:    integer   // FCFA (after promo discount)

  // Customer
  customer_name:  string
  customer_phone: string    // WhatsApp number, +237 prefix
  customer_email: string    // optional

  // Delivery
  city:           string
  bus_agency:     string    // selected from list OR typed by customer
  quartier:       string
  address_details: string
  delivery_fee:   integer   // FCFA (0 if free delivery applies)

  // Promo
  promo_code:     string
  promo_discount: integer   // FCFA

  // Status
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'

  // Admin
  admin_notes:    string
  created_at:     timestamp
  updated_at:     timestamp
}
```

**Status pipeline:**
```
pending → confirmed → dispatched → delivered
                                 ↘ cancelled
```

---

## 8. Delivery System

**Rules:**
- Delivery is possible to any city reachable by a bus/transport agency
- No fixed list of partner agencies — admin configures known agencies per city
- Customer selects from admin-configured agencies OR types their own preferred agency
- Cities with no coverage are marked unavailable by admin — greyed out at checkout

**Fees:**
| Zone | Fee | Notes |
|---|---|---|
| Douala | 2 000 FCFA | Own rider / Yango / Glovo |
| All other cities | 3 000 FCFA | Bus/transport agency |
| Order ≥ 50 000 FCFA | FREE | Threshold is admin-configurable |
| Unavailable city | N/A | Cannot place order |

```typescript
DeliveryZone {
  id:              uuid
  city_name_fr:    string
  city_name_en:    string
  delivery_fee:    integer      // FCFA
  estimated_days:  string       // e.g. "2–3 jours / 2–3 days"
  is_available:    boolean
  agencies:        {name: string}[]  // known agencies for this city
}

DeliverySettings {
  free_delivery_threshold: integer  // default: 50000 FCFA
}
```

---

## 9. Shared Components (built in Sprint 1)

All components live in `/components/ui/`. Use these — do not create alternatives.

| Component | File | Variants |
|---|---|---|
| Button | `Button.tsx` | primary (orange) · secondary (blue border) · whatsapp (dark) |
| Badge | `Badge.tsx` | new · refurbished · second_hand · out_of_stock · low_stock |
| Card | `Card.tsx` | product card shell |
| Input | `Input.tsx` | standard text input |
| LanguageToggle | `LanguageToggle.tsx` | FR/EN |

---

## 10. URL Structure

| Page | FR URL | EN URL |
|---|---|---|
| Homepage | `/` | `/` |
| All products | `/produits` | `/products` |
| Category page | `/produits/[category-fr]` | `/products/[category-en]` |
| Product detail | `/produits/[slug-fr]` | `/products/[slug-en]` |
| Order status | `/suivi/[order-ref]` | `/track/[order-ref]` |
| Return policy | `/politique-de-retour` | `/return-policy` |
| Terms | `/conditions` | `/terms` |
| Admin dashboard | `/admin` | — |
| Admin orders | `/admin/orders` | — |
| Admin products | `/admin/products` | — |
| Admin delivery | `/admin/delivery` | — |
| Admin promos | `/admin/promos` | — |
| Admin reviews | `/admin/reviews` | — |

---

## 11. WhatsApp Integration

- **Business number:** +237 655 163 248
- **Floating button:** always visible, bottom-right, links to `wa.me/237655163248`
- **Order CTA:** "Commander via WhatsApp" on every PDP — opens modal
- **Order message format:**

```
Bonjour Loving Tech! 👋

🛍️ Nouvelle commande — [order_ref]
Produit: [product_name] ([variant_chosen])
Quantité: [quantity]

👤 Client: [customer_name]
📱 WhatsApp: [customer_phone]

📦 Livraison:
Ville: [city]
Agence: [bus_agency]
Quartier: [quartier]
[address_details if provided]
[delivery instructions if provided]

💰 Sous-total: [unit_price × quantity] FCFA
🚚 Livraison: [delivery_fee] FCFA
[🎟️ Promo ([promo_code]): -[promo_discount] FCFA]
✅ Total: [total_price] FCFA

Merci!
```

- **Admin contact button:** In order detail, opens `wa.me/[customer_phone]?text=Bonjour [customer_name], concernant votre commande [order_ref]...`

---

## 12. Admin Panel Rules

- Route prefix: `/admin`
- Protected by auth (email + password or magic link)
- Mobile-friendly but not mobile-first (admin usually on desktop)
- No technical knowledge required to operate
- Language: mirrors the global FR/EN toggle
- All delete actions require confirmation dialog

---

## 13. Key Business Rules

1. **No online payment** — Cash on Delivery ONLY, no gateway, no credit card fields, no Mobile Money
2. **Second-hand photos** — actual item photos are mandatory (minimum 2), not stock photos
3. **Condition is required** — no product can be saved without a condition selected
4. **Promo discount floor** — promo cannot reduce total below the delivery fee
5. **Order reference** — generated server-side in format `LT-YYYYMMDD-XXXX`, never editable
6. **Free delivery** — auto-applied when order subtotal ≥ free_delivery_threshold (default 50 000 FCFA)
7. **Reviews** — only visible after admin approval; must be linked to a valid order reference
8. **Bus agency** — customer selects from admin-configured list OR types custom agency; both are recorded on the order

---

## 14. What This Project Is NOT

- Not a marketplace (single seller only)
- Not a repair shop
- Not a "cheap gadgets" store
- No user accounts (guest checkout only in Phase 1)
- No loyalty/rewards system (Phase 1)
- No SMS notifications (Phase 1)
- No email system until official email address is confirmed
- No flash sales (too complex to manage solo — promo codes only)

---

## 15. Decisions Log

> This section is updated after each sprint. The agent writes a handover note at the end of every sprint. It paste it here before starting the next one.

See `Decisions.md` in the same directory for the full log of architectural decisions and sprint handovers.

---

## 16. Sprint Prompts

See `sprint prompts.md` in the same directory for the detailed tasks for each sprint.

---

> **How to use this skill:**
> When activated, the agent must strictly follow all brand colors, data models, and business rules defined here.
> At the end of every sprint, the agent MUST write a handover note and update `Decisions.md`.
