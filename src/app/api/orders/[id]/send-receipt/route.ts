import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'
import { generateReceiptPdf } from '@/lib/receipt-pdf'

const sendReceiptSchema = z.object({
  email: z.string().email('Invalid email address'),
})

function buildCustomerEmailHtml(order: Record<string, any>): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR')
  const productLine = order.variant_chosen
    ? `${order.product_name} — ${order.variant_chosen}`
    : order.product_name
  const subtotal = order.unit_price * order.quantity
  const delivery = order.delivery_fee || 0
  const discount = order.promo_discount || 0

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif">
  <div style="max-width:540px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#111;padding:24px 28px">
      <p style="margin:0;font-size:11px;letter-spacing:.15em;color:#aaa;text-transform:uppercase">Confirmation de commande</p>
      <h1 style="margin:4px 0 0;font-size:22px;color:#fff">${order.order_ref}</h1>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;font-size:15px;color:#111;line-height:1.5">
        Bonjour <strong>${order.customer_name}</strong>,<br><br>
        Merci pour votre commande ! Voici le récapitulatif :
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px">
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#555;font-size:13px;width:120px">Produit</td>
          <td style="padding:6px 0;font-size:13px;color:#111">${productLine}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#555;font-size:13px">Quantité</td>
          <td style="padding:6px 0;font-size:13px;color:#111">${order.quantity}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#555;font-size:13px">Prix unitaire</td>
          <td style="padding:6px 0;font-size:13px;color:#111">${fmt(order.unit_price)} FCFA</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#555;font-size:13px">Sous-total</td>
          <td style="padding:6px 0;font-size:13px;color:#111">${fmt(subtotal)} FCFA</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#555;font-size:13px">Livraison</td>
          <td style="padding:6px 0;font-size:13px;color:#111">${delivery === 0 ? 'GRATUITE' : `${fmt(delivery)} FCFA`}</td>
        </tr>
        ${order.promo_code ? `
        <tr>
          <td style="padding:6px 0;font-weight:600;color:#555;font-size:13px">Promo (${order.promo_code})</td>
          <td style="padding:6px 0;font-size:13px;color:#16a34a">−${fmt(discount)} FCFA</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:8px 0;font-weight:700;color:#111;font-size:14px;border-top:1px solid #eee">TOTAL</td>
          <td style="padding:8px 0;font-weight:700;color:#111;font-size:14px;border-top:1px solid #eee">${fmt(order.total_price)} FCFA</td>
        </tr>
      </table>
      <div style="padding:16px;background:#f9f9f9;border-radius:8px;margin-bottom:16px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:.05em">Livraison</p>
        <p style="margin:0;font-size:13px;color:#111"><strong>Ville :</strong> ${order.city}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#111"><strong>Quartier :</strong> ${order.quartier}</p>
        ${order.bus_agency ? `<p style="margin:4px 0 0;font-size:13px;color:#111"><strong>Agence :</strong> ${order.bus_agency}</p>` : ''}
      </div>
      <p style="margin:16px 0 0;font-size:13px;color:#555;line-height:1.5">
        Votre reçu est joint en pièce jointe (PDF). Pour toute question, contactez-nous sur WhatsApp au <strong>+237 655 163 248</strong> ou par email à <strong>contact@lovingtech.net</strong>.
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#999">
        — L'équipe Loving Tech
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id

  let body: { email: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = sendReceiptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { data: order, error } = await getSupabaseServer()
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_APP_PASSWORD

  if (!emailUser || !emailPass) {
    return NextResponse.json(
      { error: 'Email not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD.' },
      { status: 500 }
    )
  }

  try {
    const pdfBuffer = generateReceiptPdf(order)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    })

    await transporter.sendMail({
      from: `"Loving Tech" <${emailUser}>`,
      to: parsed.data.email,
      subject: `Confirmation de commande — ${order.order_ref}`,
      html: buildCustomerEmailHtml(order),
      attachments: [
        {
          filename: `recu-${order.order_ref}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Failed to send receipt:', err.message)
    return NextResponse.json(
      { error: 'Failed to send receipt email' },
      { status: 500 }
    )
  }
}
