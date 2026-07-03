/**
 * Server-side push notification utility for Next.js API routes.
 * Uses Firebase Admin SDK.
 * 
 * Setup required:
 * 1. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars
 *    (from Firebase service account JSON)
 * 2. Alternatively set FIREBASE_SERVICE_ACCOUNT_JSON with the full JSON string
 */
import { NextResponse } from 'next/server'

interface PushPayload {
  title: string
  body: string
  data?: Record<string, string>
}

let _adminApp: any = null

async function getAdminApp() {
  if (_adminApp) return _adminApp

  const admin = await import('firebase-admin') as any
  const { getApps, initializeApp, cert } = admin

  // Try existing app first
  const existing = getApps().find((a: any) => a.name === 'beefix-admin')
  if (existing) {
    _adminApp = existing
    return existing
  }

  // Initialize from env vars
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials not configured')
  }

  _adminApp = initializeApp(
    {
      credential: cert({ projectId, clientEmail, privateKey }),
    },
    'beefix-admin'
  )

  return _adminApp
}

export async function sendPushToToken(
  fcmToken: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    const admin = await import('firebase-admin') as any
    const app = await getAdminApp()
    const messaging = admin.getMessaging(app)

    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      webpush: {
        fcmOptions: {
          link: payload.data?.link || `${process.env.NEXT_PUBLIC_APP_URL || ''}`,
        },
      },
    }

    await messaging.send(message)
    return true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // Log but don't throw - push failure shouldn't break the main flow
    console.error('Push notification error:', msg)
    return false
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  prisma: import('@prisma/client').PrismaClient
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    })

    if (!user?.fcmToken) return false
    return sendPushToToken(user.fcmToken, payload)
  } catch (err) {
    console.error('sendPushToUser error:', err)
    return false
  }
}
