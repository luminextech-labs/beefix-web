import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'
import { z } from 'zod'
import { sendPushToUser } from '@/lib/push'

const sendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'location', 'system']).default('text'),
})

// Helper: verify user has access to a chat room
// ChatRoom.technicianId is the technician PROFILE id, not user id
async function verifyRoomAccess(roomId: string, userId: string, userRole: string): Promise<{ hasAccess: boolean; room: any }> {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { customerId: true, technicianId: true, orderId: true },
  })
  if (!room) return { hasAccess: false, room: null }

  if (room.customerId === userId) {
    return { hasAccess: true, room }
  }

  // Check if user is the technician (by profile userId)
  const techProfile = await prisma.technician.findUnique({
    where: { id: room.technicianId },
    select: { userId: true },
  })
  if (techProfile?.userId === userId) {
    return { hasAccess: true, room }
  }

  return { hasAccess: false, room }
}

// GET /api/chat/rooms/[id]/messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: roomId } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const { hasAccess, room } = await verifyRoomAccess(roomId, auth.user.userId, auth.user.role)
    if (!hasAccess || !room) {
      return NextResponse.json({ success: false, message: 'ไม่พบห้องแชท' }, { status: 404 })
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { roomId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      }),
      prisma.chatMessage.count({ where: { roomId } }),
    ])

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: auth.user.userId },
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Chat messages GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST /api/chat/rooms/[id]/messages
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: roomId } = await params
    const body = await req.json()
    const result = sendMessageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: 'ข้อความไม่ถูกต้อง' }, { status: 400 })
    }

    const { hasAccess, room } = await verifyRoomAccess(roomId, auth.user.userId, auth.user.role)
    if (!hasAccess || !room) {
      return NextResponse.json({ success: false, message: 'ไม่พบห้องแชท' }, { status: 404 })
    }

    const { message, messageType } = result.data

    const chatMessage = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: auth.user.userId,
        message,
        messageType: messageType as 'text' | 'image' | 'location' | 'system',
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    })

    // Update last message on room
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessage: messageType === 'image' ? '[รูปภาพ]' : message.slice(0, 100),
        lastMessageAt: new Date(),
      },
    })

    // Create notification for the other party
    const techProfile = await prisma.technician.findUnique({
      where: { id: room.technicianId },
      select: { userId: true },
    })
    const recipientId = room.customerId === auth.user.userId
      ? (techProfile?.userId || '')
      : room.customerId
    const senderName = auth.user.fullName || 'ลูกค้า'

    if (recipientId) {
      try {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'new_message',
            title: 'ข้อความใหม่',
            body: `${senderName}: ${messageType === 'image' ? '[รูปภาพ]' : message.slice(0, 50)}`,
            data: { roomId, messageId: chatMessage.id },
          },
        })
      } catch (notifErr) {
        console.error('Notification create error:', notifErr)
      }

      // Push notification (non-blocking)
      sendPushToUser(recipientId, {
        title: 'ข้อความใหม่',
        body: `${senderName}: ${messageType === 'image' ? '[รูปภาพ]' : message.slice(0, 80)}`,
        data: { type: 'new_message', roomId, messageId: chatMessage.id, link: `/chat/${roomId}` },
      }, prisma).catch(() => {})
    }

    return NextResponse.json({ success: true, message: chatMessage }, { status: 201 })
  } catch (error) {
    console.error('Chat messages POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
