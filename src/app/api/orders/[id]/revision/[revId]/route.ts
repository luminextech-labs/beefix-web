import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// PATCH - approve or reject a revision
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; revId: string }> }
) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const { id, revId } = await params
    const body = await req.json()
    const { action, note } = body // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    }

    const revision = await prisma.orderRevision.findUnique({
      where: { id: revId },
      include: { order: true },
    })

    if (!revision || revision.orderId !== id) {
      return NextResponse.json({ success: false, message: 'ไม่พบคำขอ' }, { status: 404 })
    }

    // The reviewer is the OTHER party (not the one who requested)
    const isCustomer = revision.order.customerId === auth.user.userId
    const isTech = revision.order.technicianId === auth.user.userId
    const isOtherParty = revision.requestedBy !== auth.user.userId

    if (!isOtherParty) {
      return NextResponse.json({ success: false, message: 'คุณไม่สามารถอนุมัติคำขอของตัวเอง' }, { status: 403 })
    }

    if (action === 'approve') {
      // Apply revision changes to order
      const updateData: Record<string, unknown> = {}
      if (revision.title) updateData.title = revision.title
      if (revision.description !== null) updateData.description = revision.description
      if (revision.jobDate) updateData.jobDate = revision.jobDate
      if (revision.jobTime) updateData.jobTime = revision.jobTime
      if (revision.laborCost !== null) updateData.laborCost = revision.laborCost
      if (revision.travelCost !== null) updateData.travelCost = revision.travelCost
      if (revision.materialCost !== null) updateData.materialCost = revision.materialCost

      // Recalculate total
      const labor = Number(revision.laborCost ?? revision.order.laborCost)
      const travel = Number(revision.travelCost ?? revision.order.travelCost)
      const material = Number(revision.materialCost ?? revision.order.materialCost)
      const subtotal = labor + travel + material
      updateData.totalAmount = Math.max(0,
        subtotal
        + Number(revision.order.platformFee)
        - Number(revision.order.couponDiscount)
      )

      await prisma.$transaction([
        prisma.order.update({ where: { id }, data: updateData }),
        prisma.orderRevision.update({
          where: { id: revId },
          data: { status: 'approved', note: note || null, resolvedAt: new Date() },
        }),
      ])
    } else {
      await prisma.orderRevision.update({
        where: { id: revId },
        data: { status: 'rejected', note: note || null, resolvedAt: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revision PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
