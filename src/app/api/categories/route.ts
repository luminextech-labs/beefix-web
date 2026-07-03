import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authGuard } from '@/lib/auth/guard'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
})

// GET /api/categories - public list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const admin = searchParams.get('admin') === 'true'

    const where = admin ? {} : { isActive: true }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          where: admin ? {} : { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, categories, total: categories.length })
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// POST /api/categories - admin create
export async function POST(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin' && auth.user.role !== 'technician') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const body = await req.json()
    const result = categorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.issues[0].message }, { status: 400 })
    }

    const { name, icon, sortOrder } = result.data
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const category = await prisma.category.create({
      data: { name, slug, icon: icon || null, sortOrder },
      include: { subCategories: true },
    })

    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PATCH /api/categories - admin update
export async function PATCH(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const body = await req.json()
    const { id, name, icon, sortOrder, isActive } = body

    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      updateData.name = name
      updateData.slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
    if (icon !== undefined) updateData.icon = icon || null
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (isActive !== undefined) updateData.isActive = isActive

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: { subCategories: true },
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Categories PATCH error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE /api/categories - admin delete
export async function DELETE(req: NextRequest) {
  try {
    const auth = authGuard(req)
    if (auth instanceof NextResponse) return auth
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 })

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Categories DELETE error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
