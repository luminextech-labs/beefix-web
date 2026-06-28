'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { categoriesApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.getAll()
      .then(res => setCategories(res.categories))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-yellow-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              จองช่าง<span className="text-yellow-500">ออนไลน์</span> ได้ทันที
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ไม่ว่าจะเป็นงานซ่อมไฟฟ้า ประปา แอร์ หรือบริการอื่นๆ
              เลือกช่างที่ใช่ จองง่าย จ่ายสะดวก ราคาโปร่งใส
            </p>
            <div className="flex gap-3 justify-center pt-2">
              {user ? (
                <Link href="/booking">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    จองช่างเลย
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    สมัครสมาชิกฟรี
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">เลือกประเภทบริการ</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all"
                  onClick={() => router.push(`/booking?category=${cat.slug}`)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                    <span className="text-4xl">{CATEGORY_ICONS[cat.slug] || '🔧'}</span>
                    <span className="font-medium text-center">{cat.name}</span>
                    <span className="text-xs text-gray-500">{cat.subCategories.length} ประเภท</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">ใช้งานง่ายๆ แค่ 3 ขั้นตอน</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'เลือกบริการ', desc: 'เลือกประเภทงานและช่างที่ต้องการ' },
                { step: '2', title: 'จองวันเวลา', desc: 'เลือกวันและเวลาที่สะดวก' },
                { step: '3', title: 'ยืนยันจ่าย', desc: 'ชำระเงินได้ทันที ราคาชัดเจน' },
              ].map(item => (
                <div key={item.step} className="text-center space-y-2">
                  <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-gray-500">
          <p>© 2026 Beefix — แพลตฟอร์มจองช่างออนไลน์</p>
        </footer>
      </main>
    </>
  )
}
