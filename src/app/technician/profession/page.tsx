'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  id: string
  name: string
  icon: string
}

export default function TechnicianProfessionPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'technician') return
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/technicians/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then(r => r.json()),
    ]).then(([catsData, techData]) => {
      setCategories(catsData.categories || [])
      const current = techData.technician?.categories || []
      setSelectedIds(current.map((c: any) => c.categoryId))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/technicians/me/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ categoryIds: selectedIds }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        setTimeout(() => setDone(false), 2000)
      }
    } catch {}
    finally { setSaving(false) }
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
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>🏷️ อาชีพ</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div style={{
          background: '#EFF6FF',
          borderRadius: 14,
          padding: '12px 14px',
          fontSize: 13,
          color: '#1D4ED8',
          marginBottom: 20,
          lineHeight: 1.5,
        }}>
          💡 เลือกหมวดหมู่ที่คุณถนัด ลูกค้าจะได้เจอคุณเวลาค้นหาช่างตามประเภทงาน
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>⏳ กำลังโหลด...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
              {categories.map(cat => {
                const isSelected = selectedIds.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggle(cat.id)}
                    style={{
                      padding: '20px 14px',
                      borderRadius: 20,
                      border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 16px rgba(255,184,0,0.2)' : 'none',
                      fontFamily: 'Prompt, sans-serif',
                    }}
                  >
                    <span style={{ fontSize: 40 }}>{cat.icon}</span>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isSelected ? '#8B6914' : 'var(--text)',
                      textAlign: 'center',
                    }}>
                      {cat.name}
                    </span>
                    {isSelected && (
                      <span style={{
                        background: 'var(--primary)',
                        color: '#3D2C00',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}>
                        ✓ เลือกแล้ว
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || selectedIds.length === 0}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 30,
                border: 'none',
                background: saving || selectedIds.length === 0 ? '#E5E7EB' : 'var(--primary)',
                color: saving || selectedIds.length === 0 ? '#999' : '#3D2C00',
                fontSize: 16,
                fontWeight: 800,
                cursor: saving || selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Prompt, sans-serif',
                boxShadow: selectedIds.length > 0 && !saving ? '0 6px 20px rgba(255,184,0,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {saving ? '⏳ กำลังบันทึก...' : done ? '✅ บันทึกสำเร็จ!' : '💾 บันทึกอาชีพ'}
            </button>

            {selectedIds.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-light)' }}>
                เลือกอย่างน้อย 1 อาชีพ
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
