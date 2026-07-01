import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const promptpaySchema = z.object({
  type: z.literal('promptpay'),
  label: z.string().min(1, 'กรุณากรอกชื่อ'),
  promptpayNumber: z.string().min(10, 'กรุณากรอกเบอร์ PromptPay ให้ถูกต้อง').max(13),
})

const cardSchema = z.object({
  type: z.literal('card'),
  label: z.string().min(1, 'กรุณากรอกชื่อ'),
  cardLast4: z.string().length(4),
  cardBrand: z.string().optional(),
  cardExpMonth: z.number().int().min(1).max(12).optional(),
  cardExpYear: z.number().int().min(2025).optional(),
})

const unionSchema = z.union([promptpaySchema, cardSchema])

// GET - list user's payment methods
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const methods = await prisma.userPaymentMethod.findMany({
      where: { userId: auth.user.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, methods })
  } catch (error) {
    console.error('PaymentMethods GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - create new payment method
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const result = unionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // If this is default, unset other defaults
    if (body.isDefault) {
      await prisma.userPaymentMethod.updateMany({
        where: { userId: auth.user.userId },
        data: { isDefault: false },
      })
    }

    const method = await prisma.userPaymentMethod.create({
      data: {
        userId: auth.user.userId,
        type: data.type,
        label: data.label,
        promptpayNumber: data.type === 'promptpay' ? data.promptpayNumber : null,
        cardLast4: data.type === 'card' ? data.cardLast4 : null,
        cardBrand: data.type === 'card' ? (data.cardBrand || null) : null,
        cardExpMonth: data.type === 'card' ? (data.cardExpMonth || null) : null,
        cardExpYear: data.type === 'card' ? (data.cardExpYear || null) : null,
        isDefault: body.isDefault ?? false,
      },
    })

    return NextResponse.json({ success: true, method }, { status: 201 })
  } catch (error) {
    console.error('PaymentMethods POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - delete payment method
export async function DELETE(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ต้องระบุ id' }, { status: 400 })
    }

    const method = await prisma.userPaymentMethod.findFirst({
      where: { id, userId: auth.user.userId },
    })

    if (!method) {
      return NextResponse.json({ success: false, message: 'ไม่พบวิธีการชำระเงินนี้' }, { status: 404 })
    }

    await prisma.userPaymentMethod.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PaymentMethods DELETE error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
