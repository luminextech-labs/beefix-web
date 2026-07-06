import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            phone: true,
            isVerified: true,
          },
        },
        services: {
          include: {
            subCategory: {
              include: { category: true },
            },
          },
        },
        categories: {
          include: { category: true },
        },
        customCategories: true,
        portfolioItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    return NextResponse.json({ success: true, technician })
  } catch (error) {
    console.error('Technician public profile error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
