'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { api } from '@/lib/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    // Check role
    api.get<{ success: boolean; user: any }>('/api/auth/me')
      .then(res => {
        if (!res.success || res.user.role !== 'admin') {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))

    // Fetch stats
    Promise.all([
      api.get<{ success: boolean; total: number }>('/api/orders?limit=1'),
      api.get<{ success: boolean; total: number }>('/api/categories'),
    ]).then(([ordersRes, catsRes]) => {
      setStats({
        orders: ordersRes.total || 0,
        categories: catsRes.total || 0,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [router])

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">จัดการระบบ Beefix</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ออร์เดอร์ทั้งหมด', value: stats?.orders ?? '-', icon: '📋', color: 'bg-blue-50' },
            { label: 'หมวดหมู่', value: stats?.categories ?? '-', icon: '📂', color: 'bg-green-50' },
            { label: 'ช่าง', value: '-', icon: '🔧', color: 'bg-yellow-50' },
            { label: 'ลูกค้า', value: '-', icon: '👥', color: 'bg-purple-50' },
          ].map(item => (
            <div key={item.label} className={`${item.color} rounded-2xl p-5`}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500 font-medium">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Management cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: '📂 จัดการหมวดหมู่',
              desc: 'เพิ่ม แก้ไข ลบหมวดหมู่บริการ',
              href: '/admin/categories',
              color: 'from-green-50 to-green-100 border-green-200',
            },
            {
              title: '👥 จัดการผู้ใช้งาน',
              desc: 'ดูรายช่างและลูกค้าในระบบ',
              href: '/admin/users',
              color: 'from-blue-50 to-blue-100 border-blue-200',
            },
            {
              title: '📋 จัดการออร์เดอร์',
              desc: 'ดูและแก้ไขออร์เดอร์ทั้งหมด',
              href: '/orders',
              color: 'from-yellow-50 to-yellow-100 border-yellow-200',
            },
            {
              title: '⭐ รีวิวทั้งหมด',
              desc: 'ดูรีวิวจากลูกค้าทั้งหมด',
              href: '/admin/reviews',
              color: 'from-purple-50 to-purple-100 border-purple-200',
            },
            {
              title: '⚖️ ข้อพิพาท',
              desc: 'ดูและตัดสินข้อพิพาท',
              href: '/admin/disputes',
              color: 'from-red-50 to-red-100 border-red-200',
            },
          ].map(card => (
            <Link key={card.href} href={card.href}>
              <div className={`bg-gradient-to-br ${card.color} border rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer`}>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
