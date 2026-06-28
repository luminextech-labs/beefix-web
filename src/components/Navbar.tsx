'use client'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          <span className="font-bold text-xl text-yellow-600">Beefix</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="sm">ออร์เดอร์ของฉัน</Button>
              </Link>
              <Link href="/booking">
                <Button size="sm">จองช่าง</Button>
              </Link>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-muted-foreground">{user.fullName}</span>
                <Button variant="outline" size="sm" onClick={logout}>ออก</Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">สมัครสมาชิก</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
