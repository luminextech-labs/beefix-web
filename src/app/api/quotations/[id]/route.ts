import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
      technician: {
        include: {
          user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        },
      },
    },
  })

  if (!quotation) return NextResponse.json({ success: false, message: 'ไม่พบใบเสนอราคา' }, { status: 404 })

  const isCustomer = quotation.customerId === userId
  const isTech = quotation.technician.userId === userId
  if (!isCustomer && !isTech) return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ดู' }, { status: 403 })

  return NextResponse.json({ success: true, quotation })
}

const UpdateQuotationSchema = z.object({
  price: z.number().min(0).optional(),
  technicianNote: z.string().optional(),
  validUntil: z.string().optional(),
  status: z.enum(['accepted', 'rejected']).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  const quotation = await prisma.quotation.findUnique({ where: { id }, include: { technician: { include: { user: true } } } })
  if (!quotation) return NextResponse.json({ success: false, message: 'ไม่พบใบเสนอราคา' }, { status: 404 })

  if (quotation.technician.userId !== userId) {
    return NextResponse.json({ success: false, message: 'เฉพาะช่างเท่านั้นที่แก้ไขได้' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = UpdateQuotationSchema.parse(body)

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        ...(data.price !== undefined && { price: data.price }),
        ...(data.technicianNote !== undefined && { technicianNote: data.technicianNote }),
        ...(data.validUntil && { validUntil: new Date(data.validUntil) }),
        ...(data.status === 'accepted' && { status: 'accepted' }),
        ...(data.status === 'rejected' && { status: 'rejected' }),
      },
    })

    return NextResponse.json({ success: true, quotation: updated })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
