'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { categoriesApi, techniciansApi, ordersApi, addressesApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function BookingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const initialCategory = searchParams.get('category') || ''

  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null)
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTech, setSelectedTech] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [form, setForm] = useState({
    description: '',
    jobDate: '',
    jobTime: '',
    addressText: '',
    laborCost: 0,
    travelCost: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.categories))
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      setSubCategories(selectedCategory.subCategories || [])
      setSelectedSubCategory(null)
      setTechnicians([])
      setSelectedTech(null)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedSubCategory) {
      techniciansApi.getAll({ subCategoryId: selectedSubCategory.id })
        .then(r => setTechnicians(r.technicians || []))
        .catch(() => setTechnicians([]))
    }
  }, [selectedSubCategory])

  useEffect(() => {
    if (user) {
      addressesApi.getAll().then(r => {
        setAddresses(r.addresses || [])
        if (r.addresses?.length > 0) setSelectedAddress(r.addresses[0])
      }).catch(() => {})
    }
  }, [user])

  const platformFee = (form.laborCost + form.travelCost) * 0.10
  const total = form.laborCost + form.travelCost + platformFee

  const handleBook = async () => {
    if (!user) { router.push('/auth/login'); return }
    if (!selectedTech || !selectedSubCategory) return
    setLoading(true)
    setError('')
    try {
      const res = await ordersApi.create({
        technicianId: selectedTech.id,
        subCategoryId: selectedSubCategory.id,
        title: form.description || selectedSubCategory.name,
        description: form.description,
        jobDate: form.jobDate || new Date().toISOString().split('T')[0],
        jobTime: form.jobTime || '09:00',
        addressId: selectedAddress?.id,
        addressText: !selectedAddress ? form.addressText : undefined,
        laborCost: form.laborCost || selectedTech.services?.[0]?.basePrice || 0,
        travelCost: form.travelCost,
      })
      if (res.success) {
        router.push(`/orders?id=${res.order.id}`)
      } else {
        setError((res as any).message || 'ไม่สำเร็จ')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const canBook = selectedTech && selectedSubCategory

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Prompt, sans-serif' }}>
      <Navbar />

      {/* GRAB-STYLE HEADER */}
      <div style={{ background: 'var(--primary)', padding: '12px 16px 0', borderRadius: '0 0 24px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3D2C00' }}>🐂 Beefix</div>
            <div style={{ fontSize: 11, color: '#3D2C00', opacity: 0.7 }}>จองช่าง ง่ายๆ รวดเร็ว</div>
          </div>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3D2C00' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: '#3D2C00', opacity: 0.7 }}>{user.phone}</div>
            </div>
          )}
        </div>

        {/* Service chips - horizontal scroll */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 12px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: selectedCategory?.id === cat.id ? '#3D2C00' : 'rgba(255,255,255,0.3)',
                color: selectedCategory?.id === cat.id ? '#FFF' : '#3D2C00',
                minWidth: 70,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 180px' }}>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* No category selected */}
        {!selectedCategory && (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🔧</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>เลือกประเภทบริการ</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เลื่อนด้านบนเพื่อเลือกหมวดหมู่งาน</div>
          </div>
        )}

        {/* Sub-categories */}
        {selectedCategory && !selectedSubCategory && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{selectedCategory.icon} {selectedCategory.name}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {subCategories.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: 16,
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{sub.icon || '🔧'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', textAlign: 'center', lineHeight: 1.3 }}>{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Technician list */}
        {selectedSubCategory && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setSelectedSubCategory(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                {selectedSubCategory.icon} {selectedSubCategory.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 'auto' }}>
                {technicians.length} ช่าง
              </span>
            </div>

            {technicians.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>😔</div>
                <div style={{ fontWeight: 600 }}>ไม่มีช่างในขณะนี้</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>ลองเลือกประเภทอื่น</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {technicians.map(tech => (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTech(selectedTech?.id === tech.id ? null : tech)}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: selectedTech?.id === tech.id ? '2.5px solid var(--primary)' : '1.5px solid var(--border)',
                      background: selectedTech?.id === tech.id ? 'var(--primary-light)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      transition: 'all 0.15s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 54, height: 54, borderRadius: '50%',
                      background: tech.user?.avatarUrl ? 'var(--primary-light)' : 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                      border: '2px solid var(--primary)',
                    }}>
                      {tech.user?.avatarUrl ? (
                        <img src={tech.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        '👨‍🔧'
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                          {tech.user?.fullName || 'ช่าง'}
                        </span>
                        {tech.verifiedAt && (
                          <span style={{ background: '#10B981', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>
                            ✓ ยืนยัน
                          </span>
                        )}
                      </div>
                      {tech.headline && (
                        <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tech.headline}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>⭐ {Number(tech.ratingAvg || 0).toFixed(1)}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>({tech.ratingCount || 0} รีวิว)</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {tech.services?.[0]?.basePrice ? (
                        <>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                            ฿{Number(tech.services[0].basePrice).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-light)' }}>ค่าแรง</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-light)' }}>ราคาตามงาน</div>
                      )}
                    </div>

                    {/* Selected checkmark */}
                    {selectedTech?.id === tech.id && (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D2C00', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* GRAB-STYLE STICKY BOTTOM BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px max(16px, env(safe-area-inset-bottom))',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
      }}>
        {/* Technician mini card */}
        {selectedTech && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, padding: '8px 10px', background: 'var(--primary-light)', borderRadius: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👨‍🔧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedTech.user?.fullName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{selectedSubCategory?.name}</div>
            </div>
            <button onClick={() => setSelectedTech(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
          </div>
        )}

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            {selectedTech ? (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>ราคารวม</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace' }}>
                  ฿{total.toLocaleString()}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--text-light)', fontStyle: 'italic' }}>เลือกช่างเพื่อดูราคา</div>
            )}
          </div>

          {/* Address button */}
          <button
            onClick={() => setShowAddressModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              background: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            📍 {selectedAddress ? selectedAddress.label : 'เลือกที่อยู่'}
          </button>
        </div>

        {/* Book button */}
        <button
          onClick={handleBook}
          disabled={!canBook || loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            background: canBook ? 'var(--primary)' : '#E5E5E5',
            color: canBook ? '#3D2C00' : '#999',
            fontSize: 16,
            fontWeight: 700,
            cursor: canBook ? 'pointer' : 'not-allowed',
            fontFamily: 'Prompt, sans-serif',
            boxShadow: canBook ? '0 4px 16px rgba(255,184,0,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'กำลังจอง…' : selectedTech ? `จองเลย 💪` : 'เลือกช่างก่อน'}
        </button>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowAddressModal(false)}>
          <div style={{
            background: 'white', width: '100%', borderRadius: '20px 20px 0 0',
            padding: '20px 16px max(16px, env(safe-area-inset-bottom))',
            maxHeight: '70vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>📍 ที่อยู่</span>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>ยังไม่มีที่อยู่</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เพิ่มที่อยู่ในโปรไฟล์ก่อน</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddress(addr); setShowAddressModal(false) }}
                    style={{
                      display: 'flex', gap: 12, padding: 12, borderRadius: 12,
                      border: selectedAddress?.id === addr.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: selectedAddress?.id === addr.id ? 'var(--primary-light)' : 'white',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>🏠</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{addr.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{addr.address}</div>
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700 }}>✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>กำลังโหลด…</div>}>
      <BookingPageInner />
    </Suspense>
  )
}
