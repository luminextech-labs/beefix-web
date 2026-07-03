'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFCMForegroundHandler } from '@/hooks/useFCM'

interface ToastNotification {
  id: string
  title: string
  body: string
  link?: string
}

let toastListeners: ((toast: ToastNotification) => void)[] = []

export function showToast(notification: Omit<ToastNotification, 'id'>) {
  const toast: ToastNotification = {
    ...notification,
    id: Math.random().toString(36).slice(2),
  }
  toastListeners.forEach(fn => fn(toast))
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const router = useRouter()

  useEffect(() => {
    const listener = (toast: ToastNotification) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 5000)
    }
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== listener)
    }
  }, [])

  useFCMForegroundHandler((payload: any) => {
    const data = payload?.notification || payload?.data
    if (!data) return
    showToast({
      title: data.title || 'แจ้งเตือน',
      body: data.body || '',
      link: data.link,
    })
  })

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => {
            if (toast.link) router.push(toast.link)
            setToasts(prev => prev.filter(t => t.id !== toast.id))
          }}
          className="bg-white border border-yellow-300 shadow-lg rounded-xl p-4 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🔔</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{toast.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{toast.body}</p>
              {toast.link && (
                <p className="text-xs text-yellow-600 mt-1">แตะเพื่อดู →</p>
              )}
            </div>
            <button
              onClick={e => {
                e.stopPropagation()
                setToasts(prev => prev.filter(t => t.id !== toast.id))
              }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
