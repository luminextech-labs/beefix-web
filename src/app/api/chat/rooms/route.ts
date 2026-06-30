import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET /api/chat/rooms - List chat rooms for current user
export async function GET(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { userId, role } = auth.user

    const rooms = await prisma.chatRoom.findMany({
      where: role === 'technician'
        ? { technicianId: userId }
        : { customerId: userId },
      include: {
        order: {
          select: {
            id: true,
            orderNo: true,
            title: true,
            status: true,
            jobDate: true,
          },
        },
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        technician: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    return NextResponse.json({ success: true, rooms })
  } catch (error) {
    console.error('Chat rooms GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST /api/chat/rooms - Create/get chat room for an order
export async function POST(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ orderId' }, { status: 400 })
    }

    // Verify order belongs to user (customer or technician)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true, technicianId: true },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })
    }

    const { userId } = auth.user
    if (order.customerId !== userId && order.technicianId !== userId) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })
    }

    // Find existing or create new room
    let room = await prisma.chatRoom.findUnique({
      where: { orderId },
    })

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          orderId,
          customerId: order.customerId,
          technicianId: order.technicianId,
        },
      })
    }

    return NextResponse.json({ success: true, room }, { status: 201 })
  } catch (error) {
    console.error('Chat rooms POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
