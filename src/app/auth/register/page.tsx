'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-yellow-600">สมัครสมาชิก</CardTitle>
          <CardDescription>สร้างบัญชีใหม่เพื่อใช้งาน Beefix</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}

            {/* Role selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'customer' })}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  form.role === 'customer'
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white border-gray-200 hover:border-yellow-300'
                }`}
              >
                👤 ลูกค้า
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'technician' })}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  form.role === 'technician'
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white border-gray-200 hover:border-yellow-300'
                }`}
              >
                🔧 ช่าง
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
              <Input
                id="fullName"
                placeholder="สมชาย มากมาย"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="081-234-5678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/auth/login" className="text-yellow-600 hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
