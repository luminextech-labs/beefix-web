import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// PATCH /api/profile - Update current user profile
export async function PATCH(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { fullName, phone, avatarUrl } = body

    const user = await prisma.user.update({
      where: { id: auth.user.userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: { id: true, email: true, phone: true, fullName: true, avatarUrl: true, role: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
