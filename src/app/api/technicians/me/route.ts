import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

// GET - technician's own profile & stats
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json(
        { success: false, message: 'ต้องเป็นช่างเท่านั้น' },
        { status: 403 }
      )
    }

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            createdAt: true,
          },
        },
        services: {
          include: {
            subCategory: {
              include: { category: true },
            },
          },
        },
        categories: {
          include: { category: true },
        },
        customCategories: true,
      },
    })

    if (!technician) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบโปรไฟล์ช่าง' },
        { status: 404 }
      )
    }

    // Get stats
    const [totalOrders, completedOrders, pendingOrders, totalEarnings] = await Promise.all([
      prisma.order.count({ where: { technicianId: technician.id } }),
      prisma.order.count({ where: { technicianId: technician.id, status: 'completed' } }),
      prisma.order.count({ where: { technicianId: technician.id, status: 'pending' } }),
      prisma.walletTransaction.aggregate({
        where: { userId: auth.user.userId, type: 'receive' },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      technician,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalEarnings: totalEarnings._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error('Technician me error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// PATCH - update technician profile
export async function PATCH(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    if (auth.user.role !== 'technician') {
      return NextResponse.json(
        { success: false, message: 'ต้องเป็นช่างเท่านั้น' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { profession, headline, bio, yearsExperience, hourlyRate, isAvailable, autoAccept, latitude, longitude, serviceRadius, certifications } = body

    const technician = await prisma.technician.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!technician) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบโปรไฟล์ช่าง' },
        { status: 404 }
      )
    }

    const updated = await prisma.technician.update({
      where: { id: technician.id },
      data: {
        ...(profession !== undefined && { profession }),
        ...(headline !== undefined && { headline }),
        ...(bio !== undefined && { bio }),
        ...(yearsExperience !== undefined && { yearsExperience }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(autoAccept !== undefined && { autoAccept }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(serviceRadius !== undefined && { serviceRadius: serviceRadius ? parseInt(serviceRadius) : null }),
      },
    })

    // Update certifications if provided (stored as JSON)
    if (certifications !== undefined) {
      await prisma.technician.update({
        where: { id: technician.id },
        data: { certifications },
      })
    }

    // Fetch updated technician
    const updatedTech = await prisma.technician.findUnique({ where: { id: technician.id } })

    return NextResponse.json({ success: true, technician: updatedTech })
  } catch (error) {
    console.error('Technician update error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
