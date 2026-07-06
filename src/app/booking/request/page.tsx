'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { techniciansApi, addressesApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function QuotationRequestInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const techId = searchParams.get('tech')
  const serviceId = searchParams.get('service')
  const serviceName = searchParams.get('serviceName') || ''

  const [tech, setTech] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: serviceName,
    description: '',
    preferredDate: '',
    preferredTime: '',
    addressText: '',
  })

  useEffect(() => {
    if (!techId) { setLoading(false); return }
    Promise.all([
      techId ? techniciansApi.getPublicProfile(techId) : null,
      user ? addressesApi.getAll() : null,
    ]).then(([techRes, addrRes]) => {
      if (techRes?.success) setTech(techRes.technician)
      if (addrRes?.addresses) {
        setAddresses(addrRes.addresses)
        const def = addrRes.addresses.find((a: any) => a.isDefault) || addrRes.addresses[0]
        setSelectedAddress(def)
        if (def) setForm(f => ({ ...f, addressText: def.address }))
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [techId, user])

  const handleSubmit = async () => {
    if (!form.title?.trim()) { setError('กรุณาใส่ชื่อบริการ'); return }
    if (!form.description?.trim()) { setError('กรุณาอธิบายรายละเอียดงาน'); return }
    if (!user) { router.push('/auth/login'); return }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          technicianId: techId,
          serviceId,
          title: form.title,
          description: form.description,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          addressText: form.addressText || selectedAddress?.address || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด')
      }
    } catch (e: any) {
      setError(e?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div>กำลังโหลด...</div>
    </div>
  )

  if (success) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>ส่งคำขอใบเสนอราคาแล้ว!</div>
        <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.6 }}>
          ช่าง {tech?.user?.fullName} จะได้รับการแจ้งเตือน<br/>และจะติดต่อกลับหาคุณเร็วๆ นี้
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
          <Link href={`/technicians/${techId}`}>
            <button style={{ width: '100%', padding: '14px 0', borderRadius: 30, border: '2px solid var(--primary)', background: 'white', color: 'var(--primary)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              ← กลับโปรไฟล์ช่าง
            </button>
          </Link>
          <Link href="/orders">
            <button style={{ width: '100%', padding: '14px 0', borderRadius: 30, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,184,0,0.3)' }}>
              ดูคำขอใบเสนอราคา
            </button>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px 50px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={techId ? `/technicians/${techId}` : '/'}>
            <button style={{ background: 'rgba(255,255,255,0.25)', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D2C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          </Link>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#3D2C00' }}>📋 ขอใบเสนอราคา</div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -30 }}>
        {/* Tech card */}
        {tech && (
          <div className="card-shadow" style={{ padding: 14, marginBottom: 16, borderRadius: 14, display: 'flex', gap: 12, alignItems: 'center', background: 'white' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {tech.user?.avatarUrl ? <img src={tech.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (tech.user?.fullName || '?').charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{tech.user?.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>⭐ {Number(tech.ratingAvg || 0).toFixed(1)} ({tech.ratingCount || 0} รีวิว)</div>
            </div>
            <div style={{ fontSize: 28 }}>👨🔧</div>
          </div>
        )}

        {/* Form */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 16, borderRadius: 14, background: 'white' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>📝 รายละเอียดงาน</div>

          {/* Service name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>ชื่อบริการ *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="เช่น ติดตั้งแอร์ 2 คอมเพรสเซอร์"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>อธิบายรายละเอียดงานที่ต้องการ *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder=" опишите проблему или опишите что вам нужно..."
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Preferred date */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>📅 วันที่ต้องการให้ทำ (ถ้ามี)</label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Preferred time */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>🕐 เวลาที่สะดวก (ถ้ามี)</label>
            <input
              type="time"
              value={form.preferredTime}
              onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>📍 สถานที่ (ถ้ามี)</label>
            {addresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addresses.map((addr: any) => (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddress(addr); setForm(f => ({ ...f, addressText: addr.address })) }}
                    style={{
                      padding: '10px 12px', borderRadius: 10, border: selectedAddress?.id === addr.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: selectedAddress?.id === addr.id ? 'var(--primary-light)' : 'white', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>🏠 {addr.label}</div>
                    <div style={{ color: 'var(--text-light)', fontSize: 12, marginTop: 2 }}>{addr.address}</div>
                  </button>
                ))}
                <input
                  value={form.addressText}
                  onChange={e => setForm(f => ({ ...f, addressText: e.target.value }))}
                  placeholder="...หรือระบุสถานที่อื่น"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ) : (
              <textarea
                value={form.addressText}
                onChange={e => setForm(f => ({ ...f, addressText: e.target.value }))}
                placeholder="ระบุสถานที่ทำงาน..."
                rows={2}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 10, color: '#DC2626', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 30, border: 'none',
            background: submitting ? '#E5E5E5' : 'var(--primary)', color: submitting ? '#999' : '#3D2C00',
            fontSize: 16, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 4px 20px rgba(255,184,0,0.4)',
            fontFamily: 'Prompt, sans-serif', marginBottom: 24,
          }}
        >
          {submitting ? 'กำลังส่ง...' : '📋 ส่งคำขอใบเสนอราคา'}
        </button>

      </div>
    </div>
  )
}

export default function QuotationRequestPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}><div>กำลังโหลด...</div></div>}>
      <QuotationRequestInner />
    </Suspense>
  )
}
