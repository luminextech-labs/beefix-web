import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subCategoryId = searchParams.get('subCategoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {
      isAvailable: true,
      user: { isActive: true },
    }

    if (subCategoryId) {
      where.services = {
        some: {
          subCategoryId,
        },
      }
    }

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ratingAvg: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              phone: true,
            },
          },
          services: {
            where: subCategoryId ? { subCategoryId } : undefined,
            include: {
              subCategory: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.technician.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      technicians,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Technicians error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
