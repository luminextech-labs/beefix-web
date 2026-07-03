'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
  isActive: boolean
  subCategories: SubCategory[]
}

interface SubCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  isActive: boolean
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', icon: '', sortOrder: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Sub-category modal state
  const [showSubModal, setShowSubModal] = useState(false)
  const [editSub, setEditSub] = useState<SubCategory | null>(null)
  const [parentCatId, setParentCatId] = useState('')
  const [subForm, setSubForm] = useState({ name: '', icon: '' })
  const [subSaving, setSubSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    api.get<{ success: boolean; user: any }>('/api/auth/me')
      .then(res => { if (!res.success || res.user.role !== 'admin') router.push('/') })
      .catch(() => router.push('/'))
    loadCategories()
  }, [router])

  const loadCategories = () => {
    setLoading(true)
    api.get<{ success: boolean; categories: Category[] }>('/api/categories')
      .then(r => { if (r.success) setCategories(r.categories) })
      .finally(() => setLoading(false))
  }

  const openAdd = () => { setEditCat(null); setForm({ name: '', icon: '', sortOrder: 0 }); setShowModal(true) }
  const openEdit = (cat: Category) => { setEditCat(cat); setForm({ name: cat.name, icon: cat.icon || '', sortOrder: cat.sortOrder }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('กรุณาใส่ชื่อ'); return }
    setSaving(true); setError('')
    try {
      if (editCat) {
        await api.patch('/api/categories', { id: editCat.id, name: form.name, icon: form.icon, sortOrder: form.sortOrder })
      } else {
        await api.post('/api/categories', { name: form.name, icon: form.icon, sortOrder: form.sortOrder })
      }
      setShowModal(false)
      loadCategories()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const openAddSub = (catId: string) => {
    setParentCatId(catId); setEditSub(null); setSubForm({ name: '', icon: '' }); setShowSubModal(true)
  }

  const handleSaveSub = async () => {
    if (!subForm.name.trim()) return
    setSubSaving(true)
    try {
      if (editSub) {
        await api.patch('/api/sub-categories', { id: editSub.id, name: subForm.name, icon: subForm.icon })
      } else {
        await api.post('/api/sub-categories', { categoryId: parentCatId, name: subForm.name, icon: subForm.icon })
      }
      setShowSubModal(false)
      loadCategories()
    } catch (e: any) { console.error(e) }
    finally { setSubSaving(false) }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">← Admin</Link>
            <h1 className="text-2xl font-bold text-gray-900">📂 จัดการหมวดหมู่</h1>
          </div>
          <Button onClick={openAdd} className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
            + เพิ่มหมวดหมู่
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : categories.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-500">ยังไม่มีหมวดหมู่</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {categories.map(cat => (
              <Card key={cat.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon || '📂'}</span>
                      <div>
                        <p className="font-bold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.slug} · ลำดับ {cat.sortOrder}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                        {cat.isActive ? 'เปิด' : 'ปิด'}
                      </Badge>
                      <button onClick={() => openEdit(cat)} className="text-sm text-blue-600 hover:underline">แก้ไข</button>
                      <button onClick={() => openAddSub(cat.id)} className="text-sm text-yellow-600 hover:underline">+ หมวดย่อย</button>
                    </div>
                  </div>

                  {/* Sub-categories */}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cat.subCategories.map(sub => (
                        <div key={sub.id} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                          <span className="text-lg">{sub.icon || '🔹'}</span>
                          <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                          <Badge className={`text-xs ml-1 ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {sub.isActive ? 'เปิด' : 'ปิด'}
                          </Badge>
                          <button
                            onClick={() => { setEditSub(sub); setSubForm({ name: sub.name, icon: sub.icon || '' }); setParentCatId(cat.id); setShowSubModal(true) }}
                            className="text-xs text-blue-500 hover:underline ml-1"
                          >แก้ไข</button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Category modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">{editCat ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h2>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">ชื่อหมวดหมู่</label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="เช่น งานไฟฟ้า" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ไอคอน (emoji)</label>
                  <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="⚡" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ลำดับการแสดง</label>
                  <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>ยกเลิก</Button>
                <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleSave} disabled={saving}>
                  {saving ? '…' : 'บันทึก'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sub-category modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">{editSub ? 'แก้ไขหมวดย่อย' : 'เพิ่มหมวดย่อยใหม่'}</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">ชื่อหมวดย่อย</label>
                  <Input value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} placeholder="เช่น ติดตั้งปลั๊ก" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ไอคอน (emoji)</label>
                  <Input value={subForm.icon} onChange={e => setSubForm(f => ({ ...f, icon: e.target.value }))} placeholder="🔌" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowSubModal(false)}>ยกเลิก</Button>
                <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleSaveSub} disabled={subSaving}>
                  {subSaving ? '…' : 'บันทึก'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
