import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'

// GET /api/portfolio/[id]/comment - Get comments for a portfolio item
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const comments = await prisma.portfolioComment.findMany({
      where: { portfolioItemId: id },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error('Portfolio comments get error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST /api/portfolio/[id]/comment - Add a comment
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

    const { content } = await req.json()
    if (!content?.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณาใส่ข้อความ' }, { status: 400 })
    }

    const comment = await prisma.portfolioComment.create({
      data: { portfolioItemId: id, userId, content: content.trim() },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    })

    // Increment comment count
    await prisma.portfolioItem.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Portfolio comment error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
