'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface PortfolioService {
  id: string
  title: string
  description: string | null
  price: number | null
  subCategoryName: string
  images: string[]
}

export default function TechnicianPortfolioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState<PortfolioService[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Add form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'technician') {
      router.push('/')
      return
    }
    loadPortfolio()
  }, [user])

  const loadPortfolio = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/technicians/services', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      // Filter to only services with images
      const withImages = (data.services || []).filter(
        (s: any) => s.images && s.images.length > 0
      )
      setItems(withImages.map((s: any) => ({
        id: s.id,
        title: s.subCategory?.name || s.customCategory?.name || 'ผลงาน',
        description: s.description || '',
        price: s.basePrice ? Number(s.basePrice) : null,
        subCategoryName: s.subCategory?.name || '',
        images: s.images || [],
      })))
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const res = await uploadApi.upload(file, 'portfolio')
        if (res.success) urls.push(res.url)
      }
      setImages(prev => [...prev, ...urls])
    } catch {
      alert('อัปโหลดรูปไม่สำเร็จ')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAdd = async () => {
    if (!title.trim()) { alert('กรุณากรอกชื่อผลงาน'); return }
    if (images.length === 0) { alert('กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/technicians/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          description: `${title}|${description}|${price || ''}`,
          images,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setShowAdd(false)
      setTitle(''); setDescription(''); setPrice(''); setImages([])
      loadPortfolio()
    } catch (e: any) {
      alert(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบผลงานนี้?')) return
    setDeleting(id)
    try {
      await fetch(`/api/technicians/services?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      alert('ลบไม่สำเร็จ')
    } finally {
      setDeleting(null)
    }
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
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>📸 ผลงาน</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'white',
            borderRadius: 20,
            border: '1.5px dashed var(--border)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📸</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>ยังไม่มีผลงาน</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>ถ่ายรูปผลงานที่เคยทำแล้วอัปโหลด lênให้ลูกค้าดู</div>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: '10px 24px',
                background: 'var(--primary)',
                color: '#3D2C00',
                border: 'none',
                borderRadius: 25,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Prompt, sans-serif',
              }}
            >
              เพิ่มผลงาน
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1.5px solid var(--border)',
                position: 'relative',
              }}>
                <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {item.images.length > 1 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 6,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 10,
                    }}>
                      +{item.images.length - 1}
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                  {item.description && (
                    <div style={{ fontSize: 11, color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.description}
                    </div>
                  )}
                  {item.price != null && (
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                      ฿{item.price.toLocaleString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    cursor: deleting === item.id ? 'not-allowed' : 'pointer',
                    color: 'white',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ADD BUTTON */}
        <button
          onClick={() => setShowAdd(true)}
          style={{
            width: '100%',
            marginTop: 16,
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
          📸 เพิ่มผลงาน
        </button>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => !saving && setShowAdd(false)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              borderRadius: '24px 24px 0 0',
              padding: '24px 16px max(20px, env(safe-area-inset-bottom))',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, background: '#E0D5C0', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18 }}>📸 เพิ่มผลงาน</span>
              <button
                onClick={() => setShowAdd(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Images */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📷 รูปภาพ (อย่างน้อย 1 รูป)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {images.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} />
                    <button
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        background: '#EF4444',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        fontSize: 10,
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <label style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  border: '2px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#F9FAFB',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                  {uploading ? (
                    <span style={{ fontSize: 20 }}>⏳</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 20 }}>➕</span>
                      <span style={{ fontSize: 9 }}>เพิ่มรูป</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>ชื่อผลงาน *</div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="เช่น ติดตั้งแอร์ 3 คอมเพรสเซอร์"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: 'Prompt, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>รายละเอียด</div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="อธิบายผลงาน..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: 'Prompt, sans-serif',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>ราคา (บาท)</div>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="เช่น 1500"
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: 'Prompt, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={saving}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 30,
                border: 'none',
                background: saving ? '#ccc' : 'var(--primary)',
                color: saving ? '#999' : '#3D2C00',
                fontSize: 15,
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: saving ? 'none' : '0 4px 16px rgba(255,184,0,0.3)',
              }}
            >
              {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกผลงาน'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
