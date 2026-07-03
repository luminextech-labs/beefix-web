import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// POST - open a dispute
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })

    const isCustomer = order.customerId === auth.user.userId
    const isTech = order.technicianId === auth.user.userId
    if (!isCustomer && !isTech) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    // Check no open dispute exists
    const existing = await prisma.dispute.findFirst({
      where: { orderId: id, status: 'open' },
    })
    if (existing) {
      return NextResponse.json({ success: false, message: 'มีข้อพิพาทที่เปิดอยู่แล้ว' }, { status: 400 })
    }

    const body = await req.json()
    const { reason, description } = body
    if (!reason?.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุเหตุผล' }, { status: 400 })
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: id,
        openedBy: auth.user.userId,
        reason: reason.trim(),
        description: description?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, dispute }, { status: 201 })
  } catch (error) {
    console.error('Dispute POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// GET - get dispute for an order
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const dispute = await prisma.dispute.findFirst({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, dispute })
  } catch (error) {
    console.error('Dispute GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
