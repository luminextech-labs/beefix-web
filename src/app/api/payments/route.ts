import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PaymentStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const paymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['wallet', 'card', 'promptpay', 'cash']),
})

// GET - get payment for an order
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ orderId' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        technician: { include: { user: { select: { id: true } } } },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })
    }

    const isCustomer = order.customerId === auth.user.userId
    const isTech = order.technician?.userId === auth.user.userId
    const isAdmin = auth.user.role === 'admin'

    if (!isCustomer && !isTech && !isAdmin) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    return NextResponse.json({ success: true, payment: order.payment })
  } catch (error) {
    console.error('Payment GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - create/process payment for an order
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const result = paymentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: result.data.orderId },
      include: {
        customer: true,
        technician: { include: { user: true } },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออร์เดอร์' }, { status: 404 })
    }

    if (order.customerId !== auth.user.userId) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    if (order.payment?.status === 'paid') {
      return NextResponse.json({ success: false, message: 'ชำระเงินแล้ว' }, { status: 400 })
    }

    // Handle wallet payment
    if (result.data.method === 'wallet') {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: auth.user.userId },
      })

      if (!wallet || Number(wallet.balance) < Number(order.totalAmount)) {
        return NextResponse.json({ success: false, message: 'ยอดเงินไม่เพียงพอ' }, { status: 400 })
      }

      const amount = Number(order.totalAmount)

      // Deduct from customer wallet
      const [updatedWallet] = await prisma.$transaction([
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: Number(wallet.balance) - amount },
        }),
        prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            userId: auth.user.userId,
            type: 'fee',
            amount: -amount,
            balanceAfter: Number(wallet.balance) - amount,
            reference: order.orderNo,
            description: `ชำระค่าบริการ ${order.orderNo}`,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'paid', paidAt: new Date() },
        }),
        prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmount,
            method: 'wallet',
            status: 'paid',
            paidAt: new Date(),
          },
        }),
      ])

      // Credit technician wallet
      const techWallet = await prisma.wallet.findUnique({
        where: { userId: order.technician.userId },
      })

      if (techWallet) {
        const techEarnings = Number(order.totalAmount) - Number(order.platformFee)
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: techWallet.id },
            data: { balance: Number(techWallet.balance) + techEarnings },
          }),
          prisma.walletTransaction.create({
            data: {
              walletId: techWallet.id,
              userId: order.technician.userId,
              type: 'receive',
              amount: techEarnings,
              balanceAfter: Number(techWallet.balance) + techEarnings,
              reference: order.orderNo,
              description: `รับค่าบริการ ${order.orderNo}`,
            },
          }),
        ])
      }

      // Notify
      await prisma.notification.createMany({
        data: [
          {
            userId: order.technician.userId,
            type: 'payment_received',
            title: 'ได้รับการชำระเงิน!',
            body: `ได้รับ ${Number(order.totalAmount) - Number(order.platformFee)} บาท จากออร์เดอร์ ${order.orderNo}`,
            data: { orderId: order.id },
          },
        ],
      })

      return NextResponse.json({ success: true, message: 'ชำระเงินสำเร็จ' })
    }

    // For card/promptpay/cash - create pending payment record
    // In real app, this would integrate with Stripe/QR code
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: result.data.method,
        status: 'unpaid',
      },
    })

    return NextResponse.json({
      success: true,
      payment,
      message: `${result.data.method === 'card' ? 'Stripe' : result.data.method === 'promptpay' ? 'PromptPay' : 'Cash'} payment initiated`,
    })
  } catch (error) {
    console.error('Payment POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
