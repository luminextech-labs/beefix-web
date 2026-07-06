'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) { setError('กรุณาใส่อีเมล'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '20px 16px', maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🔑</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>ลืมรหัสผ่าน?</h1>
          <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5 }}>
            ใส่อีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้
          </p>
        </div>

        {sent ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>ส่งอีเมลแล้ว!</div>
            <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20 }}>
              หากอีเมล <strong>{email}</strong> มีอยู่ในระบบ จะมีลิงก์ตั้งรหัสผ่านใหม่ส่งไปถึงคุณภายในไม่กี่นาที
            </p>
            <Link href="/auth/login">
              <button style={{ width: '100%', padding: '14px 0', borderRadius: 30, border: '2px solid var(--primary)', background: 'white', color: 'var(--primary)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>
                📧 อีเมลที่ใช้สมัคร
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="your@email.com"
                autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 10, color: '#DC2626', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '15px 0',
                borderRadius: 30, border: 'none',
                background: loading ? '#E5E5E5' : 'var(--primary)',
                color: loading ? '#999' : '#3D2C00',
                fontSize: 16, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,184,0,0.3)',
                fontFamily: 'Prompt, sans-serif', marginBottom: 20,
              }}
            >
              {loading ? 'กำลังส่งอีเมล...' : '📧 ส่งลิงก์ตั้งรหัสผ่านใหม่'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-light)' }}>
              ยังไม่มีบัญชี?{' '}
              <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>สมัครสมาชิก</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
