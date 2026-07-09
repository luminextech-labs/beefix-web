import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET /api/technicians/me/service-areas - get my service areas
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const tech = await prisma.technician.findUnique({ where: { userId: auth.user.userId } })
    if (!tech) return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })

    const areas = await prisma.technicianServiceArea.findMany({
      where: { technicianId: tech.id },
      orderBy: { province: 'asc' },
    })

    return NextResponse.json({ success: true, areas })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT /api/technicians/me/service-areas - replace all service areas
export async function PUT(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const tech = await prisma.technician.findUnique({ where: { userId: auth.user.userId } })
    if (!tech) return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })

    const body = await req.json()
    const { areas } = body as { areas: { province: string; district?: string }[] }

    // Delete all existing
    await prisma.technicianServiceArea.deleteMany({ where: { technicianId: tech.id } })

    // Insert new ones
    if (areas?.length > 0) {
      await prisma.technicianServiceArea.createMany({
        data: areas.map(a => ({
          technicianId: tech.id,
          province: a.province,
          district: a.district || null,
        })),
      })
    }

    const updated = await prisma.technicianServiceArea.findMany({
      where: { technicianId: tech.id },
      orderBy: { province: 'asc' },
    })

    return NextResponse.json({ success: true, areas: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
