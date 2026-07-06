import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'

// POST /api/portfolio/[id]/like - Like/unlike a portfolio item
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '') ||
                      req.cookies.get('auth_token')?.value ||
                      req.cookies.get('tech_token')?.value
    if (!authToken) {
      return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const payload = verifyToken(authToken)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Token ไม่ถูกต้อง' }, { status: 401 })
    }
    const userId = payload.userId

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
