'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const MENU_ITEMS = [
  { icon: '👤', label: 'โปรไฟล์', href: '/profile/edit' },
  { icon: '📍', label: 'ที่อยู่', href: '/addresses' },
  { icon: '💳', label: 'วิธีการชำระเงิน', href: '/payment-methods' },
  { icon: '🔔', label: 'แจ้งเตือน', href: '/notifications' },
  { icon: '📞', label: 'ติดต่อศูนย์ช่วยเหลือ', href: '/help' },
  { icon: '🚪', label: 'ออกจากระบบ', action: 'logout', danger: true },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleMenuClick = (item: typeof MENU_ITEMS[0]) => {
    if (item.action === 'logout') {
      if (window.confirm('ยืนยันการออกจากระบบ?')) {
        logout()
        router.push('/auth/login')
      }
    } else if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '16px 20px 80px',
        borderRadius: '0 0 24px 24px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>👤 โปรไฟล์</div>
          <Link href="/wallet" style={{ color: 'white', fontSize: 22 }}>←</Link>
        </div>

        {/* Profile card */}
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: 20,
          right: 20,
          background: 'white',
          borderRadius: 'var(--radius)',
          padding: '20px 20px 16px',
          boxShadow: '0 4px 20px rgba(180,130,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div className="tech-avatar" style={{ width: 64, height: 64, fontSize: 30 }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              '👤'
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
              {user?.fullName ?? 'ผู้ใช้งาน'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
              {user?.email ?? 'email@example.com'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
              {user?.phone ?? '0xx-xxx-xxxx'}
            </div>
          </div>
          <button
            onClick={() => router.push('/profile/edit')}
            style={{
              padding: '8px 16px',
              background: 'var(--primary-light)',
              border: 'none',
              borderRadius: 50,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'Prompt, sans-serif',
              color: '#8B6914',
              cursor: 'pointer',
            }}
          >
            แก้ไข
          </button>
        </div>
      </div>

      {/* Spacer for profile card */}
      <div style={{ height: 80 }} />

      {/* Menu */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
        }}>
          {MENU_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="menu-item"
              onClick={() => handleMenuClick(item)}
              style={{ color: item.danger ? '#EF4444' : 'var(--text)' }}
            >
              <div className="menu-icon-box" style={item.danger ? { background: '#FEE2E2' } : {}}>
                {item.icon}
              </div>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{item.label}</div>
              {item.href && <span style={{ fontSize: 18, color: 'var(--text-light)' }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 20 }} />

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