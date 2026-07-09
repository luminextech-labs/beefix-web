'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ordersApi, api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FEF3C7', color: '#D97706' },
  confirmed: { bg: '#DBEAFE', color: '#1D4ED8' },
  in_progress: { bg: '#EDE9FE', color: '#7C3AED' },
  customer_pending: { bg: '#FED7AA', color: '#EA580C' },
  completed: { bg: '#D1FAE5', color: '#059669' },
  cancelled: { bg: '#F3F4F6', color: '#9CA3AF' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอตอบรับ',
  confirmed: 'ยืนยันแล้ว',
  in_progress: 'กำลังดำเนินงาน',
  customer_pending: 'รอตรวจสอบ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

function OrderDetailInner() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDisputeModal, setShowDisputeModal] = useState(false)

  useEffect(() => {
    if (orderId) {
      // Save orderId so chat page can link back
      try { sessionStorage.setItem('lastOrderId', orderId) } catch {}
      ordersApi.getOne(orderId)
        .then(r => {
          if (r.success) setOrder(r.order)
          else setMessage((r as any).message || 'ไม่พบออร์เดอร์')
        })
        .catch((e: any) => setMessage(e?.message || 'เกิดข้อผิดพลาด'))
        .finally(() => setLoading(false))
    }
  }, [orderId])

  const handleAction = async (newStatus: string, reason?: string) => {
    setActionLoading(true)
    setMessage('')
    try {
      const res = await ordersApi.update(orderId, { status: newStatus, cancelReason: reason })
      if (res.success) {
        setOrder({ ...order, status: newStatus })
        setMessage(newStatus === 'cancelled' ? 'ยกเลิกออร์เดอร์แล้ว' : 'อัปเดตสถานะแล้ว')
      } else {
        setMessage((res as any).message || 'เกิดข้อผิดพลาด')
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
          <div style={{ color: 'var(--text-light)', fontSize: 14 }}>กำลังโหลด...</div>
        </div>
      </div>
    </div>
  )

  if (message && !order) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
          <div style={{ color: '#DC2626', fontSize: 14, marginBottom: 8 }}>{message}</div>
        </div>
      </div>
    </div>
  )

  if (!order) return null

  const statusStyle = STATUS_COLORS[order.status] || { bg: '#F3F4F6', color: '#6B7280' }
  const isCustomer = order.customerId === user?.id
  const isTech = order.technician?.userId === user?.id
  const canCancel = isCustomer && ['pending', 'confirmed'].includes(order.status)
  const canConfirm = isTech && order.status === 'pending'
  const canStart = isTech && order.status === 'confirmed'
  const canDeliver = isTech && order.status === 'in_progress'
  const canAccept = isCustomer && order.status === 'customer_pending'
  const canReview = isCustomer && order.status === 'completed' && !order.review
  const openDispute = order.disputes?.find((d: any) => d.status === 'open')

  const totalCost = Number(order.laborCost || 0)
    + Number(order.travelCost || 0)
    + Number(order.materialCost || 0)
    + Number(order.platformFee || 0)
    - Number(order.couponDiscount || 0)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* MESSAGE ALERT */}
      {message && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13,
            background: message.includes('ยกเลิก') ? '#FEE2E2' : '#D1FAE5',
            color: message.includes('ยกเลิก') ? '#DC2626' : '#059669',
          }}>{message}</div>
        </div>
      )}

      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '12px 16px 16px',
        borderRadius: '0 0 20px 20px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => router.push('/orders')}
            style={{ background: 'rgba(255,255,255,0.25)', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D2C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00', flex: 1 }}>{order.orderNo}</div>
          <span style={{
            background: statusStyle.bg, color: statusStyle.color,
            fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
          }}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>


      </div>

      {/* CONTENT */}
      <div style={{ padding: '0 16px', marginTop: 0 }}>

        {/* JOB INFO */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{order.title}</div>
          {order.subCategory?.name && (
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
              {order.subCategory?.category?.name} → {order.subCategory?.name}
            </div>
          )}
          {order.description && (
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 10 }}>{order.description}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-light)' }}>📅</span>
              <span>{order.jobDate}{order.jobTime ? ` เวลา ${order.jobTime}` : ''}</span>
            </div>
            {order.address && (
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-light)' }}>📍</span>
                <span>{order.address.address}, {order.address.district}, {order.address.province}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-light)' }}>👤</span>
              <span>{order.customer?.fullName} · {order.customer?.phone}</span>
            </div>
          </div>
        </div>

        {/* PRICE BREAKDOWN */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>💰 สรุปราคา</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-light)' }}>ค่าแรง</span>
            <span style={{ fontWeight: 600 }}>฿{Number(order.laborCost || 0).toLocaleString()}</span>
          </div>
          {Number(order.travelCost) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-light)' }}>ค่าเดินทาง</span>
              <span style={{ fontWeight: 600 }}>฿{Number(order.travelCost).toLocaleString()}</span>
            </div>
          )}
          {Number(order.materialCost) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-light)' }}>ค่าวัสดุ</span>
              <span style={{ fontWeight: 600 }}>฿{Number(order.materialCost).toLocaleString()}</span>
            </div>
          )}
          {Number(order.couponDiscount) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#059669' }}>
              <span>ส่วนลด</span>
              <span style={{ fontWeight: 600 }}>-฿{Number(order.couponDiscount).toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-light)' }}>ค่าธรรมเนียม (10%)</span>
            <span style={{ fontWeight: 600 }}>฿{Number(order.platformFee || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, paddingTop: 10, borderTop: '1.5px solid var(--border)', marginTop: 4 }}>
            <span>รวมทั้งหมด</span>
            <span style={{ color: 'var(--primary)' }}>฿{Number(order.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>💳 การชำระเงิน</div>
            <div style={{ fontSize: 12, color: order.paymentStatus === 'paid' ? '#059669' : '#D97706', marginTop: 2 }}>
              {order.paymentStatus === 'paid' ? '✅ ชำระแล้ว' : '⏳ รอชำระ'}
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{order.payment?.method === 'wallet' ? '💳 Wallet' : '💳 ออนไลน์'}</div>
        </div>

        {/* ======== WORKFLOW BUTTONS ======== */}

        {/* Technician confirms */}
        {canConfirm && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => handleAction('confirmed')}
              disabled={actionLoading}
              style={{ flex: 1, padding: '12px 0', borderRadius: 30, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,184,0,0.3)', fontFamily: 'Prompt, sans-serif' }}
            >
              {actionLoading ? '...' : '✅ ตอบรับงาน'}
            </button>
            <button
              onClick={() => handleAction('cancelled', 'ช่างปฏิเสธงาน')}
              disabled={actionLoading}
              style={{ padding: '12px 16px', borderRadius: 30, border: '1.5px solid #DC2626', background: 'white', color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              ปฏิเสธ
            </button>
          </div>
        )}

        {/* Technician starts */}
        {canStart && (
          <button
            onClick={() => handleAction('in_progress')}
            disabled={actionLoading}
            style={{ width: '100%', padding: '12px 0', borderRadius: 30, border: 'none', background: '#7C3AED', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', fontFamily: 'Prompt, sans-serif', marginBottom: 10 }}
          >
            {actionLoading ? '...' : '🚀 เริ่มดำเนินงาน'}
          </button>
        )}

        {/* Technician delivers */}
        {canDeliver && (
          <button
            onClick={() => handleAction('customer_pending')}
            disabled={actionLoading}
            style={{ width: '100%', padding: '12px 0', borderRadius: 30, border: 'none', background: '#059669', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', fontFamily: 'Prompt, sans-serif', marginBottom: 10 }}
          >
            {actionLoading ? '...' : '📤 ส่งมอบงาน'}
          </button>
        )}

        {/* ======== CUSTOMER: waiting for tech or customer_pending ======== */}
        {order.status === 'pending' && isCustomer && (
          <div style={{ padding: '16px', borderRadius: 14, background: '#FEF3C7', textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>⏳ รอช่างตอบรับงาน</div>
            <div style={{ fontSize: 12, color: '#B45309', marginTop: 4 }}>ช่างจะติดต่อกลับเร็วๆ นี้</div>
          </div>
        )}

        {/* Customer: pending review (waiting for tech to deliver) */}
        {['confirmed', 'in_progress'].includes(order.status) && isCustomer && (
          <div style={{ padding: '16px', borderRadius: 14, background: '#EDE9FE', textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#5B21B6' }}>🔧 ช่างกำลังดำเนินงาน</div>
            <div style={{ fontSize: 12, color: '#6D28D9', marginTop: 4 }}>รอช่างส่งมอบงานเมื่อเสร็จสิ้น</div>
          </div>
        )}

        {/* Customer: customer_pending — accept or dispute */}
        {order.status === 'customer_pending' && (
          <div>
            <div style={{ padding: '14px', borderRadius: 14, background: '#FEF3C7', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>🔍 รอตรวจสอบงาน</div>
              <div style={{ fontSize: 13, color: '#B45309' }}>ช่างได้ส่งมอบงานแล้ว กรุณาตรวจสอบความเรียบร้อย</div>
            </div>

            <button
              onClick={() => handleAction('completed')}
              disabled={actionLoading}
              style={{ width: '100%', padding: '12px 0', borderRadius: 30, border: 'none', background: '#059669', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', fontFamily: 'Prompt, sans-serif', marginBottom: 8 }}
            >
              {actionLoading ? '...' : '✅ รับงาน'}
            </button>
            <button
              onClick={() => setShowDisputeModal(true)}
              style={{ width: '100%', padding: '10px 0', borderRadius: 30, border: '1.5px solid #DC2626', background: 'white', color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              ⚠️ ไม่พอใจ / เปิดข้อพิพาท
            </button>
          </div>
        )}

        {/* Customer: completed with review */}
        {order.status === 'completed' && order.review && (
          <div style={{ padding: '14px', borderRadius: 14, background: '#D1FAE5', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>⭐ คุณได้รีวิวแล้ว</div>
            <div style={{ fontSize: 13 }}>{'★'.repeat(order.review.rating)} {order.review.comment}</div>
          </div>
        )}

        {canReview && (
          <button
            onClick={() => router.push(`#`)}
            style={{ width: '100%', padding: '12px 0', borderRadius: 30, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,184,0,0.3)', fontFamily: 'Prompt, sans-serif', marginBottom: 10 }}
          >
            ⭐ รีวิวช่าง
          </button>
        )}

        {/* ======== CHAT BUTTON — always at bottom ======== */}
        {order.chatRoom?.id && (
          <button
            onClick={() => router.push(`/chat/${order.chatRoom.id}`)}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 30,
              border: 'none',
              background: '#FFF8F0',
              color: 'var(--primary)',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Prompt, sans-serif',
              marginBottom: 10,
              boxShadow: '0 0 0 2px var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            💬 แชทกับช่าง
          </button>
        )}

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={() => handleAction('cancelled', 'ลูกค้ายกเลิก')}
            disabled={actionLoading}
            style={{ width: '100%', padding: '10px 0', borderRadius: 30, border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-light)', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
          >
            ❌ ยกเลิกออร์เดอร์
          </button>
        )}

        {/* Open dispute alert */}
        {openDispute && (
          <div style={{ padding: 12, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: '#DC2626', fontSize: 13, marginBottom: 4 }}>⚖️ มีข้อพิพาทที่เปิดอยู่</div>
            <div style={{ fontSize: 12, color: '#7F1D1D' }}>• {openDispute.reason}</div>
          </div>
        )}

        {/* Revision history */}
        {order.revisions?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📝 ประวัติแก้ไขงาน</div>
            {order.revisions.map((rev: any) => (
              <div key={rev.id} style={{
                padding: 10, borderRadius: 10, marginBottom: 6,
                background: rev.status === 'approved' ? '#D1FAE5' : rev.status === 'rejected' ? '#FEE2E2' : '#F3F4F6',
                border: `1px solid ${rev.status === 'approved' ? '#A7F3D0' : rev.status === 'rejected' ? '#FECACA' : '#E5E7EB'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{rev.requestedBy === order.customerId ? order.customer?.fullName : order.technician?.user?.fullName}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: rev.status === 'approved' ? '#D1FAE5' : rev.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                    color: rev.status === 'approved' ? '#059669' : rev.status === 'rejected' ? '#DC2626' : '#D97706',
                  }}>
                    {rev.status === 'approved' ? '✅ อนุมัติ' : rev.status === 'rejected' ? '❌ ปฏิเสธ' : '⏳ รอตรวจ'}
                  </span>
                </div>
                {rev.note && <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{rev.note}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Dispute modal */}
        {showDisputeModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setShowDisputeModal(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', width: '100%', borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ width: 40, height: 4, background: '#E0D5C0', borderRadius: 2, margin: '0 auto 16px' }} />
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>⚖️ เปิดข้อพิพาท</div>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>หากพบปัญหากับงาน สามารถเปิดข้อพิพาทเพื่อให้แอดมินช่วยตัดสินได้</p>
              <button
                onClick={() => setShowDisputeModal(false)}
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'white', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Prompt, sans-serif' }}
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      {/* FLOATING CHAT BUTTON — visible when no chatRoom block above */}
      {!order.chatRoom?.id && order.technician && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={async () => {
              try {
                const res = await api.post<any>('/api/chat/rooms', {
                  technicianId: order.technician?.userId,
                  orderId: orderId,
                })
                if (res.success) router.push(`/chat/${res.room.id}`)
              } catch {}
            }}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 30,
              border: 'none',
              background: '#FFF8F0',
              color: 'var(--primary)',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Prompt, sans-serif',
              boxShadow: '0 0 0 2px var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            💬 แชทกับช่าง
          </button>
        </div>
      )}
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }}><Navbar /><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div>กำลังโหลด...</div></div></div>}>
      <OrderDetailInner />
    </Suspense>
  )
}
