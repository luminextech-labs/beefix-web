import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'
import { sendPushToUser } from '@/lib/push'

const createOrderSchema = z.object({
  technicianId: z.string().uuid('ID ช่างไม่ถูกต้อง'),
  subCategoryId: z.string().uuid('กรุณาเลือกประเภทบริการ'),
  title: z.string().min(1, 'กรุณาระบุหัวข้องาน'),
  description: z.string().optional(),
  jobDate: z.string().min(1, 'กรุณาเลือกวันที่'),
  jobTime: z.string().optional(),
  addressId: z.string().uuid().optional(),
  addressText: z.string().optional(),
  laborCost: z.number().min(0).default(0),
  travelCost: z.number().min(0).default(0),
  materialCost: z.number().min(0).default(0),
  paymentMethod: z.enum(['wallet', 'card', 'promptpay', 'cash']).default('wallet'),
  couponCode: z.string().optional(),
})

// GET - list user's orders
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}

    // Customer sees their orders, technician sees theirs
    if (auth.user.role === 'customer') {
      where.customerId = auth.user.userId
    } else if (auth.user.role === 'technician') {
      const tech = await prisma.technician.findUnique({
        where: { userId: auth.user.userId },
      })
      if (tech) where.technicianId = tech.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true, avatarUrl: true },
          },
          technician: {
            include: {
              user: {
                select: { id: true, fullName: true, phone: true, avatarUrl: true },
              },
            },
          },
          subCategory: {
            include: { category: true },
          },
          address: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// POST - create new order
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'เฉพาะลูกค้าเท่านั้นที่สร้างออร์เดอร์ได้' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const result = createOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // Generate order number
    const count = await prisma.order.count()
    const orderNo = `BKF${String(count + 1).padStart(6, '0')}`

    // Calculate pricing
    const laborCost = data.laborCost || 0
    const travelCost = data.travelCost || 0
    const materialCost = data.materialCost || 0
    const subtotal = laborCost + travelCost + materialCost
    // ใหม่: ลูกค้าจ่าย +5%, ช่างได้ -5%, แพลตฟอร์มเก็บ 10%
    const platformFee = Math.round(subtotal * 0.10 * 100) / 100 // 10% total (5% จากลูกค้า + 5% จากช่าง)
    const technicianEarning = Math.round(subtotal * 0.95 * 100) / 100 // ช่างได้ 95%
    const totalAmount = Math.round(subtotal * 1.05 * 100) / 100 // ลูกค้าจ่าย 105%

    // Validate technician exists and is available
    const technician = await prisma.technician.findUnique({
      where: { id: data.technicianId },
      include: { user: true },
    })

    if (!technician || !technician.isAvailable) {
      return NextResponse.json(
        { success: false, message: 'ช่างไม่พร้อมให้บริการในขณะนี้' },
        { status: 400 }
      )
    }

    // Handle coupon
    let couponDiscount = 0
    let couponId: string | null = null
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode },
      })
      if (coupon && coupon.isActive && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          couponId = coupon.id
          if (coupon.discountType === 'percent') {
            couponDiscount = Math.min(
              (totalAmount * Number(coupon.discountValue)) / 100,
              Number(coupon.maxDiscount) || Infinity
            )
          } else {
            couponDiscount = Number(coupon.discountValue)
          }
        }
      }
    }

    const finalTotal = Math.max(0, totalAmount - couponDiscount)

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId: auth.user.userId,
        technicianId: data.technicianId,
        subCategoryId: data.subCategoryId,
        title: data.title,
        description: data.description,
        jobDate: new Date(data.jobDate),
        jobTime: data.jobTime,
        addressId: data.addressId,
        addressText: data.addressText,
        laborCost,
        travelCost,
        materialCost,
        platformFee,
        technicianEarning,
        totalAmount: finalTotal,
        paymentMethod: data.paymentMethod,
        couponId,
        couponDiscount,
        status: 'pending',
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, avatarUrl: true },
        },
        technician: {
          include: {
            user: {
              select: { id: true, fullName: true, phone: true, avatarUrl: true },
            },
          },
        },
        subCategory: {
          include: { category: true },
        },
        address: true,
      },
    })

    // Update coupon usage count
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      })
    }

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        note: 'สร้างออร์เดอร์ใหม่',
      },
    })

    // Create or reuse chat room for this customer-technician pair
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        customerId: auth.user.userId,
        technicianId: data.technicianId,
      },
    })
    if (existingRoom) {
      // Link order to existing room
      await prisma.chatRoom.update({
        where: { id: existingRoom.id },
        data: { orderId: order.id },
      })
    } else {
      // Create new room
      await prisma.chatRoom.create({
        data: {
          orderId: order.id,
          customerId: auth.user.userId,
          technicianId: data.technicianId,
        },
      })
    }

    // Create notification for technician
    await prisma.notification.create({
      data: {
        userId: technician.userId,
        type: 'new_order',
        title: 'มีงานใหม่!',
        body: `มีการจอง "${data.title}" จากลูกค้า`,
        data: { orderId: order.id, technicianId: data.technicianId },
      },
    })

    // Push notification (non-blocking)
    sendPushToUser(technician.userId, {
      title: 'มีงานใหม่!',
      body: `มีการจอง "${data.title}" จากลูกค้า`,
      data: { type: 'new_order', orderId: order.id, link: `/orders?id=${order.id}` },
    }, prisma).catch(() => {})

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
