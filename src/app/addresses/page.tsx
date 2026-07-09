'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addressesApi } from '@/lib/api'

interface Address {
  id: string
  label: string
  address: string
  province?: string
  district?: string
  subDistrict?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  isDefault: boolean
  createdAt: string
}

const LABEL_OPTIONS = ['บ้าน', 'ที่ทำงาน', 'คอนโด', 'อพาร์ตเมนต์', 'อื่นๆ']

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showSheet, setShowSheet] = useState(false)
  const [editAddress, setEditAddress] = useState<Address | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [form, setForm] = useState({
    label: '',
    address: '',
    province: '',
    district: '',
    subDistrict: '',
    postalCode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    isDefault: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    setLoading(true)
    try {
      const res = await addressesApi.getAll()
      setAddresses(res.addresses || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditAddress(null)
    setForm({
      label: '', address: '', province: '', district: '',
      subDistrict: '', postalCode: '',
      latitude: undefined, longitude: undefined,
      isDefault: addresses.length === 0,
    })
    setError('')
    setLocError('')
    setShowSheet(true)
  }

  const openEdit = (addr: Address) => {
    // Convert Prisma Decimal to number if needed
    const lat = typeof addr.latitude === 'number' ? addr.latitude
      : addr.latitude ? Number(addr.latitude) : undefined
    const lng = typeof addr.longitude === 'number' ? addr.longitude
      : addr.longitude ? Number(addr.longitude) : undefined
    setEditAddress(addr)
    setForm({
      label: addr.label,
      address: addr.address,
      province: addr.province || '',
      district: addr.district || '',
      subDistrict: addr.subDistrict || '',
      postalCode: addr.postalCode || '',
      latitude: lat,
      longitude: lng,
      isDefault: addr.isDefault,
    })
    setError('')
    setLocError('')
    setShowSheet(true)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocError('เบราว์เซอร์ไม่รองรับ GPS')
      return
    }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        setForm(f => ({ ...f, latitude: lat, longitude: lng }))

        // Reverse geocode with Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`
          )
          const data = await res.json()
          if (data && data.address) {
            const a = data.address
            setForm(f => ({
              ...f,
              latitude: lat,
              longitude: lng,
              address: [
                a.building, a.house_number, a.road, a.alley,
              ].filter(Boolean).join(' ') || data.display_name?.split(',')[0] || f.address,
              subDistrict: a.suburb || a.village || '',
              district: a.district || a.county || '',
              province: a.province || '',
              postalCode: a.postcode || '',
            }))
          }
        } catch { /* lat/lng already set */ }
        setLocating(false)
      },
      (err) => {
        setLocError('ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตเข้าถึงตำแหน่ง')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSave = async () => {
    if (!form.label.trim()) { setError('กรุณาเลือกป้ายชื่อ'); return }
    if (!form.address.trim()) { setError('กรุณากรอกที่อยู่'); return }
    setSaving(true)
    setError('')
    try {
      if (editAddress) {
        const res = await addressesApi.update(editAddress.id, form)
        if (res.success) {
          setAddresses(prev => prev.map(a => a.id === editAddress.id ? { ...a, ...form } : a))
          setShowSheet(false)
        } else {
          setError((res as any).message || 'บันทึกไม่สำเร็จ')
        }
      } else {
        const res = await addressesApi.create(form)
        if (res.success) {
          setAddresses(prev => [res.address, ...prev])
          setShowSheet(false)
        } else {
          setError((res as any).message || 'บันทึกไม่สำเร็จ')
        }
      }
    } catch (e: any) {
      const msg = e?.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'
      setError(msg)
      // Keep sheet open so user doesn't lose data
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (addr: Address) => {
    try {
      await addressesApi.update(addr.id, { isDefault: true })
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })))
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    try {
      await addressesApi.delete(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      setShowDeleteConfirm(null)
    } catch (e: any) {
      setError(e.message || 'ลบไม่สำเร็จ')
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/profile" style={{ fontSize: 22, color: '#3D2C00', textDecoration: 'none' }}>←</Link>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>📍 ที่อยู่ของฉัน</div>
          <button
            onClick={openAdd}
            style={{
              background: '#3D2C00', color: 'white',
              border: 'none', borderRadius: 20,
              padding: '7px 16px',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
            }}
          >+ เพิ่ม</button>
        </div>
      </div>

      <div style={{ padding: '16px 16px' }}>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 12, border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 100, background: '#f0f0f0', borderRadius: 16 }} />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>ยังไม่มีที่อยู่</div>
            <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>เพิ่มที่อยู่เพื่อจองช่างได้รวดเร็วขึ้น</div>
            <button
              onClick={openAdd}
              style={{
                background: 'var(--primary)', color: '#3D2C00',
                border: 'none', borderRadius: 25, padding: '12px 28px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: '0 4px 16px rgba(255,184,0,0.3)',
              }}
            >+ เพิ่มที่อยู่</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map(addr => (
              <div
                key={addr.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: addr.isDefault ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>🏠</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{addr.label}</span>
                  {addr.isDefault && (
                    <span style={{ background: 'var(--primary)', color: '#3D2C00', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                      ค่าเริ่มต้น
                    </span>
                  )}
                  {addr.latitude && addr.longitude && (
                    <span style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, marginLeft: 'auto' }}>
                      📍 GPS
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12, paddingLeft: 28 }}>
                  {addr.address}
                  {addr.subDistrict && ` ${addr.subDistrict}`}
                  {addr.district && ` ${addr.district}`}
                  {addr.province && ` ${addr.province}`}
                  {addr.postalCode && ` ${addr.postalCode}`}
                </div>

                <div style={{ display: 'flex', gap: 8, paddingLeft: 28 }}>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 10,
                        border: '1.5px solid var(--primary)', background: 'var(--primary-light)',
                        fontSize: 13, fontWeight: 700, color: '#8B6914', cursor: 'pointer',
                        fontFamily: 'Prompt, sans-serif',
                      }}
                    >ตั้งเป็นค่าเริ่มต้น</button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      border: '1.5px solid var(--border)', background: 'white',
                      fontSize: 13, fontWeight: 700, color: 'var(--text)', cursor: 'pointer',
                      fontFamily: 'Prompt, sans-serif',
                    }}
                  >แก้ไข</button>
                  <button
                    onClick={() => setShowDeleteConfirm(addr.id)}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      border: '1.5px solid #FECACA', background: '#FEF2F2',
                      fontSize: 13, fontWeight: 700, color: '#EF4444', cursor: 'pointer',
                      fontFamily: 'Prompt, sans-serif',
                    }}
                  >ลบ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD/EDIT BOTTOM SHEET */}
      {showSheet && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => !saving && setShowSheet(false)}
        >
          <div
            style={{
              background: 'white', width: '100%', borderRadius: '24px 24px 0 0',
              padding: '20px 16px max(20px, env(safe-area-inset-bottom))',
              maxHeight: '92vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, background: '#E0D5C0', borderRadius: 2 }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
                {editAddress ? '✏️ แก้ไขที่อยู่' : '+ เพิ่มที่อยู่'}
              </span>
              <button
                onClick={() => setShowSheet(false)}
                disabled={saving}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-light)' }}
              >✕</button>
            </div>

            {/* Label chips */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>🏷️ ป้ายชื่อ</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LABEL_OPTIONS.map(lbl => (
                  <button
                    key={lbl}
                    onClick={() => setForm(f => ({ ...f, label: lbl }))}
                    style={{
                      padding: '8px 16px', borderRadius: 20,
                      border: form.label === lbl ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: form.label === lbl ? 'var(--primary-light)' : 'white',
                      fontSize: 13, fontWeight: 700,
                      color: form.label === lbl ? '#8B6914' : 'var(--text)',
                      cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
                      transition: 'all 0.15s',
                    }}
                  >{lbl}</button>
                ))}
              </div>
            </div>

            {/* GPS Pin button */}
            <div style={{ marginBottom: 12 }}>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 14,
                  border: '2px solid var(--primary)',
                  background: locating ? 'var(--primary-light)' : 'linear-gradient(135deg, #FFF0B3 0%, #FFF8E7 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 15, fontWeight: 700, color: '#8B6914',
                  cursor: locating ? 'not-allowed' : 'pointer',
                  fontFamily: 'Prompt, sans-serif',
                  boxShadow: '0 3px 12px rgba(255,184,0,0.2)',
                }}
              >
                {locating ? (
                  <>🧭 กำลังระบุตำแหน่ง...</>
                ) : (
                  <>📍 {editAddress?.latitude ? '🔄 อัปเดตตำแหน่งจาก GPS' : 'ปักหมุดที่อยู่ปัจุบัน (GPS)'}</>
                )}
              </button>
              {locError && (
                <div style={{ fontSize: 12, color: '#DC2626', marginTop: 6, textAlign: 'center' }}>{locError}</div>
              )}
            </div>

            {/* Map preview */}
            {form.latitude && form.longitude ? (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>🗺️ แผนที่ตำแหน่ง</div>
                <div style={{ borderRadius: 14, overflow: 'hidden', height: 150, border: '1.5px solid var(--border)', position: 'relative' }}>
                  <iframe
                    title="map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.longitude - 0.005},${form.latitude - 0.003},${form.longitude + 0.005},${form.latitude + 0.003}&layer=mapnik&marker=${form.latitude},${form.longitude}`}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 5, textAlign: 'right' }}>
                  📍 {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                </div>
              </div>
            ) : null}

            {/* Address textarea */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>📍 ที่อยู่ *</div>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="บ้านเลขที่, ซอย, ถนน, หมู่บ้าน..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid var(--border)', borderRadius: 12,
                  fontSize: 14, fontFamily: 'Prompt, sans-serif',
                  resize: 'none', outline: 'none', background: 'white', color: 'var(--text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Province / District / SubDistrict / Postal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>จังหวัด</div>
                <input className="form-input" value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  placeholder="กรุงเทพฯ" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>อำเภอ</div>
                <input className="form-input" value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="คลองเตย" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>ตำบล</div>
                <input className="form-input" value={form.subDistrict}
                  onChange={e => setForm(f => ({ ...f, subDistrict: e.target.value }))}
                  placeholder="คลองเตย" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>รหัสไปรษณีย์</div>
                <input className="form-input" value={form.postalCode}
                  onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                  placeholder="10110" />
              </div>
            </div>

            {/* Default toggle */}
            <div
              onClick={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                background: form.isDefault ? 'var(--primary-light)' : '#FAFAFA',
                borderRadius: 12, marginBottom: 20,
                cursor: 'pointer',
                border: form.isDefault ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: form.isDefault ? 'var(--primary)' : 'white',
                border: form.isDefault ? 'none' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {form.isDefault && <span style={{ fontSize: 14, color: '#3D2C00', fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>ตั้งเป็นที่อยู่เริ่มต้น</span>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: '15px',
                borderRadius: 30, border: 'none',
                background: saving ? '#ccc' : 'var(--primary)',
                color: saving ? '#999' : '#3D2C00',
                fontSize: 16, fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: '0 6px 20px rgba(255,184,0,0.3)',
              }}
            >
              {saving ? '⏳ กำลังบันทึก...' : editAddress ? '✏️ บันทึกการแก้ไข' : '+ บันทึกที่อยู่'}
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 24, padding: '24px 20px', width: '100%', maxWidth: 340, textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>ลบที่อยู่นี้?</div>
            <div style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 25,
                  border: '1.5px solid var(--border)', background: 'white',
                  fontSize: 14, fontWeight: 700, color: 'var(--text)', cursor: 'pointer',
                  fontFamily: 'Prompt, sans-serif',
                }}
              >ยกเลิก</button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 25,
                  border: 'none', background: '#EF4444',
                  fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
                  fontFamily: 'Prompt, sans-serif',
                }}
              >ลบเลย</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <Link href="/" className="nav-item">
          <span className="nav-icon">🏠</span>หน้าแรก
        </Link>
        <Link href="/orders" className="nav-item">
          <span className="nav-icon">📋</span>รายการ
        </Link>
        <Link href="/booking" className="nav-item">
          <span className="nav-icon">💬</span>แชท
        </Link>
        <Link href="/wallet" className="nav-item">
          <span className="nav-icon">💳</span>กระเป๋า
        </Link>
        <Link href="/profile" className="nav-item active">
          <span className="nav-icon">👤</span>โปรไฟล์
        </Link>
      </div>
    </div>
  )
}
