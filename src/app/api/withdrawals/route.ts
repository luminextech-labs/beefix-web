import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const withdrawalSchema = z.object({
  amount: z.number().min(100, 'ขั้นต่ำ 100 บาท'),
  bankName: z.string().min(1, 'กรุณาระบุธนาคาร'),
  bankAccount: z.string().min(1, 'กรุณาระบุเลขบัญชี'),
  bankAccountName: z.string().min(1, 'กรุณาระบุชื่อบัญชี'),
})

// GET - list technician's withdrawals
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่าง' }, { status: 403 })
    }

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์' }, { status: 404 })
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { technicianId: technician.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, withdrawals })
  } catch (error) {
    console.error('Withdrawals GET error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST - request withdrawal
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ต้องเป็นช่าง' }, { status: 403 })
    }

    const body = await req.json()
    const result = withdrawalSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json({ success: false, message: 'ไม่พบโปรไฟล์' }, { status: 404 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!wallet || Number(wallet.balance) < result.data.amount) {
      return NextResponse.json(
        { success: false, message: 'ยอดเงินไม่เพียงพอ' },
        { status: 400 }
      )
    }

    // Check for pending withdrawal
    const pendingExists = await prisma.withdrawal.findFirst({
      where: { technicianId: technician.id, status: 'pending' },
    })

    if (pendingExists) {
      return NextResponse.json(
        { success: false, message: 'มีคำขอถอนเงินที่กำลังดำเนินการอยู่' },
        { status: 400 }
      )
    }

    const fee = Math.round(result.data.amount * 0.01 * 100) / 100 // 1% fee

    // Create withdrawal & deduct balance in transaction
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          walletId: wallet.id,
          technicianId: technician.id,
          amount: result.data.amount,
          fee,
          bankName: result.data.bankName,
          bankAccount: result.data.bankAccount,
          bankAccountName: result.data.bankAccountName,
          status: 'pending',
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: Number(wallet.balance) - result.data.amount },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: auth.user.userId,
          type: 'withdraw',
          amount: -result.data.amount,
          balanceAfter: Number(wallet.balance) - result.data.amount,
          reference: `WD-${Date.now()}`,
          description: `ถอนเงิน ${result.data.amount} บาท ( fee ${fee} )`,
        },
      }),
    ])

    return NextResponse.json({ success: true, withdrawal }, { status: 201 })
  } catch (error) {
    console.error('Withdrawals POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
