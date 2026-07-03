import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: ReturnType<typeof initializeApp> | null = null
let messaging: Messaging | null = null

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null

  try {
    if (!app) {
      app = getApps().find(a => a.name === 'beefix') ?? initializeApp(firebaseConfig, 'beefix')
    }
    if (!messaging) {
      messaging = getMessaging(app)
    }
    return messaging
  } catch {
    console.warn('Firebase not configured')
    return null
  }
}

export async function requestFCMToken(): Promise<string | null> {
  const msg = getFirebaseMessaging()
  if (!msg) return null

  try {
    const permission = await Notification.permission
    if (permission !== 'granted') {
      const result = await Notification.requestPermission()
      if (result !== 'granted') return null
    }

    const { getToken } = await import('firebase/messaging')
    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    }).catch(() => null)

    return token
  } catch {
    return null
  }
}

export function onFCMMessage(callback: (payload: unknown) => void): () => void {
  const msg = getFirebaseMessaging()
  if (!msg) return () => {}

  import('firebase/messaging').then(({ onMessage }) => {
    onMessage(msg, callback)
  }).catch(() => {})

  return () => {}
}
