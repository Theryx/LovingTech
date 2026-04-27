# Loving Tech E2E Handover

Last updated: 2026-04-27

## Purpose

This document tracks what was already tested, what was fixed, and what still needs to be checked during the sprint-by-sprint end-to-end QA process for Loving Tech.

Use this file at the start of the next session together with:
- `SKILL.md`
- `Decisions.md`
- the active sprint prompt

## Agreed E2E Workflow

For each sprint:

1. Run local smoke checks first
   - `npx tsc --noEmit`
   - `npm run build`
2. Test the affected user flows manually
3. Ask the user to verify live browser behavior on production or local
4. Fix defects found during live checks
5. Re-run smoke checks
6. Continue to the next E2E step

## What Has Already Been Done

### Local smoke checks completed

- `npx tsc --noEmit` passed
- `npm run build` passed

### Storefront live checks completed

The following customer-side checks were completed and reported as passing unless noted:

1. Homepage load and language toggle
   - Pass
   - FR/EN toggle works

2. Product listing and product detail page
   - Pass
   - Product cards load
   - Product detail page shows WhatsApp order CTA

3. Order modal basic flow
   - Mostly pass
   - Delivery fee is clearly shown
   - Modal is clear
   - Issue found: Douala was selected by default, but the next field initially behaved like a bus-agency flow instead of the Douala neighbourhood flow

4. Promo code behavior
   - Pass

5. WhatsApp handoff
   - Pass
   - Message opens and is prefilled
   - Issue found: quantity appeared in the final message as `1` even though the user was never asked to choose quantity

## Fixes Already Implemented

### Notifications and confirmation UX

Browser-native `alert()` and `confirm()` usage was removed from the main admin/storefront flows and replaced with app-level notifications and confirmation UI.

Created:
- `src/components/NotificationProvider.tsx`

Integrated into:
- `src/app/layout.tsx`

Wired into:
- `src/app/admin/products/page.tsx`
- `src/app/admin/promos/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/admin/delivery/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/components/LeadModal.tsx`

### Order modal fixes in progress/completed in code

The following changes were made in `src/components/LeadModal.tsx`:

- Added quantity input to the checkout flow
- Changed subtotal to use selected quantity
- Changed order payload to save selected quantity instead of hardcoded `1`
- Changed delivery city logic to normalize city names before matching
- Set initial city state to `Douala` to make the default flow deterministic
- Added quantity to the summary step
- Updated WhatsApp handoff generation to use selected quantity

### Post-fix verification completed

- `npm run build` passed after the modal changes
- `npx tsc --noEmit` passed after the rebuild

## Current Status

The storefront E2E is partially complete.

We finished:
- base storefront smoke checks
- first live customer flow pass
- first round of fixes from that pass

We have not yet completed:
- live retest of the quantity and Douala flow fixes
- admin-side E2E checks

## Immediate Next Step

Resume with a live retest of these 3 items:

1. Open a product and launch the order modal
   - Confirm that when `Douala` is selected by default, the next field immediately shows `Neighbourhood / Quartier`

2. Change city from `Douala` to another city, then back to `Douala`
   - Confirm the field changes from `Bus Agency` back to `Neighbourhood`

3. Set quantity to `2` or `3`
   - Confirm quantity appears in the summary
   - Confirm subtotal updates correctly
   - Confirm WhatsApp message includes the same quantity

## After That

If the 3-item retest passes, continue with admin-side E2E in this order:

1. Admin login
2. Product create/edit validation
3. Delivery zones admin flow
4. Promo code create/apply/delete flow
5. Order detail status update flow
6. Review moderation flow if in scope for the sprint

## Notes for the Next Session

- There is no dedicated automated E2E suite in the repo yet
- For now, the practical QA baseline is:
  - typecheck
  - production build
  - manual live flow checks
- The user is available to run live browser checks and report results step by step

