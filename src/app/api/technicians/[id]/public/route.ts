import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rawToken = req.headers.get('authorization')?.replace('Bearer ', '') ||
                     req.cookies.get('auth_token')?.value ||
                     req.cookies.get('tech_token')?.value
    const payload = rawToken ? verifyToken(rawToken) : null
    const userId = payload?.userId || null

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
          include: {
            _count: { select: { likes: true, comments: true } },
            likes: userId ? { where: { userId } } : false,
          },
        },
      },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    // Add likedByUser flag to each portfolio item
    const technicianWithLikes = {
      ...technician,
      portfolioItems: technician.portfolioItems.map(item => ({
        ...item,
        likedByUser: userId ? item.likes.length > 0 : false,
        likes: undefined, // don't expose internal likes
      })),
    }

    return NextResponse.json({ success: true, technician: technicianWithLikes })
  } catch (error) {
    console.error('Technician public profile error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
