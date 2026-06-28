import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')

    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) where.categoryId = categoryId

    const subCategories = await prisma.subCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    })

    return NextResponse.json({ success: true, subCategories })
  } catch (error) {
    console.error('SubCategories error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
