import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/portfolio/[id]/like - Like/unlike a portfolio item
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authToken = req.cookies.get('auth_token')?.value ||
                      req.cookies.get('tech_token')?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // Get user from token
    const userId = authToken // In production, decode the JWT
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    // Check if already liked
    const existing = await prisma.portfolioLike.findUnique({
      where: { portfolioItemId_userId: { portfolioItemId: id, userId } },
    })

    if (existing) {
      // Unlike
      await prisma.portfolioLike.delete({
        where: { portfolioItemId_userId: { portfolioItemId: id, userId } },
      })
      await prisma.portfolioItem.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      })
      return NextResponse.json({ success: true, liked: false })
    } else {
      // Like
      await prisma.portfolioLike.create({
        data: { portfolioItemId: id, userId },
      })
      await prisma.portfolioItem.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      })
      return NextResponse.json({ success: true, liked: true })
    }
  } catch (error) {
    console.error('Portfolio like error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
