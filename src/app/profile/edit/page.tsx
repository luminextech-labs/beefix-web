'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { profileApi, uploadApi, authApi } from '@/lib/api'

export default function ProfileEditPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadApi.upload(file, 'avatars')
      if (res.success) setAvatar(res.url)
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError('กรุณากรอกชื่อ'); return }
    setSaving(true)
    try {
      const r = await profileApi.update({ fullName: form.fullName, phone: form.phone, avatarUrl: avatar || undefined })
      if (r.success) {
        // Update localStorage token / auth context
        router.push('/profile')
      }
    } catch { setError('บันทึกไม่สำเร็จ') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ background: 'var(--primary)', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', borderRadius: '0 0 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3D2C00' }}>←</button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#3D2C00' }}>แก้ไขโปรไฟล์</div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* AVATAR */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--primary-light)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, overflow: 'hidden', border: '3px solid var(--primary)' }}>
            {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}</span>
          </label>
        </div>

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ชื่อ-นามสกุล</div>
            <input className="form-input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="กรอกชื่อ-นามสกุล" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>เบอร์โทร</div>
            <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0xxxxxxxxx" />
          </div>
          {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <button className="btn-primary" disabled={saving} onClick={handleSave} style={{ marginTop: 8 }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
