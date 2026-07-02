import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// PATCH - technician responds to quotation with price
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await req.json()
    const { price, technicianNote, validUntil, status } = body

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { technician: true },
    })
    if (!quotation) return NextResponse.json({ success: false, message: 'ไม่พบใบเสนอราคา' }, { status: 404 })
    if (quotation.technician.userId !== auth.user.userId) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const data: Record<string, unknown> = {}
    if (status) data.status = status
    if (price !== undefined) data.price = price
    if (technicianNote) data.technicianNote = technicianNote
    if (validUntil) data.validUntil = new Date(validUntil)

    const updated = await prisma.quotation.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        package: { select: { id: true, title: true, price: true } },
      },
    })

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: quotation.customerId,
        type: 'quotation_updated',
        title: status === 'accepted' ? 'ใบเสนอราคาได้รับการตอบกลับแล้ว!' : 'ใบเสนอราคาถูกปรับปรุง',
        body: status === 'accepted'
          ? `ช่างเสนอราคา ฿${Number(price).toLocaleString()}`
          : 'ช่างได้ตอบกลับใบเสนอราคาของคุณแล้ว',
        data: { quotationId: id },
      },
    })

    return NextResponse.json({ success: true, quotation: updated })
  } catch (error) {
    console.error('Quotation PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
