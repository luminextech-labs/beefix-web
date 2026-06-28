import { NextRequest, NextResponse } from 'next/server'
import { login, loginSchema } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    // Login
    const authResult = await login(result.data)

    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 })
    }

    return NextResponse.json(authResult)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    )
  }
}
