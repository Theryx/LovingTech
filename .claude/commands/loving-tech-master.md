# Loving Tech — Master Skill

When this skill is activated, you must strictly follow all brand colors, data models, business rules, and sprint workflows defined below.

At the end of every sprint, write a handover note and update `Decisions.md` (at `.gemini/skills/loving-tech-master/Decisions.md`).

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
  variants:           Variant[]
  stock_qty:          integer       // used when no variants
  low_stock_threshold: integer      // default: 3
  specs:              {key: string, value: string}[]
  warranty_info:      string        // "30 jours / 30 days" | "Garantie fabricant" | "Aucune garantie"
  tags:               string[]
  is_featured:        boolean
  status:             'active' | 'draft' | 'archived'
}

Variant {
  label:    string
  options:  VariantOption[]
}

VariantOption {
  name:        string
  stock_qty:   integer
  price_delta: integer
}
```

**Condition badge colors:**
| Condition | Badge bg | Badge text | Label |
|---|---|---|---|
| new | #D1FAE5 | #065F46 | Neuf / New |
| refurbished | #DBEAFE | #1E3A8A | Reconditionné / Refurbished |
| second_hand | #FEF3C7 | #92400E | Occasion / Second-hand |

**Condition-specific rules:**
- `second_hand` → minimum 2 images required
- `refurbished` → warranty_info defaults to "30 jours / 30 days"
- `new` → warranty_info defaults to "Garantie fabricant / Manufacturer warranty"
- `second_hand` → warranty_info = "Aucune garantie / No warranty"; no returns accepted

---

## 7. Order Data Model

```typescript
Order {
  id:             uuid
  order_ref:      string    // format: LT-YYYYMMDD-XXXX (generated server-side)
  product_id:     uuid
  product_name:   string
  variant_chosen: string
  quantity:       integer
  unit_price:     integer
  total_price:    integer
  customer_name:  string
  customer_phone: string    // WhatsApp number, +237 prefix
  customer_email: string    // optional
  city:           string
  bus_agency:     string
  quartier:       string
  address_details: string
  delivery_fee:   integer
  promo_code:     string
  promo_discount: integer
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'
  admin_notes:    string
  created_at:     timestamp
  updated_at:     timestamp
}
```

**Status pipeline:** `pending → confirmed → dispatched → delivered` (or `cancelled`)

---

## 8. Delivery System

| Zone | Fee | Notes |
|---|---|---|
| Douala | 2 000 FCFA | Own rider / Yango / Glovo |
| All other cities | 3 000 FCFA | Bus/transport agency |
| Order ≥ 50 000 FCFA | FREE | Threshold is admin-configurable |

---

## 9. Shared Components

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

**Order message format:**
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

💰 Sous-total: [unit_price × quantity] FCFA
🚚 Livraison: [delivery_fee] FCFA
[🎟️ Promo ([promo_code]): -[promo_discount] FCFA]
✅ Total: [total_price] FCFA

Merci!
```

---

## 12. Admin Panel Rules

- Route prefix: `/admin`
- Protected by auth (email + password or magic link)
- Mobile-friendly but not mobile-first
- No technical knowledge required to operate
- All delete actions require confirmation dialog

---

## 13. Key Business Rules

1. **No online payment** — Cash on Delivery ONLY
2. **Second-hand photos** — actual item photos are mandatory (minimum 2)
3. **Condition is required** — no product can be saved without a condition selected
4. **Promo discount floor** — promo cannot reduce total below the delivery fee
5. **Order reference** — generated server-side as `LT-YYYYMMDD-XXXX`, never editable
6. **Free delivery** — auto-applied when order subtotal ≥ free_delivery_threshold (default 50 000 FCFA)
7. **Reviews** — only visible after admin approval; must be linked to a valid order reference
8. **Bus agency** — customer selects from admin-configured list OR types custom agency

---

## 14. What This Project Is NOT

- Not a marketplace (single seller only)
- No user accounts (guest checkout only in Phase 1)
- No loyalty/rewards system (Phase 1)
- No SMS notifications (Phase 1)
- No email system until official email address is confirmed
- No flash sales (promo codes only)

---

## 15. Decisions Log

See `.gemini/skills/loving-tech-master/Decisions.md` for the full log of architectural decisions and sprint handovers.

---

## 16. Sprint Prompts

See `.gemini/skills/loving-tech-master/sprint prompts.md` for the detailed tasks for each sprint.
