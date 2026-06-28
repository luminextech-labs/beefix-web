import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
