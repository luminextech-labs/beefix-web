import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

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

    await prisma.$disconnect()
    return NextResponse.json({ success: true, categories }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด', categories: [] }, { status: 500 })
  }
}
