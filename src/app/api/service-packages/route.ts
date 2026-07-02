import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const packageSchema = z.object({
  subCategoryId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().min(0),
  durationHours: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// GET - list technician's packages
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

    const packages = await prisma.servicePackage.findMany({
      where: { technicianId: technician.id },
      include: { subCategory: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, packages })
  } catch (error) {
    console.error('ServicePackages GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - create package
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
    const result = packageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const pkg = await prisma.servicePackage.create({
      data: {
        technicianId: technician.id,
        subCategoryId: result.data.subCategoryId,
        title: result.data.title,
        description: result.data.description,
        price: result.data.price,
        durationHours: result.data.durationHours,
        isActive: result.data.isActive ?? true,
      },
      include: { subCategory: { include: { category: true } } },
    })

    return NextResponse.json({ success: true, package: pkg }, { status: 201 })
  } catch (error) {
    console.error('ServicePackages POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PATCH - update package
export async function PATCH(req: NextRequest) {
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
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ id' }, { status: 400 })
    }

    const result = packageSchema.partial().safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const pkg = await prisma.servicePackage.updateMany({
      where: { id, technicianId: technician.id },
      data: result.data,
    })

    if (pkg.count === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบแพ็กเกจ' }, { status: 404 })
    }

    const updated = await prisma.servicePackage.findUnique({
      where: { id },
      include: { subCategory: { include: { category: true } } },
    })

    return NextResponse.json({ success: true, package: updated })
  } catch (error) {
    console.error('ServicePackages PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - remove package
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ id' }, { status: 400 })
    }

    await prisma.servicePackage.deleteMany({
      where: { id, technicianId: technician.id },
    })

    return NextResponse.json({ success: true, message: 'ลบแพ็กเกจแล้ว' })
  } catch (error) {
    console.error('ServicePackages DELETE error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
