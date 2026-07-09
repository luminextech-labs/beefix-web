'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  message: string
  messageType: 'text' | 'image' | 'location' | 'system'
  isRead: boolean
  createdAt: string
  sender: { id: string; fullName: string; avatarUrl: string | null }
}

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const roomId = params.id as string

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [otherParty, setOtherParty] = useState<{ fullName: string; avatarUrl?: string | null } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMessages = useCallback(async () => {
    try {
      const data = await api.get<any>(`/api/chat/rooms/${roomId}/messages`)
      if (data.success) {
        setMessages(data.messages)
        // Find the other party from the latest message
        if (data.messages.length > 0) {
          const lastMsg = data.messages[data.messages.length - 1]
          if (lastMsg.senderId !== user?.id) {
            setOtherParty(lastMsg.sender)
          } else if (data.messages.length > 1) {
            setOtherParty(data.messages[data.messages.length - 2].sender)
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [roomId, user?.id])

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return
    setSending(true)
    try {
      const data = await api.post<any>(`/api/chat/rooms/${roomId}/messages`, {
        message: inputText.trim(),
        messageType: 'text',
      })
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        setInputText('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploadingImage) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'chat')
      const token = api.getToken()
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        const msgData = await api.post<any>(`/api/chat/rooms/${roomId}/messages`, {
          message: data.url,
          messageType: 'image',
        })
        if (msgData.success) {
          setMessages(prev => [...prev, msgData.message])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{
      background: '#F5F0E8',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Prompt, sans-serif',
      maxWidth: 480,
      margin: '0 auto',
      position: 'fixed',
      inset: 0,
    }}>
      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 2px 12px rgba(255,184,0,0.3)',
      }}>
        {/* Back + Order button */}
        <button
          onClick={() => router.push('/orders')}
          style={{
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            width: 34,
            height: 34,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D2C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* Avatar */}
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#3D2C00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--primary)',
          flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.5)',
          overflow: 'hidden',
        }}>
          {otherParty?.avatarUrl
            ? <img src={otherParty.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (otherParty?.fullName || '?').charAt(0)
          }
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#3D2C00', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {otherParty?.fullName || 'กำลังโหลด...'}
          </div>
        </div>

        {/* Order link */}
        <button
          onClick={() => {
            // Try to go to the linked order
            const orderId = window.sessionStorage.getItem('lastOrderId')
            if (orderId) router.push(`/orders/${orderId}`)
            else router.push('/orders')
          }}
          style={{
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color: '#3D2C00',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          📋 ออเดอร์
        </button>
      </div>

      {/* MESSAGES */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: '#8B7355', fontSize: 14 }}>กำลังโหลด...</div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            marginTop: 60,
            color: '#8B7355',
            fontSize: 14,
            lineHeight: 1.6,
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
            เริ่มสนทนาได้เลย<br/>
            <span style={{ fontSize: 12, opacity: 0.7 }}>ถามช่างได้ตลอด 24 ชม.</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === user?.id
            const showAvatar = !isMine && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: isMine ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 6,
                marginBottom: 6,
              }}>
                {/* Avatar */}
                <div style={{ width: 28, flexShrink: 0 }}>
                  {showAvatar ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#3D2C00',
                    }}>
                      {(msg.sender?.fullName || '?').charAt(0)}
                    </div>
                  ) : !isMine ? <div style={{ width: 28 }} /> : null}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '72%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMine ? 'flex-end' : 'flex-start',
                }}>
                  {msg.messageType === 'image' ? (
                    <div style={{
                      background: 'white',
                      borderRadius: 16,
                      padding: 4,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}>
                      <img
                        src={msg.message}
                        alt="รูปภาพ"
                        style={{ borderRadius: 12, maxWidth: 220, maxHeight: 220, objectFit: 'cover', display: 'block' }}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  ) : msg.messageType === 'system' ? (
                    <div style={{
                      background: 'rgba(255,184,0,0.15)',
                      color: '#8B6914',
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontStyle: 'italic',
                    }}>
                      {msg.message}
                    </div>
                  ) : (
                    <div style={{
                      background: isMine ? 'var(--primary)' : 'white',
                      color: isMine ? '#3D2C00' : '#4A3728',
                      padding: '9px 14px',
                      borderRadius: 18,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      fontSize: 14,
                      lineHeight: 1.45,
                      border: isMine ? 'none' : '1px solid rgba(0,0,0,0.06)',
                    }}>
                      {msg.message}
                    </div>
                  )}
                  <div style={{
                    fontSize: 10,
                    color: '#B8A990',
                    marginTop: 2,
                    paddingLeft: isMine ? 0 : 4,
                    paddingRight: isMine ? 4 : 0,
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR — always at bottom */}
      <div style={{
        background: 'white',
        padding: '10px 12px calc(10px + env(safe-area-inset-bottom))',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        flexShrink: 0,
        borderTop: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: '#FFF8F0',
            border: '1.5px solid rgba(255,184,0,0.3)',
            fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: 'var(--primary)',
          }}
        >
          {uploadingImage ? '...' : '🖼️'}
        </button>

        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="พิมพ์ข้อความ..."
            rows={1}
            style={{
              width: '100%',
              border: '1.5px solid rgba(255,184,0,0.3)',
              borderRadius: 22,
              padding: '10px 16px',
              fontSize: 14,
              fontFamily: 'Prompt, sans-serif',
              resize: 'none',
              outline: 'none',
              maxHeight: 120,
              overflowY: 'auto',
              background: '#FFF8F0',
              boxSizing: 'border-box',
              lineHeight: 1.4,
            }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />
        </div>

        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: inputText.trim() ? 'var(--primary)' : '#E8E0D5',
            border: 'none',
            fontSize: 18, cursor: inputText.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: inputText.trim() ? '#3D2C00' : '#B8A990',
            transition: 'all 0.15s',
          }}
        >
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
