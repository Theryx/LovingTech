import { supabase } from './supabase';

type PromoResult =
  | { valid: true; discount: number; message: string }
  | { valid: false; error: string };

export async function validatePromo(code: string, orderSubtotal: number, deliveryFee: number): Promise<PromoResult> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .ilike('code', code)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Code invalide / Invalid code' };
  }

  if (!data.is_active) {
    return { valid: false, error: 'Code invalide / Invalid code' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'Code expiré / Code expired' };
  }

  if (data.max_uses !== null && data.uses_count >= data.max_uses) {
    return { valid: false, error: 'Code épuisé / Code fully used' };
  }

  if (orderSubtotal < data.min_order_amount) {
    return {
      valid: false,
      error: `Montant minimum non atteint (minimum: ${data.min_order_amount.toLocaleString('fr-FR')} FCFA) / Minimum order not reached (minimum: ${data.min_order_amount.toLocaleString('fr-FR')} FCFA)`,
    };
  }

  let discount = data.type === 'percent'
    ? Math.floor(orderSubtotal * data.value / 100)
    : data.value;

  // Discount cannot reduce total below delivery fee
  const maxDiscount = orderSubtotal - deliveryFee;
  if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);
  else discount = 0;

  return {
    valid: true,
    discount,
    message: `✅ Code appliqué — Réduction: -${discount.toLocaleString('fr-FR')} FCFA`,
  };
}
