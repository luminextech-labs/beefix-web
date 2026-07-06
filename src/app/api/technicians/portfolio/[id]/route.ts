import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// PATCH - update portfolio item
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const item = await prisma.portfolioItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ success: false, message: 'ไม่พบผลงาน' }, { status: 404 })
    }

    // Verify ownership
    const technician = await prisma.technician.findUnique({ where: { userId: auth.user.userId } })
    if (!technician || item.technicianId !== technician.id) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์แก้ไข' }, { status: 403 })
    }

    const body = await req.json()
    const { images, caption } = body

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(images !== undefined && { images }),
        ...(caption !== undefined && { caption }),
      },
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (error) {
    console.error('Portfolio PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - delete portfolio item
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const item = await prisma.portfolioItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ success: false, message: 'ไม่พบผลงาน' }, { status: 404 })
    }

    // Verify ownership
    const technician = await prisma.technician.findUnique({ where: { userId: auth.user.userId } })
    if (!technician || item.technicianId !== technician.id) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ลบ' }, { status: 403 })
    }

    await prisma.portfolioItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Portfolio DELETE error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
