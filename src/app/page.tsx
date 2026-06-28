'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { categoriesApi, techniciansApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const CATEGORY_ICONS: Record<string, string> = {
  repair: '⚡',
  construction: '🏗',
  it: '💻',
  automotive: '🚗',
  home: '🏠',
  beauty: '💄',
  education: '📚',
  event: '🎨',
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [featuredTechs, setFeaturedTechs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      techniciansApi.getAll({ page: 1 }),
    ])
      .then(([cats, techs]) => {
        setCategories(cats.categories)
        setFeaturedTechs(techs.technicians.slice(0, 3))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero / Search Bar */}
        <section className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-white text-2xl font-bold mb-1">
              {user ? `สวัสดีครับ ${user.fullName} 👋` : '🍖 Beefix'}
            </h1>
            <p className="text-yellow-100 text-sm mb-4">
              {user ? 'พร้อมใช้บริการได้เลย' : 'ระบบจองช่างออนไลน์ ง่ายๆ ในมือคุณ'}
            </p>

            {/* Search */}
            <div className="relative">
              <Input
                placeholder="🔍 ค้นหาช่างหรือบริการ..."
                className="bg-white h-11 pl-10 pr-4 rounded-xl border-0 shadow-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && search.trim()) {
                    router.push(`/booking?search=${encodeURIComponent(search)}`)
                  }
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">หมวดหมู่บริการ</h2>
              <Link href="/booking" className="text-sm text-yellow-600 hover:underline">ดูทั้งหมด →</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {categories.map(cat => (
                  <Card
                    key={cat.id}
                    className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
                    onClick={() => router.push(`/booking?category=${cat.slug}`)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-3 gap-1">
                      <span className="text-3xl">{CATEGORY_ICONS[cat.slug] || '🔧'}</span>
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                        {cat.name}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Featured Technicians */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">ช่างแนะนำ 🔥</h2>
              <Link href="/booking" className="text-sm text-yellow-600 hover:underline">ดูทั้งหมด →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : featuredTechs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <p className="text-3xl mb-2">🔧</p>
                  <p>ยังไม่มีช่างในระบบ</p>
                  <p className="text-sm">เป็นช่างแล้วสมัครได้เลย!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {featuredTechs.map((tech: any) => (
                  <Card
                    key={tech.id}
                    className="hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => router.push(`/booking?tech=${tech.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full w-14 h-14 flex items-center justify-center text-2xl shrink-0">
                          {tech.user?.avatarUrl ? '👨‍🔧' : '👨🔧'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-gray-900">{tech.user?.fullName || 'ช่าง'}</span>
                            {tech.verifiedAt && <span className="text-green-500 text-sm">✓</span>}
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${tech.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {tech.isAvailable ? '● ว่าง' : '● ไม่ว่าง'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {tech.headline || 'ช่างทั่วไป'}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tech.services?.slice(0, 3).map((s: any) => (
                              <Badge key={s.id} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                {s.subCategory?.icon || ''} {s.subCategory?.name}
                              </Badge>
                            ))}
                          </div>

                          {/* Rating & Price */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>⭐ {Number(tech.ratingAvg || 0).toFixed(1)} ({tech.ratingCount || 0} รีวิว)</span>
                            {tech.services?.[0]?.basePrice && (
                              <span className="font-medium text-yellow-600">
                                ฿{Number(tech.services[0].basePrice).toLocaleString()}/ชม.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* CTA */}
          {!user && (
            <section className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl p-6 text-center text-white">
              <h3 className="text-xl font-bold mb-1">พร้อมใช้บริการหรือยัง?</h3>
              <p className="text-yellow-100 text-sm mb-4">สมัครสมาชิกฟรี จองช่างได้ทันที</p>
              <Link href="/auth/register">
                <Button className="bg-white text-yellow-600 hover:bg-yellow-50 font-semibold px-8">
                  สมัครสมาชิกฟรี
                </Button>
              </Link>
            </section>
          )}

        </div>

        {/* Footer */}
        <footer className="bg-gray-100 py-6 mt-8 text-center text-sm text-gray-500">
          <p>© 2026 Beefix — ระบบจองช่างออนไลน์</p>
        </footer>
      </main>
    </>
  )
}
