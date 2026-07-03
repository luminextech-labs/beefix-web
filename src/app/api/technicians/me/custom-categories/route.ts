import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

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
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    const { name, icon } = await req.json()
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกชื่อหมวดหมู่' }, { status: 400 })
    }

    const existing = await prisma.customCategory.findUnique({
      where: { technicianId_name: { technicianId: technician.id, name: name.trim() } },
    })

    if (existing) {
      return NextResponse.json({ success: false, message: 'หมวดหมู่นี้มีอยู่แล้ว' }, { status: 400 })
    }

    const category = await prisma.customCategory.create({
      data: {
        technicianId: technician.id,
        name: name.trim(),
        icon: icon || '🔧',
      },
    })

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error) {
    console.error('Custom category create error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

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
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    const categories = await prisma.customCategory.findMany({
      where: { technicianId: technician.id },
      include: { services: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Custom category list error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
