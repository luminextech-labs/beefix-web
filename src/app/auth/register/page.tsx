'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🍖</span>
            <span className="font-bold text-3xl text-yellow-500">Beefix</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">สร้างบัญชีใหม่เพื่อใช้งาน</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          {/* Role selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'customer' })}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                form.role === 'customer'
                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-yellow-300'
              }`}
            >
              👤 ลูกค้า
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'technician' })}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                form.role === 'technician'
                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-yellow-300'
              }`}
            >
              🔧 ช่าง
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium">ชื่อ-นามสกุล</Label>
            <Input
              id="fullName"
              placeholder="สมชาย ใจดี"
              className="h-11"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="h-11"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="081-234-5678"
              className="h-11"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full h-11 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            disabled={loading}
          >
            {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/auth/login" className="text-yellow-600 hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  )
}
