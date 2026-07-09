'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { paymentMethodsApi } from '@/lib/api'

interface PaymentMethod {
  id: string
  type: 'promptpay' | 'card'
  label: string
  promptpayNumber?: string
  cardLast4?: string
  cardBrand?: string
  cardExpMonth?: number
  cardExpYear?: number
  isDefault: boolean
  createdAt: string
}

const CARD_BRANDS = [
  { value: 'visa', label: 'Visa', icon: '💳' },
  { value: 'mastercard', label: 'Mastercard', icon: '💳' },
  { value: 'amex', label: 'Amex', icon: '💳' },
  { value: 'other', label: 'อื่นๆ', icon: '💳' },
]

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showSheet, setShowSheet] = useState(false)
  const [methodType, setMethodType] = useState<'promptpay' | 'card'>('promptpay')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // PromptPay form
  const [ppForm, setPpForm] = useState({ label: 'PromptPay', promptpayNumber: '' })

  // Card form
  const [cardForm, setCardForm] = useState({
    label: 'บัตรเครดิต',
    cardLast4: '',
    cardBrand: 'visa',
    cardExpMonth: '',
    cardExpYear: '',
  })

  useEffect(() => {
    loadMethods()
  }, [])

  const loadMethods = async () => {
    setLoading(true)
    try {
      const res = await paymentMethodsApi.getAll()
      setMethods(res.methods || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const resetForms = () => {
    setPpForm({ label: 'PromptPay', promptpayNumber: '' })
    setCardForm({ label: 'บัตรเครดิต', cardLast4: '', cardBrand: 'visa', cardExpMonth: '', cardExpYear: '' })
    setError('')
  }

  const openAdd = (type: 'promptpay' | 'card') => {
    resetForms()
    setMethodType(type)
    setShowSheet(true)
  }

  const handleSave = async () => {
    setError('')

    if (methodType === 'promptpay') {
      if (!ppForm.promptpayNumber || ppForm.promptpayNumber.length < 10) {
        setError('กรุณากรอกเบอร์โทร 10-13 หลัก')
        return
      }
    } else {
      if (!cardForm.cardLast4 || cardForm.cardLast4.length !== 4) {
        setError('กรุณากรอกเลขบัตร 4 หลักท้าย')
        return
      }
    }

    setSaving(true)
    try {
      const payload = methodType === 'promptpay'
        ? { type: 'promptpay', label: ppForm.label, promptpayNumber: ppForm.promptpayNumber.replace(/\D/g, ''), isDefault: methods.length === 0 }
        : { type: 'card', label: cardForm.label, cardLast4: cardForm.cardLast4, cardBrand: cardForm.cardBrand, isDefault: methods.length === 0 }

      const res = await paymentMethodsApi.create(payload)
      if (res.success) {
        setMethods(prev => [res.method, ...prev])
        setShowSheet(false)
      } else {
        setError((res as any).message || 'บันทึกไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await paymentMethodsApi.delete(id)
      setMethods(prev => prev.filter(m => m.id !== id))
      setShowDeleteConfirm(null)
    } catch (e: any) {
      setError(e.message || 'ลบไม่สำเร็จ')
    }
  }

  const ppIcon = (num?: string) => {
    if (!num) return '📱'
    const first = num[0]
    if (first === '0') return '📱' // mobile
    return '💳'
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
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#3D2C00' }}>💳 วิธีการชำระเงิน</div>
        </div>
      </div>

      <div style={{ padding: '16px 16px' }}>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 12, border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        {/* Add buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => openAdd('promptpay')}
            style={{
              padding: '20px 12px', borderRadius: 18,
              border: '1.5px solid var(--border)', background: 'white',
              cursor: 'pointer', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              fontFamily: 'Prompt, sans-serif',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>PromptPay</div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>สแกนจ่าย รวดเร็ว</div>
          </button>

          <button
            onClick={() => openAdd('card')}
            style={{
              padding: '20px 12px', borderRadius: 18,
              border: '1.5px solid var(--border)', background: 'white',
              cursor: 'pointer', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              fontFamily: 'Prompt, sans-serif',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>บัตรเครดิต/เดบิต</div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Visa, Mastercard</div>
          </button>
        </div>

        {/* Info banner */}
        <div style={{
          background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
          borderRadius: 16, padding: '14px 16px',
          marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <span style={{ fontSize: 28 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6', marginBottom: 2 }}>ข้อมูลปลอดภัย</div>
            <div style={{ fontSize: 12, color: '#7C3AED', lineHeight: 1.4 }}>
              ข้อมูลบัตรของคุณถูกเข้ารหัส ไม่เก็บบัตรจริงในระบบ
            </div>
          </div>
        </div>

        {/* Saved methods */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ height: 88, background: '#f0f0f0', borderRadius: 16 }} />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>ยังไม่มีวิธีการชำระเงิน</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เพิ่มวิธีการชำระเงินด้านบนเพื่อจองช่างได้สะดวกขึ้น</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>วิธีที่บันทึกไว้ ({methods.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {methods.map(m => (
                <div key={m.id} style={{
                  background: 'white', borderRadius: 16, padding: 16,
                  border: m.isDefault ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: m.type === 'promptpay' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'linear-gradient(135deg, #FFB800, #FFC933)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, flexShrink: 0,
                    }}>
                      {m.type === 'promptpay' ? '📱' : '💳'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{m.label}</span>
                        {m.isDefault && (
                          <span style={{ background: 'var(--primary)', color: '#3D2C00', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                        {m.type === 'promptpay'
                          ? `PromptPay · ${m.promptpayNumber?.replace(/(\d{4})/g, '$1 ').trim()}`
                          : `${m.cardBrand?.toUpperCase() || 'บัตร'} ····· ${m.cardLast4}`
                        }
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => setShowDeleteConfirm(m.id)}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        border: '1.5px solid #FECACA', background: '#FEF2F2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD SHEET */}
      {showSheet && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => !saving && setShowSheet(false)}
        >
          <div
            style={{
              background: 'white', width: '100%', borderRadius: '24px 24px 0 0',
              padding: '20px 16px max(20px, env(safe-area-inset-bottom))',
              maxHeight: '90vh', overflowY: 'auto',
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
                {methodType === 'promptpay' ? '📱 เพิ่ม PromptPay' : '💳 เพิ่มบัตร'}
              </span>
              <button onClick={() => setShowSheet(false)} disabled={saving} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
            </div>

            {/* Type toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['promptpay', 'card'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setMethodType(t); resetForms() }}
                  style={{
                    flex: 1, padding: '10px',
                    borderRadius: 12,
                    border: methodType === t ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    background: methodType === t ? 'var(--primary-light)' : 'white',
                    fontSize: 13, fontWeight: 700, color: methodType === t ? '#8B6914' : 'var(--text)',
                    cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
                  }}
                >
                  {t === 'promptpay' ? '📱 PromptPay' : '💳 บัตร'}
                </button>
              ))}
            </div>

            {/* PromptPay form */}
            {methodType === 'promptpay' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>🏷️ ชื่อ</div>
                  <input
                    className="form-input"
                    value={ppForm.label}
                    onChange={e => setPpForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="เช่น PromptPay ส่วนตัว"
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>📱 เบอร์โทร/บัตรประจำตัว *</div>
                  <input
                    className="form-input"
                    type="tel"
                    value={ppForm.promptpayNumber}
                    onChange={e => setPpForm(f => ({ ...f, promptpayNumber: e.target.value.replace(/\D/g, '').slice(0, 13) }))}
                    placeholder="0x-xxx-xxxx"
                    maxLength={13}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>กรอกเบอร์มือถือ 10 หลัก หรือบัตรประจำตัวประชาชน 13 หลัก</div>
                </div>

                {/* Preview */}
                {ppForm.promptpayNumber.length >= 10 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    borderRadius: 16, padding: '16px 20px',
                    color: 'white', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <span style={{ fontSize: 40 }}>📱</span>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>PromptPay</div>
                      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 1 }}>
                        {ppForm.promptpayNumber.replace(/(\d{4})/g, '$1 ').trim()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Card form */}
            {methodType === 'card' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>🏷️ ชื่อ</div>
                  <input
                    className="form-input"
                    value={cardForm.label}
                    onChange={e => setCardForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="เช่น บัตร SCB"
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>💳 เลขบัตร 4 หลักท้าย *</div>
                  <input
                    className="form-input"
                    type="tel"
                    value={cardForm.cardLast4}
                    onChange={e => setCardForm(f => ({ ...f, cardLast4: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>🏦 ประเภทบัตร</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {CARD_BRANDS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => setCardForm(f => ({ ...f, cardBrand: b.value }))}
                        style={{
                          flex: 1, padding: '8px 4px',
                          borderRadius: 10,
                          border: cardForm.cardBrand === b.value ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          background: cardForm.cardBrand === b.value ? 'var(--primary-light)' : 'white',
                          fontSize: 11, fontWeight: 700, color: cardForm.cardBrand === b.value ? '#8B6914' : 'var(--text)',
                          cursor: 'pointer', fontFamily: 'Prompt, sans-serif',
                        }}
                      >{b.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

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
              {saving ? '⏳ กำลังบันทึก...' : '+ บันทึกวิธีการชำระเงิน'}
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
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>ลบวิธีการชำระเงิน?</div>
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
        <Link href="/" className="nav-item"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item"><span className="nav-icon">📋</span>รายการ</Link>
        <Link href="/chat" className="nav-item"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item active"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
