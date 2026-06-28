import { NextRequest, NextResponse } from 'next/server'
import { register, registerSchema } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    // Register
    const authResult = await register(result.data)

    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 400 })
    }

    return NextResponse.json(authResult, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    )
  }
}
