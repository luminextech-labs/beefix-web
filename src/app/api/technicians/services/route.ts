import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const serviceSchema = z.object({
  subCategoryId: z.string().uuid().optional(),
  customCategoryId: z.string().uuid().optional(),
  description: z.string().optional(),
  basePrice: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
}).refine(data => data.subCategoryId || data.customCategoryId, {
  message: 'ต้องระบุ subCategoryId หรือ customCategoryId',
})

// GET - list technician's services
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

    const services = await prisma.technicianService.findMany({
      where: { technicianId: technician.id },
      include: {
        subCategory: { include: { category: true } },
        customCategory: true,
      },
    })

    // Also get custom categories for the frontend
    const customCategories = await prisma.customCategory.findMany({
      where: { technicianId: technician.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, services, customCategories })
  } catch (error) {
    console.error('Technician services GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - add service
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const result = serviceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { subCategoryId, customCategoryId, description, basePrice, images } = result.data

    // For system service: check duplicate
    if (subCategoryId) {
      const existing = await prisma.technicianService.findFirst({
        where: { technicianId: technician.id, subCategoryId },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'บริการนี้มีอยู่แล้ว' },
          { status: 400 }
        )
      }
    }

    const service = await prisma.technicianService.create({
      data: {
        technicianId: technician.id,
        subCategoryId: subCategoryId || null,
        customCategoryId: customCategoryId || null,
        description,
        basePrice,
        images: images || [],
      },
      include: {
        subCategory: { include: { category: true } },
        customCategory: true,
      },
    })

    return NextResponse.json({ success: true, service }, { status: 201 })
  } catch (error) {
    console.error('Technician services POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - remove service
export async function DELETE(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่าง' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get('id')

    if (!serviceId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ service id' }, { status: 400 })
    }

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์' }, { status: 404 })
    }

    await prisma.technicianService.deleteMany({
      where: { id: serviceId, technicianId: technician.id },
    })

    return NextResponse.json({ success: true, message: 'ลบบริการแล้ว' })
  } catch (error) {
    console.error('Technician services DELETE error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
