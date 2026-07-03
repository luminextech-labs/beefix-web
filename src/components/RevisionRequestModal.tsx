'use client'
import { useState } from 'react'
import { revisionsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RevisionRequestModalProps {
  orderId: string
  currentOrder: any
  onSuccess: () => void
  onClose: () => void
}

export default function RevisionRequestModal({ orderId, currentOrder, onSuccess, onClose }: RevisionRequestModalProps) {
  const [title, setTitle] = useState(currentOrder?.title || '')
  const [description, setDescription] = useState(currentOrder?.description || '')
  const [jobDate, setJobDate] = useState(
    currentOrder?.jobDate ? new Date(currentOrder.jobDate).toISOString().split('T')[0] : ''
  )
  const [jobTime, setJobTime] = useState(currentOrder?.jobTime || '')
  const [laborCost, setLaborCost] = useState(currentOrder?.laborCost?.toString() || '')
  const [travelCost, setTravelCost] = useState(currentOrder?.travelCost?.toString() || '')
  const [materialCost, setMaterialCost] = useState(currentOrder?.materialCost?.toString() || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await revisionsApi.create(orderId, {
        title: title || undefined,
        description: description || undefined,
        jobDate: jobDate || undefined,
        jobTime: jobTime || undefined,
        laborCost: laborCost ? parseFloat(laborCost) : undefined,
        travelCost: travelCost ? parseFloat(travelCost) : undefined,
        materialCost: materialCost ? parseFloat(materialCost) : undefined,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  const hasChanges =
    title !== (currentOrder?.title || '') ||
    description !== (currentOrder?.description || '') ||
    jobDate !== (currentOrder?.jobDate ? new Date(currentOrder.jobDate).toISOString().split('T')[0] : '') ||
    jobTime !== (currentOrder?.jobTime || '') ||
    laborCost !== (currentOrder?.laborCost?.toString() || '') ||
    travelCost !== (currentOrder?.travelCost?.toString() || '') ||
    materialCost !== (currentOrder?.materialCost?.toString() || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">📝 ขอแก้ไขรายละเอียดงาน</CardTitle>
          <p className="text-xs text-gray-500">อีกฝ่ายจะเห็นคำขอนี้และต้องอนุมัติ</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">ชื่องาน</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="ชื่องาน" />
          </div>
          <div>
            <Label className="text-sm">รายละเอียดเพิ่มเติม</Label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="รายละเอียดงานเพิ่มเติม..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">วันที่นัดหมาย</Label>
              <Input type="date" value={jobDate} onChange={e => setJobDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">เวลา</Label>
              <Input type="time" value={jobTime} onChange={e => setJobTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">ค่าแรง (บาท)</Label>
              <Input type="number" min="0" value={laborCost} onChange={e => setLaborCost(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-sm">ค่าเดินทาง</Label>
              <Input type="number" min="0" value={travelCost} onChange={e => setTravelCost(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-sm">ค่าวัสดุ</Label>
              <Input type="number" min="0" value={materialCost} onChange={e => setMaterialCost(e.target.value)} placeholder="0" />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>ยกเลิก</Button>
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={handleSubmit}
              disabled={submitting || !hasChanges}
            >
              {submitting ? 'กำลังส่ง…' : 'ส่งคำขอแก้ไข'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
