import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'
import { generateReceiptPdf } from '@/lib/receipt-pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id

  const { data: order, error } = await getSupabaseServer()
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  try {
    const pdfBuffer = generateReceiptPdf(order)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${order.order_ref}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (err: any) {
    console.error('PDF generation failed:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
