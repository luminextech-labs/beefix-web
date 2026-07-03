import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subCategoryId = searchParams.get('subCategoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const maxKm = parseFloat(searchParams.get('maxKm') || '0')

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

    const technicians = await prisma.technician.findMany({
      where,
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
    })

    // Filter by distance if coordinates provided
    let filtered = technicians
    if (lat && lng && maxKm > 0) {
      filtered = technicians
        .map(tech => {
          const tLat = Number(tech.latitude)
          const tLng = Number(tech.longitude)
          if (!tLat || !tLng) return { ...tech, distanceKm: null }

          const km = haversineKm(lat, lng, tLat, tLng)
          return { ...tech, distanceKm: Math.round(km * 10) / 10 }
        })
        .filter(tech => tech.distanceKm !== null && tech.distanceKm <= maxKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    } else {
      filtered = technicians.map(tech => ({ ...tech, distanceKm: null }))
    }

    // Paginate after distance filter
    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      success: true,
      technicians: paginated,
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
