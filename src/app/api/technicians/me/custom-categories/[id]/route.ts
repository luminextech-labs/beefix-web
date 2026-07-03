import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่าง' }, { status: 403 })
    }

    const { id } = await params

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    }

    await prisma.customCategory.deleteMany({
      where: { id, technicianId: technician.id },
    })

    return NextResponse.json({ success: true, message: 'ลบหมวดหมู่แล้ว' })
  } catch (error) {
    console.error('Custom category delete error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
