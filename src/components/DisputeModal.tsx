'use client'
import { useState } from 'react'
import { disputesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

const DISPUTE_REASONS = [
  'ช่างไม่มาตามนัด',
  'ราคาไม่ตรงตามที่ตกลง',
  'งานเสร็จไม่สมบูรณ์',
  'คุณภาพงานไม่ดี',
  'ช่างขอเพิ่มเงินหลังจากเริ่มงาน',
  'ลูกค้าไม่ยอมรับการชำระเงิน',
  'อื่นๆ',
]

interface DisputeModalProps {
  orderId: string
  onSuccess: () => void
  onClose: () => void
}

export default function DisputeModal({ orderId, onSuccess, onClose }: DisputeModalProps) {
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const finalReason = reason === 'อื่นๆ' ? otherReason.trim() : reason
    if (!finalReason) {
      setError('กรุณาเลือกเหตุผล')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await disputesApi.open(orderId, {
        reason: finalReason,
        description: description.trim() || undefined,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">⚖️ เปิดข้อพิพาท</CardTitle>
          <p className="text-xs text-gray-500">แอดมินจะเป็นคนตัดสินข้อพิพาทนี้</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">เหตุผลที่เปิดข้อพิพาท</p>
            <div className="space-y-1.5">
              {DISPUTE_REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                    reason === r
                      ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === 'อื่นๆ' && (
              <input
                className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="ระบุเหตุผลอื่น..."
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
              />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม (ไม่บังคับ)</p>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="อธิบายปัญหาที่เกิดขึ้น..."
              rows={3}
              className="resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'กำลังส่ง…' : '⚖️ เปิดข้อพิพาท'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
