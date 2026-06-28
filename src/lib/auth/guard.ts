import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload } from './jwt'

export function authGuard(
  req: NextRequest
): { user: JwtPayload; token: string } | NextResponse {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'กรุณาเข้าสู่ระบบ' },
      { status: 401 }
    )
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
      { status: 401 }
    )
  }

  return { user: payload, token }
}

export function requireRole(...roles: string[]) {
  return (req: NextRequest) => {
    const result = authGuard(req)
    if (result instanceof NextResponse) return result

    if (!roles.includes(result.user.role)) {
      return NextResponse.json(
        { success: false, message: 'คุณไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    return null
  }
}
