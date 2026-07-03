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
import { Textarea } from '@/components/ui/textarea'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  escalated: 'bg-orange-100 text-orange-700',
}

export default function AdminDisputesPage() {
  const router = useRouter()
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [total, setTotal] = useState(0)

  // Resolve modal
  const [resolveTarget, setResolveTarget] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [penaltyAmount, setPenaltyAmount] = useState('')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    api.get<{ success: boolean; user: any }>('/api/auth/me')
      .then(res => { if (!res.success || res.user.role !== 'admin') router.push('/') })
      .catch(() => router.push('/'))
  }, [router])

  useEffect(() => { loadDisputes(1) }, [statusFilter])

  const loadDisputes = (pageNum: number) => {
    setLoading(true)
    api.get<{ success: boolean; disputes: any[]; pagination: any }>(
      `/api/admin/disputes?page=${pageNum}&status=${statusFilter}`
    ).then(r => {
      if (r.success) {
        setDisputes(r.disputes || [])
        setTotal(r.pagination.total || 0)
        setTotalPages(r.pagination.totalPages || 1)
        setPage(pageNum)
      }
    }).finally(() => setLoading(false))
  }

  const handleResolve = async () => {
    if (!resolveTarget) return
    setResolving(true)
    try {
      await api.patch(`/api/admin/disputes/${resolveTarget.id}`, {
        action: 'resolve',
        resolution: resolution.trim(),
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        penaltyAmount: penaltyAmount ? parseFloat(penaltyAmount) : undefined,
      })
      setResolveTarget(null)
      setResolution('')
      setRefundAmount('')
      setPenaltyAmount('')
      loadDisputes(page)
    } catch (e) {
      console.error(e)
    } finally {
      setResolving(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900">⚖️ จัดการข้อพิพาท</h1>
          <p className="text-sm text-gray-500 mt-1">ตรวจสอบและตัดสินข้อพิพาทระหว่างลูกค้ากับช่าง</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{total}</div>
              <div className="text-xs text-red-500">ข้อพิพาททั้งหมด</div>
            </CardContent>
          </Card>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-4">
          {['all', 'open', 'resolved', 'escalated'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                statusFilter === s ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : s === 'open' ? '🔴 เปิด' : s === 'resolved' ? '🟢 ระงับแล้ว' : '🟠 escalate'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}</div>
        ) : disputes.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-400">ไม่มีข้อพิพาท</CardContent></Card>
        ) : (
          <>
            <div className="space-y-3">
              {disputes.map(d => (
                <Card key={d.id} className="border-red-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{d.order?.orderNo}</span>
                          <Badge className={`${STATUS_COLORS[d.status]} text-xs`}>
                            {d.status === 'open' ? '🔴 เปิด' : d.status === 'resolved' ? '🟢 ระงับแล้ว' : '🟠 escalate'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{d.order?.title}</p>
                        <p className="text-xs text-gray-400">
                          ลูกค้า: {d.order?.customer?.fullName} · ช่าง: {d.order?.technician?.user?.fullName}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {new Date(d.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Dispute details */}
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-red-700 mb-1">เหตุผล: {d.reason}</p>
                      {d.description && <p className="text-sm text-red-600">{d.description}</p>}
                      <p className="text-xs text-gray-500 mt-1">เปิดโดย: {d.openedBy}</p>
                    </div>

                    {/* Resolution (if resolved) */}
                    {d.status === 'resolved' && d.resolution && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">ผลตัดสิน:</p>
                        <p className="text-sm text-green-800">{d.resolution}</p>
                        {(d.refundAmount > 0 || d.penaltyAmount > 0) && (
                          <p className="text-xs text-green-600 mt-1">
                            {d.refundAmount > 0 && `คืนเงิน: ฿${Number(d.refundAmount).toLocaleString()}`}
                            {d.penaltyAmount > 0 && `ค่าปรับ: ฿${Number(d.penaltyAmount).toLocaleString()}`}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {d.status === 'open' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => setResolveTarget(d)}
                        >
                          ⚖️ ตัดสิน
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-200"
                          onClick={async () => {
                            await api.patch(`/api/admin/disputes/${d.id}`, { action: 'escalate' })
                            loadDisputes(page)
                          }}
                        >
                          🚨 Escalate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button variant="outline" size="sm" onClick={() => loadDisputes(page - 1)} disabled={page <= 1}>← ก่อนหน้า</Button>
                <span className="text-sm text-gray-500">หน้า {page} จาก {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => loadDisputes(page + 1)} disabled={page >= totalPages}>ถัดไป →</Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Resolve modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">⚖️ ตัดสินข้อพิพาท</h2>
            <p className="text-sm text-gray-500">ออร์เดอร์: {resolveTarget.order?.orderNo} — {resolveTarget.order?.title}</p>
            <p className="text-sm font-medium text-red-600">เหตุผล: {resolveTarget.reason}</p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">ผลตัดสิน</label>
                <Textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  placeholder="ระบุผลตัดสิน..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">คืนเงิน (บาท)</label>
                  <Input type="number" min="0" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ค่าปรับ (บาท)</label>
                  <Input type="number" min="0" value={penaltyAmount} onChange={e => setPenaltyAmount(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setResolveTarget(null)}>ยกเลิก</Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={handleResolve} disabled={resolving}>
                {resolving ? 'กำลัง...' : '✅ บันทึกผลตัดสิน'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
