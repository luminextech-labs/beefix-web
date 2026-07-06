'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ordersApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_CONFIG: Record<string, { icon: string; label: string; bg: string; color: string }> = {
  pending:     { icon: '⏳', label: 'รอตอบรับ',   bg: '#FEF3C7', color: '#92400E' },
  confirmed:   { icon: '✅', label: 'ยืนยันแล้ว',  bg: '#DBEAFE', color: '#1E40AF' },
  in_progress: { icon: '🔧', label: 'กำลังดำเนินงาน', bg: '#EDE9FE', color: '#6B21A8' },
  completed:   { icon: '🎉', label: 'เสร็จสิ้น',   bg: '#D1FAE5', color: '#065F46' },
  cancelled:   { icon: '❌', label: 'ยกเลิก',       bg: '#F3F4F6', color: '#6B7280' },
}

const TABS = [
  { key: 'all',        label: 'ทั้งหมด' },
  { key: 'pending',    label: 'รอตอบรับ' },
  { key: 'confirmed',  label: 'ยืนยันแล้ว' },
  { key: 'in_progress', label: 'กำลังงาน' },
  { key: 'completed',  label: 'เสร็จสิ้น' },
  { key: 'cancelled',  label: 'ยกเลิก' },
]

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/auth/login'
      return
    }
    if (user) loadOrders(1)
  }, [user, authLoading])

  const loadOrders = (pageNum: number) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    ordersApi.getAll({ status: filter === 'all' ? undefined : filter, page: pageNum })
      .then(r => {
        if (pageNum === 1) setOrders(r.orders)
        else setOrders(prev => [...prev, ...r.orders])
        setTotalPages(r.pagination.totalPages)
        setPage(pageNum)
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }

  useEffect(() => {
    if (user && !loading) loadOrders(1)
  }, [filter])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const countForTab = (tab: string) =>
    tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>📋 ออร์เดอร์ของฉัน</div>
            <Link href="/booking">
              <button style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#92400E',
                fontSize: 13,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
              }}>
                + จองช่างใหม่
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginTop: -40, marginBottom: 16, overflowX: 'auto' }}>
          {TABS.map(tab => {
            const isActive = filter === tab.key
            const cfg = tab.key !== 'all' ? STATUS_CONFIG[tab.key] : null
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  background: isActive ? '#3D2C00' : 'white',
                  color: isActive ? '#FEF3C7' : '#6B7280',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: isActive ? 'none' : '1.5px solid #E5E7EB',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {cfg?.icon && <span style={{ fontSize: 11 }}>{cfg.icon}</span>}
                {tab.label}
                {countForTab(tab.key) > 0 && (
                  <span style={{
                    fontSize: 10,
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                    padding: '1px 6px',
                    borderRadius: 10,
                    marginLeft: 2,
                  }}>
                    {countForTab(tab.key)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '0 16px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 88, background: '#f5f5f5', borderRadius: 16 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-shadow" style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {filter !== 'all' && STATUS_CONFIG[filter]?.icon ? STATUS_CONFIG[filter].icon : '📋'}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                {filter === 'all' ? 'ยังไม่มีออร์เดอร์' : `ไม่มีออร์เดอร์${STATUS_CONFIG[filter]?.label || ''}`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
                {filter === 'all' ? 'เริ่มต้นจองช่างเพื่อดูออร์เดอร์ของคุณ' : 'ลองเลือก tab อื่นเพื่อดูออร์เดอร์'}
              </div>
              <Link href="/booking">
                <button style={{
                  background: 'var(--primary)',
                  color: '#3D2C00',
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '10px 24px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                }}>
                  จองช่างเลย
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Order list */}
              {filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="card-shadow" style={{
                      padding: 14,
                      marginBottom: 10,
                      borderRadius: 16,
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
                        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = ''
                        ;(e.currentTarget as HTMLDivElement).style.transform = ''
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                        {/* Status icon */}
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: cfg.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          flexShrink: 0,
                        }}>
                          {cfg.icon}
                        </div>

                        {/* Main info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>{order.orderNo}</span>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 10,
                              background: cfg.bg,
                              color: cfg.color,
                            }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 4 }}>
                            {order.subCategory?.category?.name} → {order.subCategory?.name}
                          </div>

                          {/* Tech + job info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {order.technician ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: '50%',
                                  background: 'var(--primary-light)', border: '1px solid var(--primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 9, fontWeight: 700, color: '#92400E', overflow: 'hidden',
                                }}>
                                  {order.technician.user?.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={order.technician.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    order.technician.user?.fullName?.charAt(0) || 'T'
                                  )}
                                </div>
                                <span style={{ fontSize: 11, color: '#6B7280', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {order.technician.user?.fullName}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>รอจับคู่ช่าง…</span>
                            )}

                            {order.jobDate && (
                              <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span>📅</span>
                                {new Date(order.jobDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                {order.jobTime ? ` ${order.jobTime}` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price column */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#374151' }}>
                            ฿{Number(order.totalAmount).toLocaleString()}
                          </div>
                          {order.paymentStatus === 'paid' && (
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: 10 }}>
                              ✅ จ่ายแล้ว
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                            {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar for active orders */}
                      {(order.status === 'confirmed' || order.status === 'in_progress') && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                borderRadius: 4,
                                width: order.status === 'confirmed' ? '33%' : '66%',
                                background: order.status === 'confirmed' ? '#3B82F6' : '#8B5CF6',
                                transition: 'width 0.3s',
                              }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', flexShrink: 0 }}>
                              {order.status === 'confirmed' ? 'รอเริ่มงาน' : 'กำลังดำเนิน'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}

              {/* Load more */}
              {page < totalPages && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <button
                    onClick={() => loadOrders(page + 1)}
                    disabled={loadingMore}
                    style={{
                      background: loadingMore ? '#F3F4F6' : 'white',
                      color: loadingMore ? '#9CA3AF' : 'var(--text)',
                      border: '1.5px solid #E5E7EB',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '10px 28px',
                      borderRadius: 20,
                      cursor: loadingMore ? 'default' : 'pointer',
                    }}
                  >
                    {loadingMore ? 'กำลังโหลด…' : 'ดูออร์เดอร์เพิ่มเติม'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bottom-nav" style={{ marginTop: 16 }}>
          <Link href="/" className="nav-item">
            <span className="nav-icon">🏠</span>หน้าแรก
          </Link>
          <Link href="/orders" className="nav-item active">
            <span className="nav-icon">📋</span>รายการ
          </Link>
          <Link href="/booking" className="nav-item">
            <span className="nav-icon">💬</span>รายการ
          </Link>
          <Link href="/wallet" className="nav-item">
            <span className="nav-icon">💳</span>กระเป๋า
          </Link>
          <Link href="/profile" className="nav-item">
            <span className="nav-icon">👤</span>โปรไฟล์
          </Link>
        </div>
      </div>
    </>
  )
}
