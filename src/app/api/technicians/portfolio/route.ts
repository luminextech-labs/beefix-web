import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET - list portfolio items for technician (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const technicianId = searchParams.get('technicianId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!technicianId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ technicianId' }, { status: 400 })
    }

    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where: { technicianId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.portfolioItem.count({ where: { technicianId } }),
    ])

    return NextResponse.json({
      success: true,
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - create portfolio item (technician only)
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่างเท่านั้น' }, { status: 403 })
    }

    const technician = await prisma.technician.findUnique({ where: { userId: auth.user.userId } })
    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    const body = await req.json()
    const { images = [], caption } = body

    if (!images || images.length === 0) {
      return NextResponse.json({ success: false, message: 'ต้องมีรูปภาพอย่างน้อย 1 รูป' }, { status: 400 })
    }

    const item = await prisma.portfolioItem.create({
      data: { technicianId: technician.id, images, caption: caption || null },
    })

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    console.error('Portfolio POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
