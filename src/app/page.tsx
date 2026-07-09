'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { categoriesApi, techniciansApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORY_ICONS: Record<string, string> = {
  repair: '⚡', construction: '🏗', it: '💻', automotive: '🚗',
  home: '🏠', beauty: '💄', education: '📚', event: '🎨',
}

export default function HomePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      techniciansApi.getAll({ page: 1 }),
    ])
      .then(([cats, techs]) => {
        setCategories(cats.categories)
        setTechnicians(techs.technicians)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '16px 20px 70px',
        borderRadius: '0 0 24px 24px',
        position: 'relative',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>🍖 Beefix</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              width: 36, height: 36, background: 'rgba(255,255,255,0.25)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, border: 'none', color: 'white', cursor: 'pointer',
            }}>🔔</button>
            <button style={{
              width: 36, height: 36, background: 'rgba(255,255,255,0.25)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, border: 'none', color: 'white', cursor: 'pointer',
            }}>⚙️</button>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
          สวัสดีครับ <strong style={{ fontWeight: 600 }}>{user ? user.fullName : 'แขก'}</strong>
        </div>

        {/* Search bar — absolute at bottom */}
        <div style={{
          position: 'absolute', bottom: -28, left: 20, right: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 50, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 12px rgba(180,130,0,0.10)',
          }}>
            <span style={{ fontSize: 20, opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') router.push(`/booking${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`) }}
              placeholder="ค้นหาช่างหรือบริการ..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: 'Prompt, sans-serif', background: 'transparent' }}
            />
            <button
              onClick={() => router.push(`/booking${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
              style={{
                background: 'var(--primary)', color: 'white', border: 'none',
                borderRadius: 50, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                fontFamily: 'Prompt, sans-serif', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255,184,0,0.3)',
              }}>🔍 ค้นหา</button>
          </div>
        </div>
      </div>

      <div style={{ height: 48 }} /> {/* Spacer for search bar */}

      {/* PAGE CONTENT */}
      <div style={{ padding: '20px 20px 0' }}>

        {/* SECTION: Categories */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title">หมวดหมู่บริการ</div>
            <Link href="/booking" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>ดูทั้งหมด →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ height: 80, background: '#f0f0f0', borderRadius: 14 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => router.push(`/booking?category=${cat.slug}`)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                >
                  <div className="cat-icon-box">{CATEGORY_ICONS[cat.slug] || '🔧'}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{cat.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BANNER */}
        <div className="promo-banner" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, cursor: 'pointer' }}>
          <div style={{ flex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 600, display: 'inline-block', marginBottom: 8 }}>
              🎁 โปรโมชัน
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>ช่างใหม่พร้อมส่วนลด 20%</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>สมัครวันนี้ ลดเพิ่มอีก 100 บาท</div>
          </div>
          <div style={{ fontSize: 42 }}>🎁</div>
        </div>

        {/* SECTION: Promotions scroll */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title">รายการแนะนำ 🔥</div>
            <Link href="/booking" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>ดูทั้งหมด →</Link>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory' }}>
            {[
              { icon: '🔌', title: 'ติดตั้งแอร์ใหม่', price: 'เริ่มต้น 1,500 บาท' },
              { icon: '🚿', title: 'ซ่อมปั้มน้ำ', price: 'เริ่มต้น 500 บาท' },
              { icon: '🔐', title: 'เปลี่ยนกุญแจ', price: 'เริ่มต้น 300 บาท' },
            ].map((promo, i) => (
              <div key={i} style={{
                minWidth: 200, background: 'white', borderRadius: 'var(--radius)',
                overflow: 'hidden', boxShadow: 'var(--shadow)', scrollSnapAlign: 'start', cursor: 'pointer',
              }}>
                <div style={{
                  width: '100%', height: 110,
                  background: 'linear-gradient(135deg, #FFF8E7 0%, #FFF0B3 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
                }}>{promo.icon}</div>
                <div style={{ padding: '12px 12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{promo.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{promo.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: Nearby Technicians */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title">🏠 ช่างใกล้ฉัน</div>
            <Link href="/booking" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>ดูทั้งหมด →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: 100, background: '#f0f0f0', borderRadius: 16 }} />
              ))}
            </div>
          ) : technicians.length === 0 ? (
            <div className="card-shadow" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔧</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>ยังไม่มีช่างในระบบ</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {technicians.slice(0, 5).map((tech: any) => {
                const isAvailable = tech.isAvailable !== false
                const basePrice = Number(tech.services?.[0]?.basePrice || 0)

                return (
                  <div
                    key={tech.id}
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      border: '1.5px solid var(--border)',
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => router.push(`/booking?tech=${tech.id}`)}
                  >
                    {/* Top row: Avatar + Info */}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                      {/* Avatar with online dot */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: 58, height: 58, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFF0B3 0%, #FFE066 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26,
                            border: '2px solid var(--border)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                          }}
                          onClick={e => { e.stopPropagation(); router.push(`/technicians/${tech.id}`) }}
                        >
                          {tech.user?.avatarUrl ? (
                            <img src={tech.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : '👨\u200d🔧'}
                        </div>
                        {/* Online dot */}
                        {isAvailable && (
                          <div style={{
                            position: 'absolute', bottom: 2, right: 2,
                            width: 14, height: 14, borderRadius: '50%',
                            background: '#22C55E',
                            border: '2px solid white',
                          }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                            {tech.user?.fullName || 'ช่าง'}
                          </span>
                          {tech.verifiedAt && (
                            <span style={{
                              background: '#22C55E', color: 'white',
                              fontSize: 9, fontWeight: 700,
                              padding: '2px 6px', borderRadius: 20,
                            }}>✓ ยืนยันตัวตน</span>
                          )}
                        </div>
                        {tech.headline && (
                          <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tech.headline}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, color: '#F59E0B', fontWeight: 800 }}>⭐ {Number(tech.ratingAvg || 0).toFixed(1)}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>({tech.ratingCount || 0} รีวิว)</span>
                          {tech.distanceKm != null && (
                            <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
                              📍 {tech.distanceKm} กม.
                            </span>
                          )}
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: isAvailable ? '#D1FAE5' : '#F3F4F6',
                            color: isAvailable ? '#059669' : '#9CA3AF',
                            padding: '2px 8px', borderRadius: 20,
                          }}>● {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {tech.services?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {tech.services.slice(0, 3).map((s: any) => (
                          <span key={s.id} style={{
                            background: 'var(--primary-light)',
                            color: '#8B6914',
                            fontSize: 10, fontWeight: 600,
                            padding: '3px 8px', borderRadius: 20,
                          }}>
                            {s.subCategory?.icon} {s.subCategory?.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/technicians/${tech.id}`) }}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          borderRadius: 12,
                          border: '1.5px solid var(--border)',
                          background: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--text)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          fontFamily: 'Prompt, sans-serif',
                        }}
                      >
                        👁 ดูโปรไฟล์ช่าง
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/booking?tech=${tech.id}`) }}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          borderRadius: 12,
                          border: 'none',
                          background: isAvailable ? 'var(--primary)' : '#E5E7EB',
                          color: isAvailable ? '#3D2C00' : '#9CA3AF',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          fontFamily: 'Prompt, sans-serif',
                        }}
                      >
                        {isAvailable ? '✅ จองช่างนี้' : 'ไม่ว่าง'}
                      </button>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div>
                        {basePrice ? (
                          <>
                            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>เริ่มต้น </span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                              ฿{Number(basePrice).toLocaleString()}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-light)' }}> บาท</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 13, color: 'var(--text-light)' }}>ราคาตามงาน</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <Link href="/" className="nav-item active">
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
