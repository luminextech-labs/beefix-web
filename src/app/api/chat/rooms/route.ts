import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET /api/chat/rooms - List chat rooms for current user
export async function GET(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { userId, role } = auth.user

    // Build where clause — technicianId in ChatRoom is the technician PROFILE id, not user id
    // For technician role, find their profile id first
    let whereClause: any
    if (role === 'technician') {
      const techProfile = await prisma.technician.findFirst({
        where: { userId },
        select: { id: true },
      })
      whereClause = { technicianId: techProfile?.id || '' }
    } else {
      whereClause = { customerId: userId }
    }

    const rooms = await prisma.chatRoom.findMany({
      where: whereClause,
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

// POST /api/chat/rooms - Create or get chat room for a customer-technician pair
// If orderId is provided, also link the order to the room
export async function POST(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { orderId, technicianId } = await req.json()
    const { userId, role } = auth.user

    let customerId: string
    let technicianIdFinal: string
    let orderIdFinal: string | null = orderId || null

    if (orderId) {
      // Find by order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, technicianId: true },
      })
      if (!order) {
        return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })
      }
      if (order.customerId !== userId && order.technicianId !== userId) {
        return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }, { status: 403 })
      }
      customerId = order.customerId
      technicianIdFinal = order.technicianId

      // Check if a room already exists for this customer-technician pair (with or without order)
      const existingRoom = await prisma.chatRoom.findFirst({
        where: { customerId, technicianId: technicianIdFinal },
      })
      if (existingRoom) {
        // Link order to existing room if not already linked
        if (!existingRoom.orderId) {
          await prisma.chatRoom.update({
            where: { id: existingRoom.id },
            data: { orderId: orderIdFinal },
          })
          existingRoom.orderId = orderIdFinal
        }
        return NextResponse.json({ success: true, room: existingRoom }, { status: 200 })
      }
    } else if (technicianId) {
      // Customer starts chat with technician directly (technicianId here is the technician's USER id)
      if (role !== 'customer') {
        return NextResponse.json({ success: false, message: 'เฉพาะลูกค้าเท่านั้น' }, { status: 403 })
      }
      // Find technician profile by user ID
      const techProfile = await prisma.technician.findFirst({
        where: { userId: technicianId },
        select: { id: true },
      })
      if (!techProfile) {
        return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
      }
      customerId = userId
      technicianIdFinal = techProfile.id

      // Check if a room already exists for this pair
      const existingRoom = await prisma.chatRoom.findFirst({
        where: { customerId, technicianId: technicianIdFinal },
      })
      if (existingRoom) {
        return NextResponse.json({ success: true, room: existingRoom }, { status: 200 })
      }
    } else {
      return NextResponse.json({ success: false, message: 'ต้องระบุ orderId หรือ technicianId' }, { status: 400 })
    }

    // Create new room
    const room = await prisma.chatRoom.create({
      data: {
        orderId: orderIdFinal,
        customerId,
        technicianId: technicianIdFinal,
      },
    })

    return NextResponse.json({ success: true, room }, { status: 201 })
  } catch (error) {
    console.error('Chat rooms POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
