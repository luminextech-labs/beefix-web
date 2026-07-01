'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileApi, uploadApi, authApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load current user data on mount
  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || '', phone: user.phone || '' })
      setAvatar(user.avatarUrl || null)
    }
  }, [user])

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

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError('กรุณากรอกชื่อ'); return }
    setSaving(true)
    setError('')
    try {
      const r = await profileApi.update({
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: avatar || undefined,
      })
      if (r.success) {
        await refreshUser()
        router.push('/profile')
      }
    } catch (e: any) {
      setError(e.message || 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
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
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3D2C00' }}
          >←</button>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>✏️ แก้ไขโปรไฟล์</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* AVATAR */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'var(--primary-light)',
            margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
            overflow: 'hidden',
            border: '3px solid var(--primary)',
            boxShadow: '0 4px 16px rgba(255,184,0,0.2)',
          }}>
            {avatar ? (
              <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 40 }}>👤</span>
            )}
          </div>
          <label style={{ cursor: 'pointer', display: 'inline-block' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            <span style={{
              fontSize: 14, fontWeight: 700,
              color: 'var(--primary)',
              padding: '6px 16px',
              background: 'var(--primary-light)',
              borderRadius: 20,
              display: 'inline-block',
            }}>
              {uploading ? '⏳ กำลังอัปโหลด...' : '📷 เปลี่ยนรูปโปรไฟล์'}
            </span>
          </label>
        </div>

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>👤 ชื่อ-นามสกุล *</div>
            <input
              className="form-input"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>📱 เบอร์โทรศัพท์</div>
            <input
              className="form-input"
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="0xx-xxx-xxxx"
            />
          </div>

          {/* Info note */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--primary-light)',
            borderRadius: 12,
            fontSize: 13,
            color: '#8B6914',
            lineHeight: 1.5,
          }}>
            💡 หากต้องการเปลี่ยนอีเมลหรือรหัสผ่าน กรุณาติดต่อศูนย์ช่วยเหลือ
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '15px',
              borderRadius: 30,
              border: 'none',
              background: saving ? '#ccc' : 'var(--primary)',
              color: saving ? '#999' : '#3D2C00',
              fontSize: 16,
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Prompt, sans-serif',
              boxShadow: '0 6px 20px rgba(255,184,0,0.3)',
              marginTop: 4,
            }}
          >
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </div>
    </div>
  )
}
