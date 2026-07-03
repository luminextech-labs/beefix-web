'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReviewModalProps {
  orderId: string
  technicianName: string
  onSuccess: () => void
  onClose: () => void
}

const RATING_LABELS = ['แย่มาก', 'ไม่ดี', 'พอใช้', 'ดี', 'ดีมาก']
const SUGGESTED_TAGS = ['ช่างตรงเวลา', 'ทำงานสะอาด', 'ราคาเหมาะสม', 'บริการดี', 'มืออาชีพ', 'ติดต่อสื่อสารดี']

export default function ReviewModal({ orderId, technicianName, onSuccess, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const displayRating = hoverRating || rating

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('กรุณาให้คะแนน')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/reviews', {
        orderId,
        rating,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">รีวิวช่าง</CardTitle>
          <p className="text-sm text-gray-500">ให้คะแนนประสบการณ์การใช้บริการ</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Technician name */}
          <div className="text-center">
            <p className="font-medium text-gray-800">{technicianName}</p>
          </div>

          {/* Star rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                >
                  {star <= displayRating ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm font-medium text-yellow-600">
                {RATING_LABELS[displayRating - 1]}
              </p>
            )}
          </div>

          {/* Suggested tags */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">แท็ก (เลือกได้หลายอัน)</Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">ความคิดเห็น (ไม่บังคับ)</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="เล่าประสบการณ์การใช้บริการ..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? 'กำลังส่ง…' : 'ส่งรีวิว'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
