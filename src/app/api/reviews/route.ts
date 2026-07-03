import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'
import { sendPushToUser } from '@/lib/push'

const reviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET - get reviews (for technician or by order)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const technicianId = searchParams.get('technicianId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}
    if (technicianId) where.technicianId = technicianId

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          order: {
            select: { id: true, orderNo: true, title: true, completedAt: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - create review (customer only, after order completed)
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'customer') {
      return NextResponse.json({ success: false, message: 'เฉพาะลูกค้า' }, { status: 403 })
    }

    const body = await req.json()
    const result = reviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    // Verify order is completed & belongs to customer
    const order = await prisma.order.findUnique({
      where: { id: result.data.orderId },
      include: { technician: { include: { user: true } } },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })
    }

    if (order.customerId !== auth.user.userId) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    if (order.status !== 'completed') {
      return NextResponse.json({ success: false, message: 'ต้องรอให้งานเสร็จก่อน' }, { status: 400 })
    }

    // Check already reviewed
    const existing = await prisma.review.findUnique({
      where: { orderId: result.data.orderId },
    })
    if (existing) {
      return NextResponse.json({ success: false, message: 'ท่านรีวิวงานนี้ไปแล้ว' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        orderId: result.data.orderId,
        customerId: auth.user.userId,
        technicianId: order.technicianId,
        rating: result.data.rating,
        comment: result.data.comment,
        tags: result.data.tags,
      },
    })

    // Update technician rating
    const allReviews = await prisma.review.findMany({
      where: { technicianId: order.technicianId },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.technician.update({
      where: { id: order.technicianId },
      data: {
        ratingAvg: Math.round(avgRating * 100) / 100,
        ratingCount: allReviews.length,
      },
    })

    // Notify technician (DB + push)
    await prisma.notification.create({
      data: {
        userId: order.technician.userId,
        type: 'review_received',
        title: 'ได้รับรีวิวใหม่! ⭐',
        body: `ลูกค้าให้คะแนน ${result.data.rating} ดาว${result.data.comment ? ' "' + result.data.comment.slice(0, 40) + '..."' : ''}`,
        data: { orderId: order.id, reviewId: review.id },
      },
    })

    sendPushToUser(order.technician.userId, {
      title: 'ได้รับรีวิวใหม่! ⭐',
      body: `ลูกค้าให้คะแนน ${result.data.rating} ดาว`,
      data: { type: 'review_received', orderId: order.id, reviewId: review.id, link: `/profile/reviews` },
    }, prisma).catch(() => {})

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
