'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  customer: { fullName: string; avatarUrl: string | null }
  order: { id: string; title: string; jobDate: string | null }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: 14 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ marginRight: 1 }}>{i <= rating ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TechnicianReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingAvg, setRatingAvg] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'technician') return
    fetch('/api/technicians/me/reviews', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || [])
        setRatingAvg(data.ratingAvg || 0)
        setRatingCount(data.ratingCount || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  // Group by month/year
  const grouped: Record<string, Review[]> = {}
  reviews.forEach(r => {
    const d = new Date(r.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  })

  const monthLabels: Record<string, string> = {
    '2026-01': 'มกราคม 2569', '2026-02': 'กุมภาพันธ์ 2569',
    '2026-03': 'มีนาคม 2569', '2026-04': 'เมษายน 2569',
    '2026-05': 'พฤษภาคม 2569', '2026-06': 'มิถุนายน 2569',
    '2026-07': 'กรกฎาคม 2569', '2026-08': 'สิงหาคม 2569',
    '2026-09': 'กันยายน 2569', '2026-10': 'ตุลาคม 2569',
    '2026-11': 'พฤศจิกายน 2569', '2026-12': 'ธันวาคม 2569',
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100, fontFamily: 'Prompt, sans-serif' }}>
      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '12px 16px 16px',
        borderRadius: '0 0 24px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 16px rgba(255,184,0,0.2)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/profile" style={{ fontSize: 22, color: '#3D2C00', textDecoration: 'none' }}>←</Link>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>⭐ รีวิวจากลูกค้า</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Rating summary */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1.5px solid var(--border)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--primary)', lineHeight: 1, fontFamily: 'monospace' }}>
              {Number(ratingAvg).toFixed(1)}
            </div>
            <StarRating rating={Math.round(ratingAvg)} />
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
              {ratingCount} รีวิว
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length
              const pct = ratingCount > 0 ? (count / ratingCount) * 100 : 0
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#F59E0B', width: 14 }}>{star}★</span>
                  <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-light)', width: 24 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ กำลังโหลด...</div>
        ) : reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'white',
            borderRadius: 20,
            border: '1.5px dashed var(--border)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>⭐</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>ยังไม่มีรีวิว</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>รีวิวจะแสดงที่นี่หลังลูกค้าให้คะแนน</div>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, rs]) => (
              <div key={month} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-light)',
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: '1.5px solid var(--border)',
                }}>
                  {monthLabels[month] || month}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {rs.map(review => (
                    <div key={review.id} style={{
                      background: 'white',
                      borderRadius: 16,
                      padding: '14px 16px',
                      border: '1.5px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          flexShrink: 0,
                        }}>
                          {review.customer.avatarUrl ? (
                            <img src={review.customer.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                            {review.customer.fullName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <StarRating rating={review.rating} />
                            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <div style={{
                          fontSize: 13,
                          color: 'var(--text)',
                          lineHeight: 1.5,
                          padding: '8px 12px',
                          background: '#F9FAFB',
                          borderRadius: 10,
                          marginBottom: 6,
                        }}>
                          {review.comment}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                        📋 {review.order.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
