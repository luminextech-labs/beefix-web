import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email?.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณาใส่อีเมล' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      // ความปลอดภัย: ไม่บอกว่า email ไม่มีอยู่ในระบบ
      return NextResponse.json({ success: true, message: 'หากอีเมลนี้มีอยู่ในระบบ จะมีลิงก์ส่งไปยังกล่องเมลของคุณ' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: resetExpiry },
    })

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://beefix-web.vercel.app'
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`

    const sent = await sendResetPasswordEmail(user.email, resetLink, user.fullName)
    if (!sent) {
      return NextResponse.json({ success: false, message: 'ส่งอีเมลไม่ได้ กรุณาลองใหม่' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'หากอีเมลนี้มีอยู่ในระบบ จะมีลิงก์ส่งไปยังกล่องเมลของคุณ' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
