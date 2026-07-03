import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'
import { z } from 'zod'

// GET /api/sub-categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')

    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) where.categoryId = categoryId

    const subCategories = await prisma.subCategory.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    })

    return NextResponse.json({ success: true, subCategories })
  } catch (error) {
    console.error('SubCategories error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// POST /api/sub-categories - admin create
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin' && auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const body = await req.json()
    const { categoryId, name, icon } = body

    if (!categoryId || !name) {
      return NextResponse.json({ success: false, message: 'กรุณาใส่ข้อมูลให้ครบ' }, { status: 400 })
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const subCategory = await prisma.subCategory.create({
      data: { categoryId, name, slug, icon: icon || null },
    })

    return NextResponse.json({ success: true, subCategory }, { status: 201 })
  } catch (error) {
    console.error('SubCategories POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PATCH /api/sub-categories - admin update
export async function PATCH(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin' && auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const body = await req.json()
    const { id, name, icon, isActive } = body

    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      updateData.name = name
      updateData.slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
    if (icon !== undefined) updateData.icon = icon || null
    if (isActive !== undefined) updateData.isActive = isActive

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, subCategory })
  } catch (error) {
    console.error('SubCategories PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE /api/sub-categories - admin delete
export async function DELETE(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin' && auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 })

    await prisma.subCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SubCategories DELETE error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
