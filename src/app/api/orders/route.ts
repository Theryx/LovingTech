import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/api-auth'

const createOrderSchema = z.object({
  order_ref: z.string().min(1),
  product_id: z.string().uuid().optional(),
  product_name: z.string().min(1),
  variant_chosen: z.string().optional(),
  quantity: z.number().int().min(1).max(99),
  unit_price: z.number().int().min(0),
  total_price: z.number().int().min(0),
  customer_name: z.string().min(2).max(200),
  customer_phone: z.string().min(8).max(20),
  customer_email: z.string().email().optional().or(z.literal('')),
  city: z.string().min(1).max(100),
  bus_agency: z.string().optional().nullable(),
  quartier: z.string().min(2).max(200),
  address_details: z.string().optional().nullable(),
  delivery_fee: z.number().int().min(0),
  promo_code: z.string().optional().nullable(),
  promo_discount: z.number().int().min(0).optional().nullable(),
  status: z
    .enum(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'])
    .optional()
    .default('pending'),
  status_history: z
    .array(
      z.object({
        status: z.string(),
        at: z.string(),
        note: z.string().optional(),
      })
    )
    .optional(),
})

function buildEmailHtml(order: Record<string, any>): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR')
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
  ].filter(Boolean) as [string, any][]

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #f0f0f0">${label}</td>
        <td style="padding:8px 12px;color:#111;border-bottom:1px solid #f0f0f0">${value}</td>
      </tr>`
    )
    .join('')

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
</html>`
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orders = data || []
  const today = new Date().toISOString().slice(0, 10)
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today))
  const stats = {
    todayCount: todayOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + (o.total_price || 0), 0),
    pendingCount: orders.filter(o => o.status === 'pending').length,
  }

  return NextResponse.json({ orders, stats })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createOrderSchema.parse(body)

    const { data: order, error } = await supabase.from('orders').insert([parsed]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Increment promo code usage server-side
    if (parsed.promo_code) {
      try {
        const { data: promoData } = await supabase
          .from('promo_codes')
          .select('uses_count')
          .ilike('code', parsed.promo_code)
          .single()
        if (promoData) {
          await supabase
            .from('promo_codes')
            .update({ uses_count: (promoData.uses_count || 0) + 1 })
            .ilike('code', parsed.promo_code!)
        }
      } catch {
        // Non-critical — ignore promo increment failures
      }
    }

    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_APP_PASSWORD
    const emailTo = process.env.EMAIL_NOTIFY || 'ndouken@gmail.com'

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass },
      })

      transporter
        .sendMail({
          from: `"Loving Tech" <${emailUser}>`,
          to: emailTo,
          subject: `Nouvelle commande — ${order.order_ref}`,
          html: buildEmailHtml(order),
        })
        .catch((err: Error) => {
          console.error('Email send failed:', err.message)
        })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
