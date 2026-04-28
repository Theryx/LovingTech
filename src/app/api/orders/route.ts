import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function buildEmailHtml(order: Record<string, any>): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR');
  const rows = [
    ['Référence', order.order_ref],
    ['Produit', order.product_name + (order.variant_chosen ? ` — ${order.variant_chosen}` : '')],
    ['Quantité', order.quantity],
    ['Client', order.customer_name],
    ['WhatsApp', order.customer_phone],
    ['Ville', order.city],
    order.bus_agency ? ['Agence', order.bus_agency] : null,
    ['Quartier', order.quartier],
    order.address_details ? ['Détails adresse', order.address_details] : null,
    ['Sous-total', `${fmt(order.unit_price * order.quantity)} FCFA`],
    ['Livraison', order.delivery_fee === 0 ? 'GRATUITE' : `${fmt(order.delivery_fee)} FCFA`],
    order.promo_code ? ['Promo', `${order.promo_code} — -${fmt(order.promo_discount)} FCFA`] : null,
    ['TOTAL', `${fmt(order.total_price)} FCFA`],
  ].filter(Boolean) as [string, any][];

  const tableRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #f0f0f0">${label}</td>
        <td style="padding:8px 12px;color:#111;border-bottom:1px solid #f0f0f0">${value}</td>
      </tr>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif">
  <div style="max-width:540px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#111;padding:24px 28px">
      <p style="margin:0;font-size:11px;letter-spacing:.15em;color:#aaa;text-transform:uppercase">Nouvelle commande</p>
      <h1 style="margin:4px 0 0;font-size:22px;color:#fff">${order.order_ref}</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:0">
      ${tableRows}
    </table>
    <div style="padding:20px 28px;background:#f9f9f9;border-top:1px solid #eee">
      <a href="https://loving-tech.vercel.app/admin/orders"
         style="display:inline-block;background:#4494F3;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">
        Voir dans l'admin →
      </a>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Persist order in Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email notification via Resend (non-blocking)
    const resendKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.EMAIL_NOTIFY || 'ndouken@gmail.com';

    if (resendKey) {
      const resend = new Resend(resendKey);
      resend.emails.send({
        from: 'Loving Tech <onboarding@resend.dev>',
        to: emailTo,
        subject: `🛍️ Nouvelle commande — ${order.order_ref}`,
        html: buildEmailHtml(order),
      }).catch((err: Error) => {
        console.error('Email send failed:', err.message);
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
