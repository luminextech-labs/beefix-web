import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const topupSchema = z.object({
  amount: z.number().min(1, 'จำนวนเงินขั้นต่ำ 1 บาท'),
})

// GET - get wallet balance & transactions
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // topup, withdraw, receive, refund, fee

    const wallet = await prisma.wallet.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบกระเป๋าเงิน' },
        { status: 404 }
      )
    }

    const where: Record<string, unknown> = { walletId: wallet.id }
    if (type) where.type = type

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
      },
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Wallet GET error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// POST - topup wallet (this would normally integrate with payment gateway)
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const result = topupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { amount } = result.data

    const wallet = await prisma.wallet.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบกระเป๋าเงิน' },
        { status: 404 }
      )
    }

    // In real app, this would verify payment with Stripe/PromptPay first
    // For now, simulate instant topup
    const newBalance = Number(wallet.balance) + amount

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: auth.user.userId,
          type: 'topup',
          amount,
          balanceAfter: newBalance,
          description: 'เติมเงินเข้ากระเป๋า',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      wallet: {
        id: updatedWallet.id,
        balance: updatedWallet.balance,
      },
      transaction,
    })
  } catch (error) {
    console.error('Wallet POST error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
