import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่าง' }, { status: 403 })
    }

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์' }, { status: 404 })
    }

    const reviews = await prisma.review.findMany({
      where: { technicianId: technician.id },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            jobDate: true,
          },
        },
        customer: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const ratingAvg = technician.ratingAvg ? Number(technician.ratingAvg) : 0

    return NextResponse.json({
      success: true,
      reviews,
      ratingAvg,
      ratingCount: technician.ratingCount,
    })
  } catch (error) {
    console.error('Technician reviews error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
