import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// POST - link categories to technician
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่างเท่านั้น' }, { status: 403 })
    }

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    const body = await req.json()
    const { categoryIds } = body

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json({ success: false, message: 'ต้องส่ง array ของ categoryIds' }, { status: 400 })
    }

    // Delete existing category links
    await prisma.technicianCategory.deleteMany({
      where: { technicianId: technician.id },
    })

    // Create new links
    if (categoryIds.length > 0) {
      await prisma.technicianCategory.createMany({
        data: categoryIds.map((catId: string) => ({
          technicianId: technician.id,
          categoryId: catId,
        })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Technician categories POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
