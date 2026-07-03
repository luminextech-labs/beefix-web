import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// PATCH - resolve a dispute
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { disputeId } = await params
    const body = await req.json()
    const { action, resolution, refundAmount, penaltyAmount } = body
    // action: 'resolve' | 'escalate'

    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } })
    if (!dispute) return NextResponse.json({ success: false, message: 'ไม่พบข้อพิพาท' }, { status: 404 })

    const updateData: Record<string, unknown> = {
      resolvedBy: auth.user.userId,
      resolvedAt: new Date(),
    }

    if (action === 'resolve') {
      updateData.status = 'resolved'
      updateData.resolution = resolution || null
      if (refundAmount != null) updateData.refundAmount = refundAmount
      if (penaltyAmount != null) updateData.penaltyAmount = penaltyAmount
    } else if (action === 'escalate') {
      updateData.status = 'escalated'
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    })

    return NextResponse.json({ success: true, dispute: updated })
  } catch (error) {
    console.error('Dispute resolve error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
