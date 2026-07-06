import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import prisma from '@/lib/prisma'

// POST /api/quotations - Customer creates a quotation request
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const { technicianId, serviceId, title, description, preferredDate, preferredTime, addressText } = await req.json()

    if (!technicianId || !title?.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    // Get technician info
    const technician = await prisma.technician.findUnique({
      where: { id: technicianId },
      include: { user: { select: { fullName: true } } },
    })
    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบช่าง' }, { status: 404 })
    }

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        customerId: payload.userId,
        technicianId,
        title: title.trim(),
        description: description?.trim() || null,
        price: 0,
        customerNote: [
          preferredDate ? `📅 วันที่ต้องการ: ${preferredDate}` : null,
          preferredTime ? `🕐 เวลา: ${preferredTime}` : null,
          addressText ? `📍 สถานที่: ${addressText}` : null,
        ].filter(Boolean).join('\n') || null,
      },
    })

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: technician.userId,
        type: 'quotation_received',
        title: '📋 มีคำขอใบเสนอราคาใหม่!',
        body: `ลูกค้า ${payload.fullName || 'ลูกค้า'} ต้องการใบเสนอราคาสำหรับ: ${title}`,
        data: { quotationId: quotation.id, technicianId },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอใบเสนอราคาเรียบร้อยแล้ว ✅',
      quotationId: quotation.id,
    })
  } catch (error) {
    console.error('Quotation create error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// GET /api/quotations - Get customer's quotations
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }

    const quotations = await prisma.quotation.findMany({
      where: { customerId: payload.userId },
      include: {
        technician: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, quotations })
  } catch (error) {
    console.error('Quotation get error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
