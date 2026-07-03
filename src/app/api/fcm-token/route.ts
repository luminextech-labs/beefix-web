import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// POST - register or update FCM token
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { fcmToken } = body

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: auth.user.userId },
      data: { fcmToken },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FCM token error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
