'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ordersApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const STATUS_TEXT: Record<string, string> = {
  pending: 'รอตอบรับ',
  confirmed: 'ยืนยันแล้ว',
  in_progress: 'กำลังดำเนินงาน',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth/login'
      return
    }
    if (user) {
      ordersApi.getAll()
        .then(r => setOrders(r.orders))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user, authLoading])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">ออร์เดอร์ของฉัน</h1>
          <Link href="/booking">
            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">+ จองช่างใหม่</Button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                filter === s
                  ? 'bg-yellow-500 text-black font-medium'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : STATUS_TEXT[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <p className="text-4xl mb-2">📋</p>
              <p>ยังไม่มีออร์เดอร์</p>
              <Link href="/booking">
                <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">จองช่างเลย</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <Link key={order.id} href={`/orders?id=${order.id}`}>
                <Card className="hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{order.orderNo}</span>
                          <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100'}>
                            {STATUS_TEXT[order.status] || order.status}
                          </Badge>
                        </div>
                        <p className="font-medium">{order.title}</p>
                        <p className="text-sm text-gray-500">
                          {order.subCategory?.category?.name} → {order.subCategory?.name}
                        </p>
                        {order.technician && (
                          <p className="text-sm text-gray-500 mt-1">
                            🔧 {order.technician.user?.fullName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">
                          ฿{Number(order.totalAmount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
