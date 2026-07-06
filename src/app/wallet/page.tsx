'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { walletsApi } from '@/lib/api'

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'topup', amount: 500, desc: 'เติมเงิน via PromptPay', date: '2026-06-28T10:30:00' },
  { id: '2', type: 'payment', amount: -250, desc: 'ชำระค่าบริการ #BF00123', date: '2026-06-27T14:20:00' },
  { id: '3', type: 'topup', amount: 1000, desc: 'เติมเงิน via Credit Card', date: '2026-06-25T09:00:00' },
  { id: '4', type: 'payment', amount: -180, desc: 'ชำระค่าบริการ #BF00118', date: '2026-06-24T16:45:00' },
  { id: '5', type: 'topup', amount: 300, desc: 'เติมเงิน via PromptPay', date: '2026-06-22T11:10:00' },
]

export default function WalletPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState('')
  const [topupLoading, setTopupLoading] = useState(false)

  const loadWallet = () => {
    walletsApi.get()
      .then(res => {
        setBalance(Number(res.wallet?.balance ?? 0))
        setTransactions(res.transactions ?? [])
      })
      .catch(() => {
        setBalance(0)
        setTransactions([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadWallet()
  }, [])

  const handleTopup = async () => {
    const amount = Number(topupAmount)
    if (!amount || amount <= 0) return
    setTopupLoading(true)
    try {
      await walletsApi.topup(amount)
      setTopupAmount('')
      loadWallet() // reload full wallet + transactions
    } catch {
      alert('เติมเงินไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setTopupLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '16px 20px 32px',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>💳 กระเป๋าเงิน</div>
          <Link href="/profile" style={{ color: 'white', fontSize: 22 }}>←</Link>
        </div>

        {/* Balance card */}
        <div className="wallet-card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>ยอดเงินคงเหลือ</div>
          {loading ? (
            <div style={{ height: 36, background: 'rgba(255,255,255,0.3)', borderRadius: 8, width: '60%' }} />
          ) : (
            <div style={{ fontSize: 36, fontWeight: 700 }}>
              ฿{Number(balance ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          )}
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {user?.fullName ?? 'ผู้ใช้งาน'}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* Top-up section */}
        <div className="card-shadow" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>เติมเงิน</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {[100, 300, 500, 1000].map(amt => (
              <button
                key={amt}
                onClick={() => setTopupAmount(String(amt))}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: topupAmount === String(amt) ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: topupAmount === String(amt) ? 'var(--primary-light)' : 'white',
                  fontFamily: 'Prompt, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  color: 'var(--text)',
                }}
              >
                ฿{amt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="number"
              className="form-input"
              placeholder="จำนวนอื่น..."
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '12px 20px', flexShrink: 0 }}
              onClick={handleTopup}
              disabled={topupLoading || !topupAmount}
            >
              {topupLoading ? '...' : 'เติมเงิน'}
            </button>
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title">ประวัติรายการ</div>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>ทั้งหมด</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 60, background: '#f0f0f0', borderRadius: 12 }} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="card-shadow" style={{ padding: 24, textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>ยังไม่มีรายการ</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {transactions.map(tx => (
                <div key={tx.id} className="card-shadow" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: tx.amount > 0 ? '#D1FAE5' : '#FEE2E2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {tx.amount > 0 ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{tx.description || tx.desc}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                      {new Date(tx.createdAt || tx.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: Number(tx.amount) > 0 ? 'var(--green)' : 'var(--text)',
                  }}>
                    {Number(tx.amount) > 0 ? '+' : ''}฿{Math.abs(Number(tx.amount)).toLocaleString()}
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
          <span className="nav-icon">📋</span>แชท
        </Link>
        <Link href="/booking" className="nav-item">
          <span className="nav-icon">💬</span>แชท
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