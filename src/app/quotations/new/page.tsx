'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { api, addressesApi } from '@/lib/api'

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div>กำลังโหลด...</div></div>}>
      <NewQuotationInner />
    </Suspense>
  )
}

function NewQuotationInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const techId = searchParams.get('techId') as string
  const subCategoryId = searchParams.get('subCategoryId') as string
  const subCategoryName = searchParams.get('subCategoryName') as string

  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tech, setTech] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [documents, setDocuments] = useState<string[]>([])
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    addressId: '',
    jobDate: '',
    jobTime: '',
  })

  useEffect(() => {
    addressesApi.getAll().then((r: any) => {
      if (r.success && r.addresses?.length) {
        setAddresses(r.addresses)
        const def = r.addresses.find((a: any) => a.isDefault) || r.addresses[0]
        setForm(f => ({ ...f, addressId: def?.id || '' }))
      }
    })

    if (techId) {
      api.get<any>(`/api/technicians/${techId}`).then(r => {
        if (r.success) setTech(r.technician)
      })
    }
  }, [techId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploadingImg) return
    setUploadingImg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'quotations')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setImages(prev => [...prev, data.url])
      }
    } catch {}
    setUploadingImg(false)
    e.target.value = ''
  }

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploadingDoc) return
    setUploadingDoc(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'quotations')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setDocuments(prev => [...prev, data.url])
      }
    } catch {}
    setUploadingDoc(false)
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('กรุณากรอกหัวข้องาน')
    if (!form.addressId) return alert('กรุณาเลือกที่อยู่')
    setSubmitting(true)
    try {
      const res = await api.post<any>('/api/quotations', {
        technicianId: techId,
        subCategoryId: subCategoryId || undefined,
        addressId: form.addressId,
        title: form.title,
        description: form.description || undefined,
        images: images.length ? images : undefined,
        documents: documents.length ? documents : undefined,
        jobDate: form.jobDate || undefined,
        jobTime: form.jobTime || undefined,
      })
      if (res.success) {
        router.replace('/orders')
        alert('ส่งคำขอใบเสนอราคาแล้ว รอช่างตอบกลับ')
      } else {
        alert(res.message || 'เกิดข้อผิดพลาด')
      }
    } catch {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Prompt, sans-serif', paddingBottom: 100 }}>
      <Navbar />

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '12px 16px 24px',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'rgba(255,255,255,0.25)', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D2C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>ขอใบเสนอราคา</div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', marginTop: -12 }}>
        {/* TECH INFO */}
        {tech && (
          <div style={{
            padding: 14, borderRadius: 16, background: 'white',
            border: '1.5px solid var(--border)', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFF0B3, #FFE066)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              {tech.user?.avatarUrl ? (
                <img src={tech.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : '👨‍🔧'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{tech.user?.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                ⭐ {Number(tech.ratingAvg || 0).toFixed(1)} · {tech.yearsExperience || 0} ปี
              </div>
            </div>
          </div>
        )}

        {/* SERVICE */}
        {subCategoryName && (
          <div style={{
            padding: '10px 14px', borderRadius: 12, background: 'var(--primary-light)',
            color: '#8B6914', fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            📋 {subCategoryName}
          </div>
        )}

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Title */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>หัวข้องาน *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="เช่น ติดตั้งแอร์ 2 คอมเพรสเซอร์"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>รายละเอียดงาน</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="อธิบายรายละเอียดงานที่ต้องการ..."
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'Prompt, sans-serif', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Address */}
          {addresses.length > 0 && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>สถานที่ *</label>
              <select
                value={form.addressId}
                onChange={e => setForm(f => ({ ...f, addressId: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'Prompt, sans-serif', background: 'white', boxSizing: 'border-box' }}
              >
                {addresses.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.label}: {a.address}, {a.district}, {a.province}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>วันที่ต้องการ</label>
              <input
                type="date"
                value={form.jobDate}
                onChange={e => setForm(f => ({ ...f, jobDate: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>เวลา</label>
              <input
                type="time"
                value={form.jobTime}
                onChange={e => setForm(f => ({ ...f, jobTime: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: 14, fontFamily: 'Prompt, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>รูปภาพประกอบ</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                  <img src={url} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1.5px solid var(--border)' }} />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#DC2626', color: 'white', border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >×</button>
                </div>
              ))}
              <label style={{ width: 72, height: 72, borderRadius: 12, border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: 'var(--text-light)' }}>
                {uploadingImg ? '...' : '+'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          {/* Documents */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block' }}>เอกสารแนบ</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {documents.map((url, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 12, background: '#FEF3C7', border: '1.5px solid #FDE68A', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📄 ไฟล์ {i + 1}
                  <button onClick={() => setDocuments(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 16 }}>×</button>
                </div>
              ))}
              <label style={{ padding: '8px 16px', borderRadius: 12, border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-light)' }}>
                {uploadingDoc ? '...' : '+ เพิ่มไฟล์'}
                <input type="file" style={{ display: 'none' }} onChange={handleDocUpload} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        borderTop: '1.5px solid var(--border)', zIndex: 100,
      }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.title.trim() || !form.addressId}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 30,
            border: 'none', background: submitting || !form.title.trim() || !form.addressId ? '#E5E7EB' : 'var(--primary)',
            color: '#3D2C00', fontSize: 15, fontWeight: 800,
            cursor: submitting || !form.title.trim() || !form.addressId ? 'not-allowed' : 'pointer',
            fontFamily: 'Prompt, sans-serif',
            boxShadow: '0 4px 16px rgba(255,184,0,0.3)',
          }}
        >
          {submitting ? 'กำลังส่ง...' : '📨 ส่งคำขอใบเสนอราคา'}
        </button>
      </div>
    </div>
  )
}
