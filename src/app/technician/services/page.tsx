'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { categoriesApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  id: string
  name: string
  icon: string
  subCategories: { id: string; name: string; icon: string; slug: string }[]
}

interface ExistingService {
  id: string
  subCategoryId: string | null
  customCategoryId: string | null
  description: string | null
  basePrice: number | null
  subCategory: { id: string; name: string; icon: string; category: { id: string; name: string } } | null
  customCategory: { id: string; name: string } | null
}

export default function TechnicianServicesPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [services, setServices] = useState<ExistingService[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Add service form
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubCatId, setSelectedSubCatId] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'technician') {
      router.push('/')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [catsRes, svcRes] = await Promise.all([
        categoriesApi.getAll(),
        fetch('/api/technicians/services').then(r => r.json()),
      ])
      setCategories(catsRes.categories || [])
      setServices(svcRes.services || [])
    } catch {
      setError('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const availableSubCats = selectedCategory?.subCategories || []

  const handleAddService = async () => {
    if (!selectedCategoryId || !selectedSubCatId || !basePrice) {
      setError('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/technicians/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subCategoryId: selectedSubCatId,
          basePrice: Number(basePrice),
          description: description || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'ไม่สำเร็จ')
      setSuccess('เพิ่มบริการสำเร็จ')
      setShowAddForm(false)
      setSelectedCategoryId('')
      setSelectedSubCatId('')
      setBasePrice('')
      setDescription('')
      loadData()
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('ลบบริการนี้?')) return
    setDeleting(serviceId)
    try {
      const res = await fetch(`/api/technicians/services?id=${serviceId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setServices(prev => prev.filter(s => s.id !== serviceId))
      setSuccess('ลบบริการแล้ว')
    } catch (e: any) {
      setError(e.message || 'ลบไม่สำเร็จ')
    } finally {
      setDeleting(null)
    }
  }

  // Filter subCategories that the tech doesn't already have
  const existingSubCatIds = services.map(s => s.subCategoryId).filter(Boolean)
  const canAddSubCats = (selectedCategory?.subCategories || []).filter(
    sc => !existingSubCatIds.includes(sc.id)
  )

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
          <Link href="/profile" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3D2C00', textDecoration: 'none' }}>←</Link>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>🔧 จัดการบริการ</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* SUCCESS / ERROR */}
        {success && (
          <div style={{ background: '#D1FAE5', color: '#059669', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 12 }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* EXISTING SERVICES */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>
            📋 บริการของคุณ ({services.length})
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-light)' }}>⏳ กำลังโหลด...</div>
          ) : services.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 20px',
              background: 'white',
              borderRadius: 16,
              border: '1.5px dashed var(--border)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔧</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>ยังไม่มีบริการ</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เพิ่มบริการเพื่อให้ลูกค้าจองได้</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.map(svc => (
                <div key={svc.id} style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: '1.5px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0,
                  }}>
                    {svc.subCategory?.icon || '🔧'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                      {svc.subCategory?.name || svc.customCategory?.name || 'บริการ'}
                    </div>
                    {svc.subCategory && (
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                        {svc.subCategory.category?.name}
                      </div>
                    )}
                    {svc.description && (
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {svc.description}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {svc.basePrice != null && (
                      <>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                          ฿{Number(svc.basePrice).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-light)' }}>เริ่มต้น</div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    disabled={deleting === svc.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 18,
                      cursor: deleting === svc.id ? 'not-allowed' : 'pointer',
                      opacity: deleting === svc.id ? 0.5 : 1,
                      padding: 4,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD SERVICE FORM */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: 30,
              border: '2px dashed var(--primary)',
              background: 'var(--primary-light)',
              color: '#8B6914',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Prompt, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            ➕ เพิ่มบริการใหม่
          </button>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '20px 16px',
            border: '1.5px solid var(--primary)',
            boxShadow: '0 4px 16px rgba(255,184,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--text)' }}>
              ➕ เพิ่มบริการใหม่
            </div>

            {/* Step 1: Category */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>📂 หมวดหมู่หลัก</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategoryId(cat.id); setSelectedSubCatId('') }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 14px',
                      borderRadius: 20,
                      border: selectedCategoryId === cat.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: selectedCategoryId === cat.id ? 'var(--primary-light)' : 'white',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: selectedCategoryId === cat.id ? '#8B6914' : 'var(--text)',
                      fontFamily: 'Prompt, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: SubCategory */}
            {selectedCategoryId && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>🔧 ประเภทบริการ</div>
                {canAddSubCats.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text-light)', padding: '8px 0' }}>
                    คุณมีบริการในหมวดนี้หมดแล้ว
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {canAddSubCats.map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => setSelectedSubCatId(sc.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 12,
                          border: selectedSubCatId === sc.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          background: selectedSubCatId === sc.id ? 'var(--primary-light)' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily: 'Prompt, sans-serif',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{sc.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: selectedSubCatId === sc.id ? '#8B6914' : 'var(--text)', textAlign: 'center' }}>{sc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Price */}
            {selectedSubCatId && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>💰 ราคาเริ่มต้น (บาท)</div>
                <input
                  type="number"
                  value={basePrice}
                  onChange={e => setBasePrice(e.target.value)}
                  placeholder="เช่น 300"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 15,
                    fontFamily: 'Prompt, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Step 4: Description (optional) */}
            {selectedSubCatId && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>📝 รายละเอียดเพิ่มเติม <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(ไม่บังคับ)</span></div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="เช่น ราคารวมอะไหล่ หรือบริการพิเศษ..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: 'Prompt, sans-serif',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setError('')
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 25,
                  border: '1.5px solid var(--border)',
                  background: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontFamily: 'Prompt, sans-serif',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddService}
                disabled={saving || !selectedSubCatId || !basePrice}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: 25,
                  border: 'none',
                  background: saving || !selectedSubCatId || !basePrice ? '#E5E7EB' : 'var(--primary)',
                  color: saving || !selectedSubCatId || !basePrice ? '#999' : '#3D2C00',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: saving || !selectedSubCatId || !basePrice ? 'not-allowed' : 'pointer',
                  fontFamily: 'Prompt, sans-serif',
                  boxShadow: saving || !selectedSubCatId || !basePrice ? 'none' : '0 4px 12px rgba(255,184,0,0.3)',
                }}
              >
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกบริการ'}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: 20,
          padding: '12px 14px',
          background: '#EFF6FF',
          borderRadius: 12,
          fontSize: 13,
          color: '#1D4ED8',
          lineHeight: 1.5,
        }}>
          💡 <strong>เคล็ดลับ:</strong> เพิ่มบริการหลายอย่างทำให้ลูกค้าจองง่ายขึ้น และโอกาสรับงานมากขึ้น
        </div>
      </div>
    </div>
  )
}
