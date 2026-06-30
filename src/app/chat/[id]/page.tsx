'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

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
  const [otherParty, setOtherParty] = useState<{ fullName: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages)
        if (data.messages.length > 0) {
          const other = data.messages[0].senderId === user?.id
            ? data.messages[0].sender
            : data.messages[0].sender
          setOtherParty(other)
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
    // Poll for new messages every 3 seconds
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
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText.trim(), messageType: 'text' }),
      })
      const data = await res.json()
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

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        // Send image message
        const msgRes = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: data.url, messageType: 'image' }),
        })
        const msgData = await msgRes.json()
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
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{
        background: 'var(--primary)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <button onClick={() => router.push('/chat')} style={{
          background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', padding: 4,
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
            {otherParty?.fullName || 'กำลังโหลด...'}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-light)' }}>กำลังโหลด...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-light)', fontSize: 14 }}>
            เริ่มสนทนาได้เลย 👋
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderId === user?.id
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start',
                marginBottom: 12,
              }}>
                <div style={{
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: isMine ? 'row-reverse' : 'row',
                  gap: 6,
                  alignItems: 'flex-end',
                }}>
                  {!isMine && (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      {msg.sender.fullName?.charAt(0) || '?'}
                    </div>
                  )}
                  {msg.messageType === 'image' ? (
                    <div style={{
                      background: 'white',
                      borderRadius: 16,
                      padding: 4,
                      boxShadow: 'var(--shadow)',
                      maxWidth: '70%',
                    }}>
                      <img
                        src={msg.message}
                        alt="รูปภาพ"
                        style={{ borderRadius: 12, maxWidth: '100%', maxHeight: 300, objectFit: 'cover' }}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  ) : (
                    <div style={{
                      background: isMine ? 'var(--primary)' : 'white',
                      color: isMine ? '#3D2C00' : 'var(--text)',
                      padding: '10px 14px',
                      borderRadius: 16,
                      boxShadow: 'var(--shadow)',
                      fontSize: 14,
                      lineHeight: 1.4,
                    }}>
                      {msg.message}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 2, paddingLeft: 8, paddingRight: 8 }}>
                  {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{
        background: 'white',
        borderTop: '1px solid var(--border)',
        padding: '10px 12px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        {/* Image upload */}
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
            background: 'var(--primary-light)',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {uploadingImage ? '...' : '📷'}
        </button>

        {/* Text input */}
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
            flex: 1,
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 14,
            fontFamily: 'Prompt, sans-serif',
            resize: 'none',
            outline: 'none',
            maxHeight: 120,
            overflowY: 'auto',
          }}
        />

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || sending}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: inputText.trim() ? 'var(--primary)' : 'var(--border)',
            border: 'none',
            fontSize: 18,
            cursor: inputText.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
