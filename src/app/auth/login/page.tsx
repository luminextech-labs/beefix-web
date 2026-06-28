'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🍖</span>
            <span className="font-bold text-3xl text-yellow-500">Beefix</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">เข้าสู่ระบบเพื่อจองช่าง</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

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
            <Label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full h-11 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          ยังไม่มีบัญชี?{' '}
          <Link href="/auth/register" className="text-yellow-600 hover:underline font-medium">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </main>
  )
}
