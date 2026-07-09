'use client'
import Link from 'next/link'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { techniciansApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type PortfolioItem = {
  id: string
  images: string[]
  caption?: string
  likeCount: number
  commentCount: number
  likedByUser: boolean
  createdAt: string
  _count?: { likes: number; comments: number }
  likes?: { userId: string }[]
}

type Comment = {
  id: string
  content: string
  createdAt: string
  user: { id: string; fullName: string; avatarUrl?: string }
}

function TechProfileInner() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const techId = params.id as string
  const [tech, setTech] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)
  const [viewingAvatar, setViewingAvatar] = useState<string | null>(null)
  const [viewingCertImage, setViewingCertImage] = useState<string | null>(null)

  // Like / Comment state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [likingId, setLikingId] = useState<string | null>(null)
  const [commentItemId, setCommentItemId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<any>(null)

  const commentInputRef = useRef<HTMLInputElement>(null)

  const reloadTech = () => {
    if (!techId) return
    techniciansApi.getPublicProfile(techId)
      .then((res: any) => {
        if (res.success) {
          setTech(res.technician)
          setPortfolio(res.technician.portfolioItems || [])
        }
      })
  }

  useEffect(() => {
    if (!techId) { setError('ไม่พบ ID ช่าง'); setLoading(false); return }
    techniciansApi.getPublicProfile(techId)
      .then((res: any) => {
        if (res.success) {
          setTech(res.technician)
          setPortfolio(res.technician.portfolioItems || [])
        }
        else setError(res.message || 'ไม่พบโปรไฟล์')
      })
      .catch(() => setError('โหลดโปรไฟล์ไม่ได้'))
      .finally(() => setLoading(false))
  }, [techId])

  const handleLike = async (item: PortfolioItem) => {
    if (!user) { alert('กรุณาเข้าสู่ระบบก่อน'); return }
    if (likingId) return
    setLikingId(item.id)
    setPortfolio(prev => prev.map(p =>
      p.id === item.id
        ? { ...p, likedByUser: !p.likedByUser, likeCount: p.likedByUser ? p.likeCount - 1 : p.likeCount + 1 }
        : p
    ))
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`/api/portfolio/${item.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!data.success) {
        setPortfolio(prev => prev.map(p =>
          p.id === item.id
            ? { ...p, likedByUser: !p.likedByUser, likeCount: p.likedByUser ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        ))
      }
    } catch (err) {
      console.error('Like error:', err)
      setPortfolio(prev => prev.map(p =>
        p.id === item.id
          ? { ...p, likedByUser: !p.likedByUser, likeCount: p.likedByUser ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      ))
    } finally {
      setLikingId(null)
    }
  }

  const handleShare = (item: PortfolioItem) => {
    const url = `${window.location.origin}/technicians/${techId}`
    if (navigator.share) {
      navigator.share({ title: `${tech?.user?.fullName} - ผลงาน`, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว!')
    }
  }

  const loadComments = async (itemId: string) => {
    try {
      const res = await fetch(`/api/portfolio/${itemId}/comment`)
      const data = await res.json()
      if (data.success) {
        setComments(prev => ({ ...prev, [itemId]: data.comments }))
      }
    } catch {}
  }

  const toggleComments = (itemId: string) => {
    if (showComments === itemId) {
      setShowComments(null)
    } else {
      setShowComments(itemId)
      loadComments(itemId)
    }
  }

  const handleComment = async (itemId: string) => {
    if (!user) { alert('กรุณาเข้าสู่ระบบก่อน'); return }
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`/api/portfolio/${itemId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: commentText }),
      })
      const data = await res.json()
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [itemId]: [...(prev[itemId] || []), data.comment],
        }))
        setPortfolio(prev => prev.map(p =>
          p.id === itemId ? { ...p, commentCount: p.commentCount + 1 } : p
        ))
        setCommentText('')
      }
    } catch {} finally {
      setCommentLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>👨🔧</div><div>กำลังโหลด...</div></div>
    </div>
  )

  if (error || !tech) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>😕</div><div>{error || 'ไม่พบโปรไฟล์'}</div></div>
    </div>
  )

  const userData = tech.user

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* IMAGE VIEWER */}
      {viewingImages && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column' }} onClick={() => setViewingImages(null)}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
            <button onClick={() => setViewingImages(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 16px', overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600 }}>
              {viewingImages.map((url: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" style={{ width: '100%', maxWidth: 280, maxHeight: 400, objectFit: 'cover', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AVATAR VIEWER */}
      {viewingAvatar && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setViewingAvatar(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: 16, position: 'absolute', top: 0, right: 0 }}>
            <button onClick={() => setViewingAvatar(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingAvatar} alt="รูปโปรไฟล์" style={{ width: 280, height: 280, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', display: 'block' }} />
            <div style={{ color: '#fff', marginTop: 12, fontSize: 14, fontWeight: 600, opacity: 0.8 }}>{userData?.fullName}</div>
          </div>
        </div>
      )}

      {/* CERT IMAGE VIEWER */}
      {viewingCertImage && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}
          onClick={() => setViewingCertImage(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
            <button onClick={() => setViewingCertImage(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 16px', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewingCertImage} alt="ใบรับรอง" style={{ width: '100%', maxWidth: 500, borderRadius: 12, objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* ===================== BLOCK 1: PROFILE HEADER ===================== */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D2C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
        </div>
        <div
          onClick={() => userData?.avatarUrl && setViewingAvatar(userData.avatarUrl)}
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-dark)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.5)', cursor: userData?.avatarUrl ? 'zoom-in' : 'default', position: 'relative' }}
        >
          {userData?.avatarUrl ? (
            <img src={userData.avatarUrl} alt={userData?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{userData?.fullName?.charAt(0) || '?'}</span>
          )}
          {userData?.avatarUrl && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(255,255,255,0.85)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '1.5px solid white' }}>🔍</div>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>{userData?.fullName}</div>
        {tech.headline && <div style={{ fontSize: 13, color: '#3D2C00', opacity: 0.85, marginTop: 4 }}>{tech.headline}</div>}

        {/* Availability badge */}
        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: tech.isAvailable ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: 20, padding: '4px 14px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tech.isAvailable ? '#22c55e' : '#94a3b8' }} />
          <span style={{ fontSize: 12, color: '#3D2C00', fontWeight: 600 }}>
            {tech.isAvailable ? 'พร้อมรับงาน' : 'ไม่รับงาน'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>⭐ {Number(tech.ratingAvg || 0).toFixed(1)}</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.7 }}>คะแนนเฉลี่ย</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>{tech.ratingCount || 0}</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.7 }}>รีวิว</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>{tech.yearsExperience || 0}</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.7 }}>ปีประสบการณ์</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -30 }}>

        {/* ===================== BLOCK 2: ABOUT ===================== */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>👤 เกี่ยวกับช่าง</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6 }}>
            {tech.bio || 'ยังไม่มีรายละเอียด'}
          </div>
          {tech.hourlyRate && (
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
              💰 ค่าแรง {tech.hourlyRate} บาท/ชม.
            </div>
          )}
        </div>

        {/* ===================== BLOCK 3: SERVICES ===================== */}
        {tech.services && tech.services.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🔧 บริการ ({tech.services.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              {tech.services.map((svc: any) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--border)', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  {svc.images && svc.images.length > 0 ? (
                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                      <img src={svc.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {svc.images.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>+{svc.images.length}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ aspectRatio: '4/3', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                      {svc.subCategory?.icon || '🔧'}
                    </div>
                  )}
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{svc.subCategory?.name}</div>
                    {svc.basePrice != null && (
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', fontFamily: 'monospace' }}>฿{Number(svc.basePrice).toLocaleString()}</div>
                    )}
                    {svc.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{svc.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* SERVICE DETAIL SHEET */}
            {selectedService && (
              <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
                onClick={() => setSelectedService(null)}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ background: 'white', width: '100%', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto', padding: '0 0 max(16px, env(safe-area-inset-bottom))' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
                    <div style={{ width: 36, height: 4, background: '#E0D5C0', borderRadius: 2 }} />
                  </div>

                  {selectedService.images && selectedService.images.length > 0 ? (
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '0 16px 12px', scrollSnapType: 'x mandatory' }}>
                      {selectedService.images.map((img: string, i: number) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={img} alt="" style={{ width: 200, height: 200, borderRadius: 12, objectFit: 'cover', flexShrink: 0, scrollSnapAlign: 'start' }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: 'var(--primary-light)', margin: '0 16px 12px', borderRadius: 12 }}>
                      <span style={{ fontSize: 80 }}>{selectedService.subCategory?.icon || '🔧'}</span>
                    </div>
                  )}

                  <div style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedService.subCategory?.name}</div>
                      {selectedService.basePrice != null && (
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', fontFamily: 'monospace' }}>฿{Number(selectedService.basePrice).toLocaleString()}</div>
                      )}
                    </div>

                    {selectedService.description && (
                      <div style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 16 }}>
                        {selectedService.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {selectedService.subCategory?.category && (
                        <span style={{ background: 'var(--primary-light)', color: '#8B6914', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                          {selectedService.subCategory.category.name}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg)', padding: '10px 12px', borderRadius: 12, marginBottom: 16 }}>
                      <div
                        onClick={() => userData?.avatarUrl && setViewingAvatar(userData.avatarUrl)}
                        style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden', cursor: userData?.avatarUrl ? 'zoom-in' : 'default' }}
                      >
                        {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userData?.fullName || '?').charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{userData?.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>⭐ {Number(tech.ratingAvg || 0).toFixed(1)} ({tech.ratingCount || 0} รีวิว) · {tech.yearsExperience || 0} ปีประสบการณ์</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, padding: '0 16px 0', position: 'sticky', bottom: 0, background: 'white', paddingTop: 8 }}>
                    <button
                      onClick={() => {
                        const svc = selectedService
                        setSelectedService(null)
                        router.push(`/quotations/new?techId=${techId}&subCategoryId=${svc?.subCategoryId || ''}&subCategoryName=${encodeURIComponent(svc?.subCategory?.name || '')}`)
                      }}
                      style={{ flex: 1, padding: '14px 0', borderRadius: 30, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,184,0,0.4)', fontFamily: 'Prompt, sans-serif' }}
                    >
                      📋 ขอใบเสนอราคา
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================== BLOCK 4: PORTFOLIO ===================== */}
        {portfolio.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {portfolio.map((item: PortfolioItem) => (
              <div key={item.id} className="card-shadow" style={{ marginBottom: 12, borderRadius: 14, overflow: 'hidden', background: 'white' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 8px' }}>
                  <div
                    onClick={() => userData?.avatarUrl && setViewingAvatar(userData.avatarUrl)}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden', flexShrink: 0, cursor: userData?.avatarUrl ? 'zoom-in' : 'default' }}
                  >
                    {userData?.avatarUrl ? (
                      <img src={userData.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (userData?.fullName || '?').charAt(0)
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{userData?.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                      {new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {item.caption && (
                  <div style={{ padding: '0 14px 8px', fontSize: 13, lineHeight: 1.55, color: 'var(--text)' }}>
                    {item.caption}
                  </div>
                )}

                {item.images && item.images.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: item.images.length === 1 ? '1fr' : '1fr 1fr',
                    gap: 2, cursor: 'pointer'
                  }} onClick={() => setViewingImages(item.images)}>
                    {item.images.slice(0, 4).map((img: string, i: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                    ))}
                    {item.images.length > 4 && (
                      <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700 }}>
                        +{item.images.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={() => handleLike(item)}
                    disabled={likingId === item.id}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                      color: item.likedByUser ? '#DC2626' : 'var(--text-light)',
                      fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{item.likedByUser ? '❤️' : '🤍'}</span>
                    <span>{item.likeCount > 0 ? item.likeCount : 'ถูกใจ'}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(item.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                      color: showComments === item.id ? 'var(--primary)' : 'var(--text-light)',
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>💬</span>
                    <span>{item.commentCount > 0 ? item.commentCount : 'แสดงความคิดเห็น'}</span>
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-light)', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>📤</span>
                    <span>แชร์</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments === item.id && (
                  <div>
                    {(comments[item.id] || []).length > 0 && (
                      <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {comments[item.id].map((c: Comment) => (
                          <div key={c.id} style={{ display: 'flex', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, overflow: 'hidden' }}>
                              {c.user.avatarUrl ? (
                                <img src={c.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                c.user.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.user.fullName}</div>
                              <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, background: 'var(--bg)', padding: '6px 10px', borderRadius: '0 12px 12px 12px', marginTop: 2 }}>{c.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, padding: '8px 14px', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                      <input
                        ref={commentInputRef}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(item.id) } }}
                        placeholder="แสดงความคิดเห็น..."
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={() => handleComment(item.id)}
                        disabled={!commentText.trim() || commentLoading}
                        style={{
                          padding: '8px 14px', borderRadius: 20, border: 'none',
                          background: commentText.trim() ? 'var(--primary)' : '#E5E5E5',
                          color: commentText.trim() ? '#3D2C00' : '#999',
                          fontSize: 12, fontWeight: 700, cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {commentLoading ? '...' : 'ส่ง'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* ===================== BLOCK 5: CERTIFICATIONS ===================== */}
        {(tech.certifications?.length > 0 || tech.categories?.length > 0) && (
          <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🏅 ความสามารถ & ใบรับรอง</div>

            <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
              🛡️ ผ่านการยืนยันจาก Beefix.app
            </div>

            {/* Categories as image tiles */}
            {tech.categories && tech.categories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                {tech.categories.map((cat: any) => (
                  <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {cat.category?.icon && (
                      <div style={{
                        width: 60, height: 60, borderRadius: 14,
                        background: 'var(--primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 30,
                        border: '1.5px solid var(--border)',
                      }}>
                        {cat.category.icon}
                      </div>
                    )}
                    <span style={{ fontSize: 10, color: 'var(--text-light)', textAlign: 'center', maxWidth: 70 }}>{cat.category?.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications as clickable images */}
            {tech.certifications?.map((cert: any, i: number) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>🏅 {cert.name}</div>
                {cert.issuer && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{cert.issuer}{cert.year ? ` · ปี ${cert.year}` : ''}</div>}
                {cert.fileUrl && (
                  <div
                    onClick={() => setViewingCertImage(cert.fileUrl)}
                    style={{
                      marginTop: 8, width: '100%', maxWidth: 300,
                      borderRadius: 8, border: '1px solid var(--border)',
                      display: 'block', cursor: 'zoom-in', overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cert.fileUrl} alt={cert.name} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
                    <div style={{
                      position: 'absolute', bottom: 6, right: 6,
                      background: 'rgba(0,0,0,0.5)', color: '#fff',
                      fontSize: 10, padding: '2px 6px', borderRadius: 8,
                    }}>🔍 ดูเต็ม</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BOOK BUTTON */}
        <div style={{ position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 100 }}>
          <button
            onClick={() => router.push(`/quotations/new?techId=${techId}`)}
            style={{
              width: '100%', padding: '16px 0',
              background: 'var(--primary)', color: '#3D2C00',
              border: 'none', borderRadius: 30,
              fontSize: 16, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255,184,0,0.4)',
              fontFamily: 'Prompt, sans-serif',
            }}
          >
            📋 ขอใบเสนอราคา
          </button>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <Link href="/" className="nav-item">
          <span className="nav-icon">🏠</span>หน้าแรก
        </Link>
        <Link href="/orders" className="nav-item">
          <span className="nav-icon">📋</span>รายการ
        </Link>
        <Link href="/chat" className="nav-item">
          <span className="nav-icon">💬</span>แชท
        </Link>
        <Link href="/wallet" className="nav-item">
          <span className="nav-icon">💳</span>กระเป๋า
        </Link>
        <Link href="/profile" className="nav-item">
          <span className="nav-icon">👤</span>โปรไฟล์
        </Link>
      </div>

    </div>
  )
}

export default function TechProfilePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}><div>กำลังโหลด...</div></div>}>
      <TechProfileInner />
    </Suspense>
  )
}
