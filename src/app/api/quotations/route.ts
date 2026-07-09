import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const CreateQuotationSchema = z.object({
  technicianId: z.string().min(1),
  subCategoryId: z.string().optional(),
  addressId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  jobDate: z.string().optional(),
  jobTime: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') // 'customer' | 'technician'
  const status = searchParams.get('status')

  const where: any = {}

  if (role === 'customer') {
    where.customerId = userId
  } else if (role === 'technician') {
    const tech = await prisma.technician.findUnique({ where: { userId } })
    if (!tech) return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์ช่าง' }, { status: 404 })
    where.technicianId = tech.id
  } else {
    return NextResponse.json({ success: false, message: 'ระบุ role ด้วย' }, { status: 400 })
  }

  if (status) where.status = status

  const quotations = await prisma.quotation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
      technician: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        },
      },
    },
  })

  return NextResponse.json({ success: true, quotations })
}

export async function POST(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  try {
    const body = await req.json()
    const data = CreateQuotationSchema.parse(body)

    const tech = await prisma.technician.findUnique({
      where: { userId: data.technicianId },
      include: { user: { select: { id: true, fullName: true } } },
    })
    if (!tech) return NextResponse.json({ success: false, message: 'ไม่พบช่าง' }, { status: 404 })

    const quotation = await prisma.quotation.create({
      data: {
        customerId: userId,
        technicianId: tech.id,
        subCategoryId: data.subCategoryId,
        addressId: data.addressId,
        title: data.title,
        description: data.description,
        images: data.images?.length ? JSON.stringify(data.images) : null,
        documents: data.documents?.length ? JSON.stringify(data.documents) : null,
        jobDate: data.jobDate ? new Date(data.jobDate) : null,
        jobTime: data.jobTime,
      },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
        technician: { include: { user: { select: { id: true, fullName: true } } } },
      },
    })

    return NextResponse.json({ success: true, quotation })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง', errors: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
