'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { categoriesApi, techniciansApi, ordersApi, addressesApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function SlideUp({ children, show }: { children: React.ReactNode; show: boolean }) {
  return (
    <div style={{
      transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      transform: show ? 'translateY(0)' : 'translateY(40px)',
      opacity: show ? 1 : 0,
      pointerEvents: show ? 'auto' : 'none',
    }}>
      {children}
    </div>
  )
}

function BookingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null)
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTech, setSelectedTech] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showConfirmSheet, setShowConfirmSheet] = useState(false)
  const [form, setForm] = useState({
    description: '',
    jobDate: '',
    jobTime: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingStep, setBookingStep] = useState<'category' | 'subcategory' | 'tech'>('category')

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.categories))
  }, [])

  useEffect(() => {
    if (user) {
      addressesApi.getAll().then(r => {
        setAddresses(r.addresses || [])
        if (r.addresses?.length > 0) setSelectedAddress(r.addresses[0])
      }).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (selectedCategory) {
      setSubCategories(selectedCategory.subCategories || [])
      setSelectedSubCategory(null)
      setTechnicians([])
      setSelectedTech(null)
      setBookingStep('subcategory')
    } else {
      setBookingStep('category')
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedSubCategory) {
      setTechnicians([])
      setSelectedTech(null)
      setBookingStep('tech')
      techniciansApi.getAll({ subCategoryId: selectedSubCategory.id })
        .then(r => setTechnicians(r.technicians || []))
        .catch(() => setTechnicians([]))
    }
  }, [selectedSubCategory])

  const handleBack = () => {
    if (bookingStep === 'tech') {
      setSelectedSubCategory(null)
      setBookingStep('subcategory')
    } else if (bookingStep === 'subcategory') {
      setSelectedCategory(null)
      setBookingStep('category')
    }
  }

  const platformFee = (selectedTech?.services?.[0]?.basePrice || 0) * 0.10
  const total = (selectedTech?.services?.[0]?.basePrice || 0) + platformFee

  const handleBookNow = () => {
    if (!user) { router.push('/auth/login'); return }
    if (!selectedTech || !selectedSubCategory) return
    setShowConfirmSheet(true)
  }

  const handleConfirm = async () => {
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
        addressText: !selectedAddress ? (selectedAddress as any)?.addressText : undefined,
        laborCost: selectedTech?.services?.[0]?.basePrice || 0,
        travelCost: 0,
      })
      if (res.success) {
        setShowConfirmSheet(false)
        router.push(`/orders?id=${res.order.id}`)
      } else {
        setError((res as any).message || 'ไม่สำเร็จ')
        setShowConfirmSheet(false)
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setShowConfirmSheet(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Prompt, sans-serif' }}>
      <Navbar />

      {/* GRAB-STYLE STICKY TOP HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '10px 16px 0',
        borderRadius: '0 0 24px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(255,184,0,0.25)',
      }}>
        {/* Logo + User Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D2C00', letterSpacing: -0.5 }}>🐂 Beefix</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.65 }}>จองช่าง รวดเร็วทันใจ</div>
          </div>
          {user ? (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3D2C00' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: '#3D2C00', opacity: 0.65 }}>{user.phone}</div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              style={{
                background: 'rgba(61,44,0,0.15)',
                border: 'none', borderRadius: 20, padding: '6px 14px',
                fontSize: 12, fontWeight: 700, color: '#3D2C00',
                cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
              }}
            >เข้าสู่ระบบ</button>
          )}
        </div>

        {/* LOCATION BAR — GRAB-STYLE */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setShowAddressModal(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(255,255,255,0.95)',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ fontSize: 18 }}>📍</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#3D2C00', opacity: 0.6, marginBottom: 1 }}>สถานที่</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3D2C00', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAddress ? selectedAddress.label : 'เลือกที่อยู่ของคุณ'}
              </div>
            </div>
            <span style={{ fontSize: 16, opacity: 0.5 }}>▼</span>
          </button>

          <button style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.95)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>🔔</button>
        </div>

        {/* Back button row */}
        {bookingStep !== 'category' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 12 }}>
            <button
              onClick={handleBack}
              style={{
                background: 'rgba(255,255,255,0.4)',
                border: 'none', borderRadius: 50,
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, cursor: 'pointer',
              }}
            >←</button>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#3D2C00' }}>
              {bookingStep === 'subcategory' && `${selectedCategory?.icon} ${selectedCategory?.name}`}
              {bookingStep === 'tech' && `${selectedSubCategory?.icon} ${selectedSubCategory?.name}`}
            </div>
          </div>
        )}

        {/* Category chips — GRAB horizontal scroll */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 14,
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '10px 14px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                background: selectedCategory?.id === cat.id ? '#3D2C00' : 'rgba(255,255,255,0.45)',
                color: selectedCategory?.id === cat.id ? '#FFF' : '#3D2C00',
                minWidth: 76,
                scrollSnapAlign: 'start',
                transition: 'all 0.2s',
                boxShadow: selectedCategory?.id === cat.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: 26 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ padding: '16px 16px 200px' }}>
        {error && (
          <div style={{
            background: '#FEE2E2', color: '#DC2626',
            padding: '10px 14px', borderRadius: 12, fontSize: 13,
            marginBottom: 12, border: '1px solid #FECACA',
          }}>
            {error}
          </div>
        )}

        {/* STEP 1: Category intro — GRAB style map placeholder */}
        {bookingStep === 'category' && (
          <SlideUp show={true}>
            {/* Map placeholder */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE066 100%)',
              borderRadius: 20,
              padding: '24px 20px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 4px 16px rgba(255,184,0,0.15)',
            }}>
              <div style={{ fontSize: 48 }}>🗺️</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#3D2C00', marginBottom: 4 }}>จองช่างใกล้บ้านคุณ</div>
                <div style={{ fontSize: 13, color: '#8B7355', marginBottom: 10 }}>เลือกประเภทงานด้านบน แล้วดูช่างที่ว่าง</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['⚡ ไฟฟ้า', '🚿 ประปา', '❄️ แอร์', '🔐 กุญแจ'].map((tag, i) => (
                    <span key={i} style={{
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: 20, padding: '4px 10px',
                      fontSize: 11, fontWeight: 600, color: '#3D2C00',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick access popular services */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>🔥 บริการยอดนิยม</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { icon: '⚡', name: 'ซ่อมไฟฟ้า', desc: 'เริ่มต้น 300 บาท' },
                  { icon: '🚿', name: 'ซ่อมปั้มน้ำ', desc: 'เริ่มต้น 500 บาท' },
                  { icon: '❄️', name: 'ติดตั้งแอร์', desc: 'เริ่มต้น 1,500 บาท' },
                  { icon: '🔐', name: 'เปลี่ยนกุญแจ', desc: 'เริ่มต้น 250 บาท' },
                ].map((item, i) => {
                  const cat = categories.find(c => c.name.includes(item.name.replace('ซ่อม', '').replace('ติดตั้ง', '').replace('เปลี่ยน', '').trim()))
                  return (
                    <button
                      key={i}
                      onClick={() => cat && setSelectedCategory(cat)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 16,
                        border: '1.5px solid var(--border)',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        fontFamily: 'Prompt, sans-serif',
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{item.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </SlideUp>
        )}

        {/* STEP 2: Sub-categories — GRAB grid */}
        {bookingStep === 'subcategory' && (
          <SlideUp show={true}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {subCategories.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub)}
                  style={{
                    padding: '16px 8px',
                    borderRadius: 16,
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontFamily: 'Prompt, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{sub.icon || '🔧'}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.3 }}>{sub.name}</span>
                </button>
              ))}
            </div>
          </SlideUp>
        )}

        {/* STEP 3: Technician list — GRAB driver cards */}
        {bookingStep === 'tech' && (
          <SlideUp show={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                {technicians.length} ช่างว่าง
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: '#D1FAE5', color: '#059669',
                  padding: '4px 10px', borderRadius: 20,
                }}>● ว่าง</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: '#F3F4F6', color: '#9CA3AF',
                  padding: '4px 10px', borderRadius: 20,
                }}>● ไม่ว่าง</span>
              </div>
            </div>

            {technicians.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>ไม่มีช่างว่างตอนนี้</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>ลองเลือกประเภทอื่น หรือรอสักครู่</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {technicians.map(tech => {
                  const isSelected = selectedTech?.id === tech.id
                  const isAvailable = tech.isAvailable !== false
                  const basePrice = tech.services?.[0]?.basePrice

                  return (
                    <div
                      key={tech.id}
                      onClick={() => isAvailable && setSelectedTech(isSelected ? null : tech)}
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border)',
                        background: isSelected ? 'var(--primary-light)' : 'white',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.55,
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 16px rgba(255,184,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Top row: Avatar + Info */}
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{
                            width: 58, height: 58, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFF0B3 0%, #FFE066 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26,
                            border: isSelected ? '3px solid var(--primary)' : '2px solid var(--border)',
                          }}>
                            {tech.user?.avatarUrl ? (
                              <img src={tech.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : '👨‍🔧'}
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
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: isSelected ? 12 : 0 }}>
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

                      {/* Bottom row: Price + CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          {basePrice ? (
                            <>
                              <span style={{ fontSize: 11, color: 'var(--text-light)' }}>เริ่มต้น </span>
                              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                                ฿{Number(basePrice).toLocaleString()}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-light)' }}> บาท</span>
                            </>
                          ) : (
                            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>ราคาตามงาน</span>
                          )}
                        </div>

                        {isAvailable && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {isSelected ? (
                              <div style={{
                                background: 'var(--primary)', color: '#3D2C00',
                                padding: '8px 18px', borderRadius: 25,
                                fontSize: 13, fontWeight: 800,
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}>
                                ✓ เลือกแล้ว
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedTech(tech) }}
                                style={{
                                  background: '#3D2C00', color: 'white',
                                  padding: '8px 18px', borderRadius: 25,
                                  border: 'none', fontSize: 13, fontWeight: 700,
                                  cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
                                }}
                              >เลือก</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SlideUp>
        )}
      </div>

      {/* GRAB-STYLE STICKY BOTTOM BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1.5px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px max(16px, env(safe-area-inset-bottom))',
        zIndex: 100,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
      }}>
        {selectedTech && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center',
            marginBottom: 10,
            padding: '8px 10px',
            background: 'var(--primary-light)',
            borderRadius: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFF0B3, #FFE066)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>👨‍🔧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{selectedTech.user?.fullName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{selectedSubCategory?.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                ฿{Number(selectedTech.services?.[0]?.basePrice || 0).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => setSelectedTech(null)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-light)' }}
            >✕</button>
          </div>
        )}

        {/* Price + Book Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            {selectedTech ? (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>ราคารวมทั้งหมด</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', lineHeight: 1.1 }}>
                  ฿{total.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-light)' }}>
                  รวมค่าบริการ {Number(selectedTech.services?.[0]?.basePrice || 0).toLocaleString()} + ค่าธรรมเนียม {platformFee.toLocaleString()}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--text-light)', fontStyle: 'italic' }}>
                เลือกช่างเพื่อดูราคา
              </div>
            )}
          </div>

          <button
            onClick={handleBookNow}
            disabled={!selectedTech}
            style={{
              padding: '14px 32px',
              borderRadius: 30,
              border: 'none',
              background: selectedTech ? 'var(--primary)' : '#E5E5E5',
              color: selectedTech ? '#3D2C00' : '#999',
              fontSize: 16,
              fontWeight: 800,
              cursor: selectedTech ? 'pointer' : 'not-allowed',
              fontFamily: 'Prompt, sans-serif',
              boxShadow: selectedTech ? '0 4px 16px rgba(255,184,0,0.4)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: -0.3,
            }}
          >
            {selectedTech ? 'จองเลย 💪' : 'เลือกช่าง'}
          </button>
        </div>
      </div>

      {/* GRAB-STYLE ADDRESS MODAL */}
      {showAddressModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            style={{
              background: 'white', width: '100%', borderRadius: '24px 24px 0 0',
              padding: '24px 16px max(20px, env(safe-area-inset-bottom))',
              maxHeight: '80vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, background: '#E0D5C0', borderRadius: 2 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>📍 ที่อยู่ของคุณ</span>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
            </div>

            {addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🏠</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>ยังไม่มีที่อยู่</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>เพิ่มที่อยู่ในโปรไฟล์ก่อนจองช่าง</div>
                <button
                  onClick={() => { setShowAddressModal(false); router.push('/profile') }}
                  style={{
                    background: 'var(--primary)', color: '#3D2C00',
                    border: 'none', borderRadius: 25, padding: '12px 24px',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Prompt, sans-serif',
                  }}
                >ไปที่โปรไฟล์</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddress(addr); setShowAddressModal(false) }}
                    style={{
                      display: 'flex', gap: 14, padding: '14px 16px',
                      borderRadius: 16,
                      border: selectedAddress?.id === addr.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: selectedAddress?.id === addr.id ? 'var(--primary-light)' : 'white',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'Prompt, sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 28, flexShrink: 0 }}>🏠</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{addr.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.4 }}>{addr.address}</div>
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'var(--primary)', color: '#3D2C00',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, flexShrink: 0,
                      }}>✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRAB-STYLE CONFIRM BOTTOM SHEET */}
      {showConfirmSheet && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => !loading && setShowConfirmSheet(false)}
        >
          <div
            style={{
              background: 'white', width: '100%', borderRadius: '24px 24px 0 0',
              padding: '20px 16px max(20px, env(safe-area-inset-bottom))',
              maxHeight: '85vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, background: '#E0D5C0', borderRadius: 2 }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>✅ ยืนยันการจอง</span>
              <button
                onClick={() => setShowConfirmSheet(false)}
                disabled={loading}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-light)' }}
              >✕</button>
            </div>

            {/* Technician summary */}
            <div style={{
              display: 'flex', gap: 12, alignItems: 'center',
              padding: '12px 14px', background: 'var(--primary-light)',
              borderRadius: 16, marginBottom: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFF0B3, #FFE066)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>👨‍🔧</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedTech?.user?.fullName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{selectedSubCategory?.icon} {selectedSubCategory?.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  ฿{Number(selectedTech?.services?.[0]?.basePrice || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-light)' }}>ค่าบริการ</div>
              </div>
            </div>

            {/* Booking details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { icon: '📍', label: 'สถานที่', value: selectedAddress?.label || 'ยังไม่เลือกที่อยู่' },
                { icon: '📅', label: 'วันที่', value: form.jobDate || new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { icon: '⏰', label: 'เวลา', value: form.jobTime || '09:00 น.' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  padding: '10px 14px', background: '#FAFAFA',
                  borderRadius: 12,
                }}>
                  <span style={{ fontSize: 18 }}>{row.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-light)', width: 56 }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, flex: 1, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div style={{
              padding: '14px 16px', background: '#FAFAFA',
              borderRadius: 16, marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: 'var(--text)' }}>💰 รายละเอียดราคา</div>
              {[
                { label: 'ค่าบริการ', value: Number(selectedTech?.services?.[0]?.basePrice || 0) },
                { label: 'ค่าธรรมเนียม (10%)', value: platformFee },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>฿{row.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1.5px dashed var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>รวมทั้งหมด</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>฿{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Description input */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>📝 รายละเอียดงาน (ไม่บังคับ)</div>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="อธิบายปัญหาหรืองานที่ต้องการ..."
                rows={2}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12, fontSize: 14,
                  fontFamily: 'Prompt, sans-serif',
                  resize: 'none', outline: 'none',
                  background: 'white',
                }}
              />
            </div>

            {/* Pay + Book button */}
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                borderRadius: 30, border: 'none',
                background: loading ? '#ccc' : 'var(--primary)',
                color: loading ? '#999' : '#3D2C00',
                fontSize: 17, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: '0 6px 20px rgba(255,184,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>⏳ กำลังจอง…</>
              ) : (
                <>💪 ยืนยันการจอง ฿{total.toLocaleString()}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Prompt, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🐂</div>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>กำลังโหลด…</div>
        </div>
      </div>
    }>
      <BookingPageInner />
    </Suspense>
  )
}
