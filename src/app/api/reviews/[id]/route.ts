import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// PATCH - technician replies to review
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await req.json()
    const { reply } = body

    if (!reply || typeof reply !== 'string') {
      return NextResponse.json({ success: false, message: 'กรุณาใส่ข้อความตอบกลับ' }, { status: 400 })
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { technician: true },
    })

    if (!review) {
      return NextResponse.json({ success: false, message: 'ไม่พบรีวิว' }, { status: 404 })
    }

    if (review.technician.userId !== auth.user.userId) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        technicianReply: reply,
        repliedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, review: updated })
  } catch (error) {
    console.error('Review reply error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
