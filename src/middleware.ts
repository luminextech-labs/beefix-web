import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://beefix-web.vercel.app',
  'https://beefix-technician.vercel.app',
]

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin')
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin)

  if (req.method === 'OPTIONS') {
    if (isAllowed) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    return new NextResponse(null, { status: 204 })
  }

  if (isAllowed) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
