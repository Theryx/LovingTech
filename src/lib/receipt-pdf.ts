import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Order } from '@/lib/supabase'

const BRAND_COLOR = '#111111'
const ACCENT_COLOR = '#4494F3'
const LIGHT_GRAY = '#666666'
const BORDER_COLOR = '#E0E0E0'

const COMPANY_INFO = {
  name: 'LovingTech SAS',
  rc: 'RC: YAO/2021/B/2244 - Contribuable N° M1121166710104M',
  address: 'Direction Générale : Nkolbisson, Yaoundé',
  bp: 'B.P. 2378',
  email: 'contact@lovingtech.net',
  phone: '+237 655 163 248',
}

export function generateReceiptPdf(order: Order): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const fmt = (n: number) => n.toLocaleString('fr-FR')
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  let y = 16

  // ===== HEADER =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(BRAND_COLOR)
  doc.text('LOVING TECH', margin, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(LIGHT_GRAY)
  doc.text('Reçu de commande / Order Receipt', margin, y)
  y += 5

  // Accent line
  doc.setDrawColor(ACCENT_COLOR)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ===== ORDER INFO =====
  doc.setFontSize(11)
  doc.setTextColor(BRAND_COLOR)
  doc.setFont('helvetica', 'bold')
  doc.text('Détails de la commande', margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  const orderInfoRows: [string, string][] = [
    ['Référence', order.order_ref],
    ['Date', orderDate],
    ['Statut', order.status || 'pending'],
  ]

  for (const [label, value] of orderInfoRows) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(LIGHT_GRAY)
    doc.text(`${label}:`, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(BRAND_COLOR)
    doc.text(value, margin + 30, y)
    y += 5
  }
  y += 4

  // ===== CUSTOMER INFO =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(BRAND_COLOR)
  doc.text('Client', margin, y)
  y += 6

  const customerRows: [string, string][] = [
    ['Nom', order.customer_name],
    ['Téléphone', order.customer_phone],
    ['Ville', order.city],
    ['Quartier', order.quartier],
  ]

  if (order.bus_agency) {
    customerRows.push(['Agence', order.bus_agency])
  }
  if (order.address_details) {
    customerRows.push(['Adresse', order.address_details])
  }

  for (const [label, value] of customerRows) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(LIGHT_GRAY)
    doc.text(`${label}:`, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(BRAND_COLOR)
    doc.text(value, margin + 30, y)
    y += 5
  }
  y += 4

  // ===== PRODUCT TABLE =====
  const subtotal = order.unit_price * order.quantity
  const delivery = order.delivery_fee || 0
  const discount = order.promo_discount || 0

  const productName = order.variant_chosen
    ? `${order.product_name} — ${order.variant_chosen}`
    : order.product_name

  autoTable(doc, {
    startY: y,
    head: [['Produit', 'Qté', 'Prix unitaire', 'Sous-total']],
    body: [
      [
        productName,
        String(order.quantity),
        `${fmt(order.unit_price)} FCFA`,
        `${fmt(subtotal)} FCFA`,
      ],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: BRAND_COLOR,
      cellPadding: { top: 3, right: 5, bottom: 3, left: 5 },
    },
    alternateRowStyles: {
      fillColor: '#F7F7F7',
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 45, halign: 'right' },
      3: { cellWidth: 45, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.1,
    },
  })

  y = (doc as any).lastAutoTable.finalY + 6

  // ===== PRICING SUMMARY =====
  const pricingRows: [string, string, boolean?][] = [
    ['Sous-total', `${fmt(subtotal)} FCFA`],
    [
      'Livraison',
      delivery === 0 ? 'GRATUITE' : `${fmt(delivery)} FCFA`,
    ],
  ]

  if (discount > 0 && order.promo_code) {
    pricingRows.push([
      `Promo (${order.promo_code})`,
      `-${fmt(discount)} FCFA`,
    ])
  }

  pricingRows.push(['TOTAL', `${fmt(order.total_price)} FCFA`, true])

  // Right-aligned pricing block
  const priceX = pageW - margin - 70

  for (const [label, value, isBold] of pricingRows) {
    if (isBold) {
      // Divider line
      doc.setDrawColor(BORDER_COLOR)
      doc.setLineWidth(0.2)
      doc.line(priceX, y - 2, pageW - margin, y - 2)
    }

    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setFontSize(isBold ? 11 : 9)
    doc.setTextColor(LIGHT_GRAY)
    doc.text(label, priceX, y)
    doc.setTextColor(BRAND_COLOR)
    doc.text(value, pageW - margin, y, { align: 'right' })
    y += 5
  }

  // ===== FOOTER =====
  const footerY = doc.internal.pageSize.getHeight() - 38

  doc.setDrawColor(BORDER_COLOR)
  doc.setLineWidth(0.2)
  doc.line(margin, footerY, pageW - margin, footerY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND_COLOR)
  doc.text(COMPANY_INFO.name, margin, footerY + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(LIGHT_GRAY)

  const footerLines = [
    COMPANY_INFO.rc,
    COMPANY_INFO.address,
    COMPANY_INFO.bp,
    `${COMPANY_INFO.email}  •  ${COMPANY_INFO.phone}`,
  ]

  for (let i = 0; i < footerLines.length; i++) {
    doc.text(footerLines[i], margin, footerY + 10 + i * 3.5)
  }

  // Right side footer: "Merci pour votre commande"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(ACCENT_COLOR)
  doc.text('Merci pour votre confiance !', pageW - margin, footerY + 8, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(LIGHT_GRAY)
  doc.text('Loving Tech — Accessoires Tech Premium au Cameroun', pageW - margin, footerY + 12, {
    align: 'right',
  })

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
