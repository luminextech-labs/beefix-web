'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { categoriesApi, uploadApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface TechnicianProfile {
  headline: string
  bio: string
  yearsExperience: number
  hourlyRate: number
  isAvailable: boolean
  autoAccept: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  subCategories: { id: string; name: string; icon: string; slug: string }[]
}

const STEPS = ['โปรไฟล์', 'ประเภทงาน', 'บริการ']

export default function TechnicianOnboardingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(0) // 0: profile, 1: categories, 2: services

  // Step 1: Profile
  const [profile, setProfile] = useState<TechnicianProfile>({
    headline: '',
    bio: '',
    yearsExperience: 0,
    hourlyRate: 0,
    isAvailable: true,
    autoAccept: false,
  })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Step 2: Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  // Step 3: Services
  const [subCategories, setSubCategories] = useState<Category['subCategories'][]>([])
  const [selectedSubCats, setSelectedSubCats] = useState<string[]>([])
  const [services, setServices] = useState<Record<string, { price: string; desc: string }>>({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Check if user is technician
  useEffect(() => {
    if (user && user.role !== 'technician') {
      router.push('/')
    }
  }, [user])

  // Load categories for step 2
  useEffect(() => {
    if (step === 1) {
      categoriesApi.getAll().then(r => setCategories(r.categories || []))
    }
  }, [step])

  // When categories selected → load subcategories for step 3
  useEffect(() => {
    if (step === 2 && selectedCategoryIds.length > 0) {
      const cats = categories.filter(c => selectedCategoryIds.includes(c.id))
      setSubCategories(cats.map(c => c.subCategories || []))
    }
  }, [step, selectedCategoryIds])

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadApi.upload(file, 'avatars')
      if (res.success) setAvatar(res.url)
    } catch { setError('อัปโหลดรูปไม่สำเร็จ') }
    finally { setUploading(false) }
  }

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSubCat = (id: string) => {
    setSelectedSubCats(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    if (step === 0) {
      if (!profile.headline.trim()) { setError('กรุณากรอกคำอธิบายตัวเอง'); return }
    }
    if (step === 1) {
      if (selectedCategoryIds.length === 0) { setError('กรุณาเลือกอย่างน้อย 1 ประเภท'); return }
    }
    if (step === 2) {
      if (selectedSubCats.length === 0) { setError('กรุณาเลือกอย่างน้อย 1 บริการ'); return }
    }
    setError('')
    setStep(s => s + 1)
  }

  const handleComplete = async () => {
    setSaving(true)
    setError('')
    try {
      // 1. Update profile via PATCH /api/technicians/me
      const profileRes = await fetch('/api/technicians/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          headline: profile.headline,
          bio: profile.bio,
          yearsExperience: profile.yearsExperience,
          hourlyRate: profile.hourlyRate,
          isAvailable: profile.isAvailable,
          autoAccept: profile.autoAccept,
          ...(avatar && { avatarUrl: avatar }),
        }),
      })
      const profileData = await profileRes.json()
      if (!profileData.success) {
        setError(profileData.message || 'บันทึกโปรไฟล์ไม่สำเร็จ')
        setSaving(false)
        return
      }

      // 2. Link categories via POST /api/technicians/me/categories
      await fetch('/api/technicians/me/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ categoryIds: selectedCategoryIds }),
      })

      // 3. Create services via POST /api/technicians/services
      for (const subCatId of selectedSubCats) {
        const svc = services[subCatId] || {}
        await fetch('/api/technicians/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            subCategoryId: subCatId,
            description: svc.desc || '',
            basePrice: parseFloat(svc.price) || 0,
          }),
        })
      }

      await refreshUser()
      // Set technician app token in cookie for cross-domain auth
      const token = localStorage.getItem('token')
      if (token) {
        document.cookie = `tech_token=${token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`
      }
      window.location.href = 'https://beefix-technician-nvkwid5gr-luminexlabs-projects.vercel.app'
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const flatSubCats = subCategories.flat()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Prompt, sans-serif' }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '12px 16px 0',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 16px rgba(255,184,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Link href="/" style={{ fontSize: 22, color: '#3D2C00', textDecoration: 'none' }}>←</Link>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>🔧 สมัครเป็นช่าง</div>
        </div>

        {/* STEP INDICATOR */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 14 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 4, borderRadius: 4,
                background: i <= step ? '#3D2C00' : 'rgba(61,44,0,0.2)',
                transition: 'all 0.3s',
              }} />
              <div style={{
                fontSize: 10, fontWeight: 700,
                color: i <= step ? '#3D2C00' : 'rgba(61,44,0,0.4)',
                marginTop: 4,
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        {/* ─── STEP 0: PROFILE ─── */}
        {step === 0 && (
          <div>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'var(--primary-light)',
                margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, overflow: 'hidden',
                border: '3px solid var(--primary)',
              }}>
                {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍🔧'}
              </div>
              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
                  {uploading ? '⏳ กำลังอัปโหลด...' : '📷 เปลี่ยนรูปโปรไฟล์'}
                </span>
              </label>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>✍️ คำอธิบายตัวเอง *</div>
              <input
                className="form-input"
                value={profile.headline}
                onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))}
                placeholder="เช่น ช่างไฟฟ้ามืออาชีพ รับซ่อมทุกชนิด"
                maxLength={100}
              />
              <div style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'right', marginTop: 2 }}>{profile.headline.length}/100</div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>📝 รายละเอียดเพิ่มเติม</div>
              <textarea
                className="form-input"
                rows={3}
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="ประสบการณ์ ความเชี่ยวชาญ ผลงานที่ผ่านมา..."
                style={{ resize: 'none' }}
              />
            </div>

            {/* Years + Hourly rate */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>📅 ประสบการณ์ (ปี)</div>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={profile.yearsExperience}
                  onChange={e => setProfile(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>💰 ค่าบริการ/ชม. (บาท)</div>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={profile.hourlyRate}
                  onChange={e => setProfile(p => ({ ...p, hourlyRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="300"
                />
              </div>
            </div>

            {/* Availability toggle */}
            {[
              { key: 'isAvailable', label: '✅ พร้อมรับงาน', desc: 'ลูกค้าจะเห็นคุณและจองได้ทันที', val: true },
              { key: 'autoAccept', label: '⚡ รับงานอัตโนมัติ', desc: 'จองที่ยืนยันแล้วจะรับอัตโนมัติ', val: true },
            ].map(toggle => (
              <div
                key={toggle.key}
                onClick={() => setProfile(p => ({ ...p, [toggle.key]: !p[toggle.key as keyof TechnicianProfile] }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12, marginBottom: 10,
                  background: profile[toggle.key as keyof TechnicianProfile] ? 'var(--primary-light)' : '#FAFAFA',
                  border: profile[toggle.key as keyof TechnicianProfile] ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: profile[toggle.key as keyof TechnicianProfile] ? 'var(--primary)' : 'white',
                  border: profile[toggle.key as keyof TechnicianProfile] ? 'none' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {profile[toggle.key as keyof TechnicianProfile] && <span style={{ fontSize: 14, color: '#3D2C00', fontWeight: 800 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{toggle.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{toggle.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── STEP 1: CATEGORIES ─── */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>เลือกประเภทงานที่รับ</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>เลือกได้หลายประเภท</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categories.map(cat => {
                const isSelected = selectedCategoryIds.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 14,
                      border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : 'white',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'Prompt, sans-serif',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? '0 4px 12px rgba(255,184,0,0.2)' : '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span style={{ fontSize: 30, flexShrink: 0 }}>{cat.icon || '🔧'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{cat.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{cat.subCategories?.length || 0} ประเภทงานย่อย</div>
                    </div>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'white',
                      border: isSelected ? 'none' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ fontSize: 14, color: '#3D2C00', fontWeight: 800 }}>✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── STEP 2: SERVICES ─── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>เลือกบริการที่ให้</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>เลือกได้หลายอย่าง แล้วกำหนดราคาเริ่มต้น</div>

            {flatSubCats.map(sub => {
              const isSelected = selectedSubCats.includes(sub.id)
              return (
                <div key={sub.id} style={{
                  padding: '14px 16px', borderRadius: 14,
                  border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: isSelected ? 'var(--primary-light)' : 'white',
                  marginBottom: 10,
                  boxShadow: isSelected ? '0 4px 12px rgba(255,184,0,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isSelected ? 12 : 0 }}>
                    <button
                      onClick={() => toggleSubCat(sub.id)}
                      style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : 'white',
                        border: isSelected ? 'none' : '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {isSelected && <span style={{ fontSize: 14, color: '#3D2C00', fontWeight: 800 }}>✓</span>}
                    </button>
                    <span style={{ fontSize: 24 }}>{sub.icon || '🔧'}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{sub.name}</span>
                  </div>

                  {isSelected && (
                    <div style={{ paddingLeft: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>ราคาเริ่มต้น (บาท)</div>
                        <input
                          className="form-input"
                          type="number"
                          min={0}
                          value={services[sub.id]?.price || ''}
                          onChange={e => setServices(s => ({
                            ...s,
                            [sub.id]: { ...s[sub.id], price: e.target.value }
                          }))}
                          placeholder="300"
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>รายละเอียด (ไม่บังคับ)</div>
                        <input
                          className="form-input"
                          value={services[sub.id]?.desc || ''}
                          onChange={e => setServices(s => ({
                            ...s,
                            [sub.id]: { ...s[sub.id], desc: e.target.value }
                          }))}
                          placeholder="รายละเอียดงาน"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white',
        borderTop: '1.5px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px max(16px, env(safe-area-inset-bottom))',
        zIndex: 100,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: '0 0 auto',
                padding: '14px 20px',
                borderRadius: 30,
                border: '1.5px solid var(--border)',
                background: 'white',
                fontSize: 15, fontWeight: 700, color: 'var(--text)',
                cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
              }}
            >← กลับ</button>
          )}
          {step < 2 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 30,
                border: 'none',
                background: 'var(--primary)',
                fontSize: 16, fontWeight: 800, color: '#3D2C00',
                cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
                boxShadow: '0 4px 16px rgba(255,184,0,0.35)',
              }}
            >ต่อไป →</button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 30,
                border: 'none',
                background: saving ? '#ccc' : 'var(--primary)',
                fontSize: 16, fontWeight: 800, color: saving ? '#999' : '#3D2C00',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: '0 4px 16px rgba(255,184,0,0.35)',
              }}
            >
              {saving ? '⏳ กำลังบันทึก...' : '✅ ยืนยันและเริ่มรับงาน'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
