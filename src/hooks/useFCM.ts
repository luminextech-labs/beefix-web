'use client'
/**
 * Hook to register FCM token and handle foreground push messages.
 * Call registerFCM() after user login.
 */
import { useEffect } from 'react'
import { requestFCMToken, onFCMMessage } from '@/lib/firebase'
import { api } from '@/lib/api'

export async function registerFCM(): Promise<void> {
  try {
    const token = await requestFCMToken()
    if (!token) return

    // Send token to backend
    await api.post('/api/fcm-token', { fcmToken: token })
    console.log('FCM token registered')
  } catch (err) {
    console.warn('FCM registration failed:', err)
  }
}

export function useFCMForegroundHandler(onMessage: (payload: unknown) => void): void {
  useEffect(() => {
    const unsubscribe = onFCMMessage(onMessage)
    return unsubscribe
  }, [onMessage])
}
