'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { api } from '@/lib/api'

interface ChatRoom {
  id: string
  orderId: string
  lastMessage: string | null
  lastMessageAt: string | null
  order: {
    id: string
    orderNo: string
    title: string
    status: string
    jobDate: string | null
  }
  customer: { id: string; fullName: string; avatarUrl: string | null }
  technician: {
    user: { id: string; fullName: string; avatarUrl: string | null }
  }
}

export default function ChatListPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ success: boolean; rooms: ChatRoom[] }>('/api/chat/rooms')
      .then(data => { if (data.success) setRooms(data.rooms) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '16px 20px 24px',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>💬 แชท</div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 80, background: '#f0f0f0', borderRadius: 16 }} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="card-shadow" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>ยังไม่มีแชท</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
              แชทจะปรากฏเมื่อจองช่างแล้ว
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rooms.map(room => {
              const otherParty = user?.role === 'technician' ? room.customer : room.technician.user
              return (
                <Link key={room.id} href={`/chat/${room.id}`}>
                  <div className="card-shadow" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>
                      {otherParty.fullName?.charAt(0) || '?'}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{otherParty.fullName}</div>
                        {room.lastMessageAt && (
                          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                            {new Date(room.lastMessageAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 2 }}>
                        📋 {room.order.title}
                      </div>
                      {room.lastMessage && (
                        <div style={{ fontSize: 12, color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {room.lastMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
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
        <Link href="/chat" className="nav-item active">
          <span className="nav-icon">💬</span>แชท
        </Link>
        <Link href="/wallet" className="nav-item">
          <span className="nav-icon">💳</span>กระเป๋า
        </Link>
      </div>
    </div>
  )
}
