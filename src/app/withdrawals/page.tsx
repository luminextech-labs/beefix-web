'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const MOCK_WITHDRAWALS = [
  { id: '1', amount: 1500, bank: 'กสิกรไทย', account: 'xxx-x-xxxxx-1', status: 'completed', date: '2026-06-20T10:00:00' },
  { id: '2', amount: 800, bank: 'กรุงไทย', account: 'xxx-x-xxxxx-2', status: 'pending', date: '2026-06-27T14:30:00' },
  { id: '3', amount: 2200, bank: 'ไทยพาณิชย์', account: 'xxx-x-xxxxx-3', status: 'completed', date: '2026-06-15T09:15:00' },
]

const BANKS = ['กสิกรไทย', 'กรุงไทย', 'ไทยพาณิชย์', 'กรุงศรี', 'ธนาคารออมสิน', 'ธนาคารทหารไทย']

const STATUS_TEXT: Record<string, string> = {
  pending: 'รอดำเนินการ',
  completed: 'โอนสำเร็จ',
  rejected: 'ปฏิเสธ',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--orange)',
  completed: 'var(--green)',
  rejected: '#EF4444',
}

export default function WithdrawalsPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(1247.5)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState('')
  const [account, setAccount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setWithdrawals(MOCK_WITHDRAWALS)
      setLoading(false)
    }, 600)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !bank || !account) return
    setSubmitting(true)

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000))

    const newWithdrawal = {
      id: String(Date.now()),
      amount: Number(amount),
      bank,
      account,
      status: 'pending',
      date: new Date().toISOString(),
    }

    setWithdrawals(prev => [newWithdrawal, ...prev])
    setBalance(b => b - Number(amount))
    setAmount('')
    setBank('')
    setAccount('')
    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '16px 20px 32px',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>🏧 ถอนเงิน</div>
          <Link href="/wallet" style={{ color: 'white', fontSize: 22 }}>←</Link>
        </div>

        {/* Balance preview */}
        <div style={{
          marginTop: 16,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>ยอดเงินที่ถอนได้</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>
              ฿{Number(balance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>💰</div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* Withdrawal form */}
        <div className="card-shadow" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>ขอถอนเงิน</div>

          {success && (
            <div style={{
              background: '#D1FAE5',
              color: '#059669',
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 14,
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
            }}>
              ✅ ส่งคำขอถอนเงินสำเร็จแล้ว
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>
                จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={100}
                max={balance}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>
                เลือกธนาคาร
              </label>
              <select
                className="form-input"
                value={bank}
                onChange={e => setBank(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="">-- เลือกธนาคาร --</option>
                {BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>
                เลขที่บัญชี
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="x-x-xxxxx-x"
                value={account}
                onChange={e => setAccount(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !amount || !bank || !account}
            >
              {submitting ? 'กำลังส่งคำขอ...' : 'ขอถอนเงิน'}
            </button>
          </form>
        </div>

        {/* History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title">ประวัติการถอน</div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: 70, background: '#f0f0f0', borderRadius: 12 }} />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="card-shadow" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏧</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>ยังไม่มีรายการถอนเงิน</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {withdrawals.map(w => (
                <div key={w.id} className="card-shadow" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                        ฿{Number(w.amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {w.bank} • {w.account}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: STATUS_COLORS[w.status] || 'var(--text-light)',
                      background: `${STATUS_COLORS[w.status] ?? '#ccc'}20`,
                      padding: '3px 10px',
                      borderRadius: 50,
                    }}>
                      {STATUS_TEXT[w.status] || w.status}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    {new Date(w.createdAt || w.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <Link href="/" className="nav-item">
          <span className="nav-icon">🏠</span>หน้าแรก
        </Link>
        <Link href="/orders" className="nav-item">
          <span className="nav-icon">📋</span>รายการ
        </Link>
        <Link href="/booking" className="nav-item">
          <span className="nav-icon">💬</span>จอง
        </Link>
        <Link href="/wallet" className="nav-item active">
          <span className="nav-icon">💳</span>กระเป๋า
        </Link>
        <Link href="/profile" className="nav-item">
          <span className="nav-icon">👤</span>โปรไฟล์
        </Link>
      </div>
    </div>
  )
}