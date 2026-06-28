import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'

const addressSchema = z.object({
  label: z.string().min(1, 'กรุณาระบุป้ายชื่อ'),
  address: z.string().min(1, 'กรุณาระบุที่อยู่'),
  province: z.string().optional(),
  district: z.string().optional(),
  subDistrict: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().default(false),
})

// GET - list user's addresses
export async function GET(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const addresses = await prisma.address.findMany({
      where: { userId: auth.user.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, addresses })
  } catch (error) {
    console.error('Addresses GET error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// POST - create new address
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const result = addressSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // If this is default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.user.userId },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.user.userId,
        label: data.label,
        address: data.address,
        province: data.province,
        district: data.district,
        subDistrict: data.subDistrict,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault,
      },
    })

    return NextResponse.json({ success: true, address }, { status: 201 })
  } catch (error) {
    console.error('Addresses POST error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
