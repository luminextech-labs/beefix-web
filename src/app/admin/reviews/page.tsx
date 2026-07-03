'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

export default function AdminReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    loadReviews(page)
  }, [page])

  const loadReviews = (pageNum: number) => {
    setLoading(true)
    api.get<{ success: boolean; reviews: any[]; pagination: any }>(
      `/api/reviews?page=${pageNum}&limit=20`
    ).then(r => {
      if (r.success) {
        setReviews(r.reviews || [])
        setTotal(r.pagination.total || 0)
        setTotalPages(r.pagination.totalPages || 1)
      }
    }).finally(() => setLoading(false))
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900">⭐ รีวิวทั้งหมด</h1>
          <p className="text-sm text-gray-500 mt-1">ดูรีวิวจากลูกค้าทั้งหมดในระบบ</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{total}</div>
            <div className="text-xs text-yellow-500">รีวิวทั้งหมด</div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">ยังไม่มีรีวิว</div>
        ) : (
          <>
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{review.customer?.fullName}</div>
                      <div className="text-xs text-gray-400">
                        ถึง {review.technician?.user?.fullName || 'ช่าง'}
                        · {review.order?.orderNo || ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">{'⭐'.repeat(review.rating)}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mb-2">"{review.comment}"</p>
                  )}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {review.tags.map((tag: string) => (
                        <span key={tag} className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium border border-yellow-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {review.technicianReply && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border-l-2 border-yellow-400">
                      <span className="font-semibold">ช่างตอบ: </span>{review.technicianReply}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-40"
                >← ก่อนหน้า</button>
                <span className="text-sm text-gray-500">หน้า {page} จาก {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-40"
                >ถัดไป →</button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
