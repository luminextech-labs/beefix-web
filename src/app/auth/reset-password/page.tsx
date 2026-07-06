'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: 24, maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🔑</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>ลิงก์ไม่ถูกต้อง</h2>
          <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 20 }}>
            ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุ<br/>กรุณาขอลิงก์ใหม่อีกครั้ง
          </p>
          <Link href="/auth/forgot-password">
            <button style={{ padding: '12px 24px', borderRadius: 30, border: '2px solid var(--primary)', background: 'white', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
              ขอลิงก์ใหม่
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!password) { setError('กรุณาใส่รหัสผ่าน'); return }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
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
        {done ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>รีเซ็ตรหัสผ่านสำเร็จ!</h2>
            <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย
            </p>
            <Link href="/auth/login">
              <button style={{ width: '100%', padding: '15px 0', borderRadius: 30, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,184,0,0.3)' }}>
                🔐 เข้าสู่ระบบ
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>🔑</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>ตั้งรหัสผ่านใหม่</h1>
              <p style={{ fontSize: 13, color: 'var(--text-light)' }}>ใส่รหัสผ่านใหม่ของคุณ</p>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>
                🔐 รหัสผ่านใหม่
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }}
              />
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>
                🔐 ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
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
              {loading ? 'กำลังบันทึก...' : '✅ บันทึกรหัสผ่านใหม่'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
