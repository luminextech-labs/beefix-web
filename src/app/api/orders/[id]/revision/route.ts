import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// POST - create a revision request
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })

    // Only customer or assigned technician can request
    const isCustomer = order.customerId === auth.user.userId
    const isTech = order.technicianId === auth.user.userId
    if (!isCustomer && !isTech) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    // Cannot revise if order is completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json({ success: false, message: 'ไม่สามารถแก้ไขงานที่เสร็จแล้วหรือถูกยกเลิกแล้ว' }, { status: 400 })
    }

    const body = await req.json()
    const { title, description, jobDate, jobTime, laborCost, travelCost, materialCost } = body

    const revision = await prisma.orderRevision.create({
      data: {
        orderId: id,
        requestedBy: auth.user.userId,
        title: title ?? null,
        description: description ?? null,
        jobDate: jobDate ? new Date(jobDate) : null,
        jobTime: jobTime ?? null,
        laborCost: laborCost != null ? laborCost : null,
        travelCost: travelCost != null ? travelCost : null,
        materialCost: materialCost != null ? materialCost : null,
      },
    })

    return NextResponse.json({ success: true, revision }, { status: 201 })
  } catch (error) {
    console.error('Revision POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// GET - list revisions for an order
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const revisions = await prisma.orderRevision.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, revisions })
  } catch (error) {
    console.error('Revision GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
