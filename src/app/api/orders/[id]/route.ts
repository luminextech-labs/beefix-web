import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  cancelReason: z.string().optional(),
  laborCost: z.number().optional(),
  travelCost: z.number().optional(),
  materialCost: z.number().optional(),
})

// GET - get order details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
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
        payment: true,
        review: true,
        chatRoom: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบออร์เดอร์' },
        { status: 404 }
      )
    }

    // Check access
    const isCustomer = order.customerId === auth.user.userId
    const isTechnician = order.technician?.user?.id === auth.user.userId
    const isAdmin = auth.user.role === 'admin'

    if (!isCustomer && !isTechnician && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'คุณไม่มีสิทธิ์ดูออร์เดอร์นี้' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// PATCH - update order (technician confirms/starts/completes, or customer cancels)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await req.json()
    const result = updateOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        technician: { include: { user: true } },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบออร์เดอร์' },
        { status: 404 }
      )
    }

    const data = result.data

    // Customer can only cancel
    if (auth.user.role === 'customer') {
      if (data.status === 'cancelled') {
        await prisma.order.update({
          where: { id },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelReason: data.cancelReason || 'ลูกค้ายกเลิก',
          },
        })
        await prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status: 'cancelled',
            note: data.cancelReason || 'ลูกค้ายกเลิก',
          },
        })
        return NextResponse.json({ success: true, message: 'ยกเลิกออร์เดอร์แล้ว' })
      }
      return NextResponse.json(
        { success: false, message: 'คุณไม่มีสิทธิ์แก้ไขออร์เดอร์นี้' },
        { status: 403 }
      )
    }

    // Technician actions
    if (auth.user.role === 'technician') {
      if (order.technician?.userId !== auth.user.userId) {
        return NextResponse.json(
          { success: false, message: 'คุณไม่ใช่ช่างที่รับงานนี้' },
          { status: 403 }
        )
      }

      const updateData: Record<string, unknown> = {}

      if (data.status) {
        updateData.status = data.status

        if (data.status === 'confirmed') {
          updateData.technicianRespondedAt = new Date()
        } else if (data.status === 'in_progress') {
          updateData.startedAt = new Date()
        } else if (data.status === 'completed') {
          updateData.completedAt = new Date()
          // If payment is unpaid, this would need payment flow
        } else if (data.status === 'cancelled') {
          updateData.cancelledAt = new Date()
          updateData.cancelReason = data.cancelReason || 'ช่างยกเลิก'
        }
      }

      // Update pricing if provided
      if (data.laborCost !== undefined) updateData.laborCost = data.laborCost
      if (data.travelCost !== undefined) updateData.travelCost = data.travelCost
      if (data.materialCost !== undefined) updateData.materialCost = data.materialCost

      // Recalculate total if pricing changed
      if (data.laborCost !== undefined || data.travelCost !== undefined || data.materialCost !== undefined) {
        const labor = data.laborCost ?? Number(order.laborCost)
        const travel = data.travelCost ?? Number(order.travelCost)
        const material = data.materialCost ?? Number(order.materialCost)
        const subtotal = labor + travel + material
        updateData.totalAmount = Math.max(0, subtotal + Number(order.platformFee) - Number(order.couponDiscount))
      }

      const updated = await prisma.order.update({
        where: { id },
        data: updateData,
      })

      if (data.status) {
        await prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status: data.status,
            note: `อัปเดตโดยช่าง: ${data.status}`,
          },
        })
      }

      return NextResponse.json({ success: true, order: updated })
    }

    // Admin can do anything
    if (auth.user.role === 'admin' && data.status) {
      const updated = await prisma.order.update({
        where: { id },
        data: { status: data.status },
      })
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: data.status,
          note: 'อัปเดตโดย admin',
        },
      })
      return NextResponse.json({ success: true, order: updated })
    }

    return NextResponse.json(
      { success: false, message: 'ไม่มีการเปลี่ยนแปลง' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Order PATCH error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
