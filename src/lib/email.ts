import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendResetPasswordEmail(email: string, resetLink: string, fullName: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Beefix" <noreply@beefix.app>',
      to: email,
      subject: '🔑 รีเซ็ตรหัสผ่าน Beefix ของคุณ',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #F59E0B; margin: 0;">🍖 Beefix</h1>
          </div>
          <div style="border: 1px solid #eee; border-radius: 16px; padding: 24px;">
            <h2 style="margin: 0 0 16px; color: #333;">สวัสดีครับ ${fullName},</h2>
            <p style="color: #555; line-height: 1.6;">
              เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี <strong>${email}</strong>
            </p>
            <p style="color: #555; line-height: 1.6;">
              กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #F59E0B; color: #3D2C00; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 30px; font-size: 16px;">
                🔑 ตั้งรหัสผ่านใหม่
              </a>
            </div>
            <p style="color: #888; font-size: 13px; line-height: 1.6;">
              ลิงก์นี้จะหมดอายุใน <strong>30 นาที</strong><br/>
              หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
            © 2026 Beefix.app
          </div>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
