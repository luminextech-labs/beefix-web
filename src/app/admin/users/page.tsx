'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  technician: 'bg-blue-100 text-blue-700',
  customer: 'bg-gray-100 text-gray-600',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    api.get<{ success: boolean; user: any }>('/api/auth/me')
      .then(res => { if (!res.success || res.user.role !== 'admin') router.push('/') })
      .catch(() => router.push('/'))
  }, [router])

  useEffect(() => {
    loadUsers(1)
  }, [roleFilter])

  const loadUsers = (pageNum: number) => {
    setLoading(true)
    api.get<{ success: boolean; users: any[]; total: number }>(
      `/api/admin/users?page=${pageNum}&role=${roleFilter}&search=${filter}`
    )
      .then(r => {
        if (r.success) {
          setUsers(r.users || [])
          setTotal(r.total || 0)
        }
      })
      .finally(() => setLoading(false))
  }

  const handleSearch = () => {
    loadUsers(1)
    setPage(1)
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900">👥 จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-gray-500 mt-1">ดูและจัดการช่างและลูกค้าในระบบ</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {['all', 'technician', 'customer'].map(role => (
              <button
                key={role}
                onClick={() => { setRoleFilter(role); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  roleFilter === role
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {role === 'all' ? 'ทั้งหมด' : role === 'technician' ? '🔧 ช่าง' : '👤 ลูกค้า'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-yellow-500 hover:bg-yellow-600 text-black">ค้นหา</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {total}
              </div>
              <div className="text-xs text-blue-500 font-medium">ผู้ใช้ทั้งหมด</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}</div>
        ) : users.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-500">ไม่พบผู้ใช้งาน</CardContent></Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ผู้ใช้</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">บทบาท</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">วันที่สมัคร</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-700">
                            {user.fullName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                            {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}>
                          {user.role === 'technician' ? '🔧 ช่าง' : user.role === 'admin' ? '🛠️ Admin' : '👤 ลูกค้า'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <span className="text-green-600 text-xs font-medium">● เปิดใช้งาน</span>
                        ) : (
                          <span className="text-red-500 text-xs font-medium">● ระงับ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        {user.role === 'technician' && (
                          <Link href={`/admin/users/${user.id}`}>
                            <button className="text-sm text-blue-600 hover:underline">ดูโปรไฟล์</button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => { setPage(p => Math.max(1, p - 1)); loadUsers(page - 1) }} disabled={page <= 1}>
                  ← ก่อนหน้า
                </Button>
                <span className="text-sm text-gray-500">หน้า {page} จาก {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => { setPage(p => p + 1); loadUsers(page + 1) }} disabled={page >= totalPages}>
                  ถัดไป →
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
