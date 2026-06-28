import { NextRequest, NextResponse } from 'next/server'
import { getMe } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const user = await getMe(token)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
