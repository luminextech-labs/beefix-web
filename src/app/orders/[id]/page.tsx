'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ordersApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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

function OrderDetailInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const orderId = searchParams.get('id') || ''
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (orderId) {
      ordersApi.getOne(orderId)
        .then(r => { if (r.success) setOrder(r.order) })
        .catch(() => setMessage('ไม่พบออร์เดอร์'))
        .finally(() => setLoading(false))
    }
  }, [orderId])

  const handleAction = async (newStatus: string, reason?: string) => {
    setActionLoading(true)
    setMessage('')
    try {
      const res = await ordersApi.update(orderId, { status: newStatus, cancelReason: reason })
      if (res.success) {
        setOrder({ ...order, status: newStatus })
        setMessage(newStatus === 'cancelled' ? 'ยกเลิกออร์เดอร์แล้ว' : 'อัปเดตสถานะแล้ว')
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <><Navbar /><div className="max-w-2xl mx-auto px-4 py-8"><div className="h-64 bg-gray-100 rounded-xl animate-pulse" /></div></>
  )

  if (!order) return (
    <><Navbar /><div className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500">{message || 'ไม่พบออร์เดอร์'}</div></>
  )

  const isCustomer = order.customerId === user?.id
  const isTech = order.technician?.userId === user?.id
  const canCancel = isCustomer && ['pending', 'confirmed'].includes(order.status)
  const canConfirm = isTech && order.status === 'pending'
  const canStart = isTech && order.status === 'confirmed'
  const canComplete = isTech && order.status === 'in_progress'
  const canReview = isCustomer && order.status === 'completed'

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('ยกเลิก') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{order.orderNo}</h1>
            <p className="text-sm text-gray-500">
              สร้างเมื่อ {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge className={`${STATUS_COLORS[order.status]} px-3 py-1 text-sm`}>
            {STATUS_TEXT[order.status]}
          </Badge>
        </div>

        {/* Service info */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold">{order.title}</h3>
            <p className="text-sm text-gray-500">{order.subCategory?.category?.name} → {order.subCategory?.name}</p>
            {order.description && <p className="text-sm mt-2">{order.description}</p>}
          </CardContent>
        </Card>

        {/* People */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">ลูกค้า</p>
              <p className="font-medium">{order.customer?.fullName}</p>
              <p className="text-sm text-gray-500">{order.customer?.phone}</p>
            </CardContent>
          </Card>
          {order.technician && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">ช่าง</p>
                <p className="font-medium">{order.technician.user?.fullName}</p>
                <p className="text-sm text-gray-500">{order.technician.user?.phone}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Job info */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่</span>
              <span>{order.jobDate ? new Date(order.jobDate).toLocaleDateString('th-TH') : '-'}</span>
            </div>
            {order.jobTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">เวลา</span>
                <span>{order.jobTime}</span>
              </div>
            )}
            {order.address && (
              <div className="flex justify-between">
                <span className="text-gray-500">ที่อยู่</span>
                <span className="text-right text-xs max-w-48">{order.address.address}</span>
              </div>
            )}
            {order.addressText && (
              <div className="flex justify-between">
                <span className="text-gray-500">ที่อยู่</span>
                <span className="text-right text-xs max-w-48">{order.addressText}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">สรุปราคา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>ค่าแรง</span>
              <span>฿{Number(order.laborCost).toLocaleString()}</span>
            </div>
            {Number(order.travelCost) > 0 && (
              <div className="flex justify-between">
                <span>ค่าเดินทาง</span>
                <span>฿{Number(order.travelCost).toLocaleString()}</span>
              </div>
            )}
            {Number(order.materialCost) > 0 && (
              <div className="flex justify-between">
                <span>ค่าวัสดุ</span>
                <span>฿{Number(order.materialCost).toLocaleString()}</span>
              </div>
            )}
            {Number(order.couponDiscount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด</span>
                <span>-฿{Number(order.couponDiscount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>ค่าธรรมเนียม (10%)</span>
              <span>฿{Number(order.platformFee).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>รวมทั้งหมด</span>
              <span className="text-yellow-600">฿{Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canConfirm && (
          <div className="flex gap-2">
            <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => handleAction('confirmed')} disabled={actionLoading}>
              {actionLoading ? '…' : '✅ ตอบรับงาน'}
            </Button>
            <Button variant="outline" className="flex-1 text-red-500" onClick={() => handleAction('cancelled', 'ช่างปฏิเสธงาน')} disabled={actionLoading}>
              ปฏิเสธ
            </Button>
          </div>
        )}
        {canStart && (
          <Button className="w-full bg-purple-500 hover:bg-purple-600" onClick={() => handleAction('in_progress')} disabled={actionLoading}>
            {actionLoading ? '…' : '🚀 เริ่มดำเนินงาน'}
          </Button>
        )}
        {canComplete && (
          <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => handleAction('completed')} disabled={actionLoading}>
            {actionLoading ? '…' : '✅ งานเสร็จสิ้น'}
          </Button>
        )}
        {canCancel && (
          <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleAction('cancelled', 'ลูกค้ายกเลิก')} disabled={actionLoading}>
            {actionLoading ? '…' : '❌ ยกเลิกออร์เดอร์'}
          </Button>
        )}

        {/* Back */}
        <Button variant="ghost" className="w-full mt-4" onClick={() => router.push('/orders')}>
          ← กลับไปรายการออร์เดอร์
        </Button>
      </main>
    </>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<><Navbar /><div className="max-w-2xl mx-auto px-4 py-8"><div className="h-64 bg-gray-100 rounded-xl animate-pulse" /></div></>}>
      <OrderDetailInner />
    </Suspense>
  )
}
