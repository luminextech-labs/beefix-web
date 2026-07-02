import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET - list quotations
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role') || auth.user.role

    const where: Record<string, unknown> = {}
    if (role === 'technician') {
      const tech = await prisma.technician.findUnique({ where: { userId: auth.user.userId } })
      if (!tech) return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์' }, { status: 404 })
      where.technicianId = tech.id
    } else {
      where.customerId = auth.user.userId
    }
    if (status) where.status = status

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        customer: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        technician: { include: { user: { select: { fullName: true } } } },
        package: { select: { id: true, title: true, price: true } },
        order: { select: { id: true, orderNo: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, quotations })
  } catch (error) {
    console.error('Quotations GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - create quotation request (customer requests quote from technician's package)
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { technicianId, packageId, title, description, customerNote } = body

    if (!technicianId || !title) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ครบ' }, { status: 400 })
    }

    // Verify technician exists
    const tech = await prisma.technician.findUnique({ where: { id: technicianId } })
    if (!tech) return NextResponse.json({ success: false, message: 'ไม่พบช่าง' }, { status: 404 })

    const quotation = await prisma.quotation.create({
      data: {
        technicianId,
        customerId: auth.user.userId,
        packageId,
        title,
        description,
        customerNote,
        price: 0, // ช่างจะเสนอราคาภายหลัง
      },
    })

    // Notify technician
    await prisma.notification.create({
      data: {
        userId: tech.userId,
        type: 'quotation_received',
        title: 'ได้รับคำขอเสนอราคาใหม่!',
        body: `ลูกค้าต้องการขอใบเสนอราคา: ${title}`,
        data: { quotationId: quotation.id },
      },
    })

    return NextResponse.json({ success: true, quotation }, { status: 201 })
  } catch (error) {
    console.error('Quotations POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
