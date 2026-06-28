'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', phone: '', password: '', fullName: '', role: 'customer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 48 }}>🍖</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>Beefix</span>
          </Link>
          <p style={{ color: 'var(--text-light)', marginTop: 8, fontSize: 14 }}>สร้างบัญชีใหม่เพื่อใช้งาน</p>
        </div>

        {/* Form card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '24px' }}>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Role selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { val: 'customer', label: '👤 ลูกค้า' },
              { val: 'technician', label: '🔧 ช่าง' },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => setForm({ ...form, role: r.val })}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${form.role === r.val ? 'var(--primary)' : '#E5E7EB'}`,
                  background: form.role === r.val ? 'var(--primary)' : 'white',
                  color: form.role === r.val ? '#3D2C00' : '#9CA3AF',
                  fontSize: 14, fontWeight: 700, fontFamily: 'Prompt, sans-serif',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>ชื่อ-นามสกุล</label>
            <input
              type="text"
              className="form-input"
              placeholder="สมชาย ใจดี"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>อีเมล</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>เบอร์โทรศัพท์</label>
            <input
              type="tel"
              className="form-input"
              placeholder="081-234-5678"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>รหัสผ่าน</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
