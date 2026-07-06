'use client'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl">🍖</span>
          <span className="font-bold text-lg text-yellow-500">Beefix</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  ออร์เดอร์
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  + จองช่าง
                </Button>
              </Link>

            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  สมัครสมาชิก
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
