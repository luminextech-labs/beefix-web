'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  data: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
}

const NOTIF_ICONS: Record<string, string> = {
  new_order: '📋',
  order_confirmed: '✅',
  payment_received: '💰',
  review_received: '⭐',
  technician_nearby: '📍',
  order_cancelled: '❌',
  new_message: '💬',
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const getNotifLink = (notif: Notification): string | null => {
    const d = notif.data as Record<string, string> | null
    if (!d) return null
    if (d.roomId) return `/chat/${d.roomId}`
    if (d.orderId) return `/orders/${d.orderId}`
    return null
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '16px 20px 24px',
        borderRadius: '0 0 24px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>🔔 การแจ้งเตือน</div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 14px',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Prompt, sans-serif',
            }}
          >
            อ่านทั้งหมดแล้ว
          </button>
        )}
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 72, background: '#f0f0f0', borderRadius: 16 }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card-shadow" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>ไม่มีการแจ้งเตือน</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>ทุกอย่างเรียบร้อยแล้ว</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(notif => {
              const link = getNotifLink(notif)
              const icon = NOTIF_ICONS[notif.type] || '🔔'
              const content = (
                <div
                  className="card-shadow"
                  onClick={() => !notif.isRead && markRead(notif.id)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    background: notif.isRead ? 'white' : 'var(--primary-light)',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: notif.isRead ? '#f5f5f5' : '#FFF0B3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: notif.isRead ? 600 : 700, marginBottom: 2 }}>
                      {notif.title}
                    </div>
                    {notif.body && (
                      <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.4 }}>
                        {notif.body}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                      {new Date(notif.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)',
                      flexShrink: 0,
                      marginTop: 6,
                    }} />
                  )}
                </div>
              )

              return link ? (
                <Link key={notif.id} href={link} style={{ textDecoration: 'none' }}>
                  {content}
                </Link>
              ) : (
                <div key={notif.id}>{content}</div>
              )
            })}
          </div>
        )}
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
          <span className="nav-icon">📅</span>จอง
        </Link>
        <Link href="/chat" className="nav-item">
          <span className="nav-icon">💬</span>แชท
        </Link>
        <Link href="/wallet" className="nav-item">
          <span className="nav-icon">💳</span>กระเป๋า
        </Link>
      </div>
    </div>
  )
}
