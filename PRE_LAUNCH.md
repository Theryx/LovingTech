# Loving Tech — Pre-Launch Checklist

Complete every item before going live.

---

## Content

- [ ] All products have bilingual names (name_fr + name_en)
- [ ] All products have bilingual descriptions (description_fr + description_en)
- [ ] All products have a condition set (Neuf / Reconditionné / Occasion)
- [ ] Second-hand products have ≥ 2 actual photos of the real item
- [ ] At least 4 products have `is_featured = true` (appear on homepage)
- [ ] All product prices are in FCFA and correct
- [ ] All product stock statuses are accurate (in_stock / out_of_stock / pre_order)

---

## Delivery Zones (`/admin/delivery`)

- [ ] Douala is configured: fee = 2 000 FCFA, delivery = same day / next day
- [ ] All other active cities are configured with correct fees and delays
- [ ] Bus agencies added for each city (customers will see dropdown)
- [ ] Free delivery threshold confirmed: **50 000 FCFA**
- [ ] Unavailable cities are toggled off

---

## Legal

- [ ] Return policy page live at `/return-policy` and `/politique-de-retour`
- [ ] Terms & conditions page live at `/terms` and `/conditions`
- [ ] Both pages linked in footer ✅ (done)
- [ ] Both pages linked in order modal Step 3 ✅ (done)

---

## Technical

- [ ] **Change admin password** — update `ADMIN_PASSWORD` in Vercel environment variables (default: `LovingTech2026!`)
- [ ] `ADMIN_PASSWORD` env variable set in Vercel dashboard (Settings → Environment Variables)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel ✅
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel ✅
- [ ] HTTPS enabled on production domain ✅ (Vercel handles this)
- [ ] Sitemap accessible at `https://loving-tech.vercel.app/sitemap.xml`
- [ ] `/robots.txt` disallows `/admin` ✅ (done)
- [ ] Run Supabase SQL migrations for all new tables:
  - `delivery_zones` + `delivery_settings`
  - `orders`
  - `reviews`
  - `promo_codes`
  - All tables have `DISABLE ROW LEVEL SECURITY`

---

## WhatsApp & Social

- [ ] WhatsApp button links to `wa.me/237655163248` ✅
- [ ] Facebook link → `https://facebook.com/LovingTech`
- [ ] Instagram link → `https://instagram.com/lovingtechcmr`
- [ ] TikTok link → `https://tiktok.com/@lovingtech.shop`
- [ ] Test WhatsApp order message: place a test order and verify the message format is correct

---

## SEO & Analytics

- [ ] Submit sitemap to Google Search Console: `https://loving-tech.vercel.app/sitemap.xml`
- [ ] Install Plausible Analytics (add script to `src/app/layout.tsx`)
- [ ] Verify OG image appears correctly when sharing a product link on WhatsApp/Facebook

---

## Final Tests

- [ ] Place a complete test order end-to-end (modal → WhatsApp message)
- [ ] Check homepage on mobile (iPhone SE, 375px width)
- [ ] Check product page on mobile
- [ ] Verify admin login works at `/admin/login`
- [ ] Verify `/admin` redirects to login when not authenticated
- [ ] Approve a test review — confirm it appears on product page
- [ ] Create a promo code — test it in the order modal
- [ ] Check all footer links open correctly

---

*Loving Tech — Pre-Launch Checklist · April 2026*
