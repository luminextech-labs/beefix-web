import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET - list all disputes
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true, orderNo: true, title: true,
              customerId: true, technicianId: true,
              customer: { select: { fullName: true, phone: true } },
              technician: { include: { user: { select: { fullName: true, phone: true } } } },
            },
          },
        },
      }),
      prisma.dispute.count({ where }),
    ])

    return NextResponse.json({
      success: true, disputes, total,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Disputes GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
