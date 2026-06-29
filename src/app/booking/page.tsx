'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { categoriesApi, techniciansApi, ordersApi, addressesApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

function BookingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const initialCategory = searchParams.get('category') || ''

  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTech, setSelectedTech] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    jobDate: '',
    jobTime: '',
    addressText: '',
    laborCost: 0,
    travelCost: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.categories))
  }, [])

  useEffect(() => {
    if (selectedCategory?.slug === initialCategory) {
      setSelectedCategory(categories.find(c => c.slug === initialCategory))
    }
  }, [categories, initialCategory])

  useEffect(() => {
    if (selectedSubCategory) {
      techniciansApi.getAll({ subCategoryId: selectedSubCategory.id })
        .then(r => setTechnicians(r.technicians))
        .catch(console.error)
    }
  }, [selectedSubCategory])

  useEffect(() => {
    if (user) {
      addressesApi.getAll().then(r => {
        setAddresses(r.addresses)
        if (r.addresses.length > 0) setSelectedAddress(r.addresses[0])
      }).catch(() => {})
    }
  }, [user])

  const handleSubmitOrder = async () => {
    if (!user) { router.push('/auth/login'); return }
    if (!selectedTech || !selectedSubCategory) return
    setLoading(true)
    setError('')
    try {
      const res = await ordersApi.create({
        technicianId: selectedTech.id,
        subCategoryId: selectedSubCategory.id,
        title: form.title || selectedSubCategory.name,
        description: form.description,
        jobDate: form.jobDate,
        jobTime: form.jobTime,
        addressId: selectedAddress?.id,
        addressText: !selectedAddress ? form.addressText : undefined,
        laborCost: form.laborCost || selectedTech.services?.[0]?.basePrice || 0,
        travelCost: form.travelCost,
      })
      if (res.success) {
        router.push(`/orders?id=${res.order.id}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const platformFee = (form.laborCost + form.travelCost) * 0.10
  const total = form.laborCost + form.travelCost + platformFee

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['เลือกบริการ', 'เลือกช่าง', 'ยืนยัน'].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1 ? 'bg-yellow-500 text-white' : step === i + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? 'font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Step 1: Select category */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">เลือกประเภทบริการ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all ${selectedCategory?.id === cat.id ? 'border-yellow-500 bg-yellow-50' : 'hover:border-yellow-300'}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl">{cat.icon || '🔧'}</span>
                    <p className="mt-1 font-medium text-sm">{cat.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedCategory && (
              <div>
                <h3 className="font-semibold mb-3">เลือกประเภทงานย่อย</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedCategory.subCategories.map((sub: any) => (
                    <div
                      key={sub.id}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all ${
                        selectedSubCategory?.id === sub.id
                          ? 'bg-yellow-50 border-2 border-yellow-500'
                          : 'bg-white border-2 border-transparent hover:border-yellow-200'
                      }`}
                      style={{ boxShadow: '0 2px 12px rgba(180,130,0,0.10)' }}
                      onClick={() => setSelectedSubCategory(sub)}
                    >
                      <div className="cat-icon-box">{sub.icon || '🔧'}</div>
                      <span className="text-xs font-medium text-center leading-tight">{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedSubCategory}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                ถัดไป →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select technician */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">เลือกช่าง</h2>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>← กลับ</Button>
            </div>

            {technicians.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  ไม่มีช่างในประเภทบริการนี้ในขณะนี้
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {technicians.map(tech => (
                  <Card
                    key={tech.id}
                    className={`cursor-pointer transition-all ${selectedTech?.id === tech.id ? 'border-yellow-500 bg-yellow-50' : 'hover:border-yellow-300'}`}
                    onClick={() => setSelectedTech(tech)}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <div className="bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center text-2xl">
                        {tech.user?.avatarUrl ? '👨‍🔧' : '🔧'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{tech.user?.fullName || 'ช่าง'}</span>
                          {tech.verifiedAt && <Badge variant="outline" className="text-xs">✓ ยืนยันแล้ว</Badge>}
                        </div>
                        {tech.headline && <p className="text-sm text-gray-500">{tech.headline}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm">⭐ {Number(tech.ratingAvg).toFixed(1)} ({tech.ratingCount})</span>
                          {tech.services?.[0]?.basePrice && (
                            <span className="text-sm font-medium text-yellow-600">
                              ราคาเริ่มต้น ฿{Number(tech.services[0].basePrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedTech}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                ถัดไป →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm booking */}
        {step === 3 && selectedTech && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">ยืนยันการจอง</h2>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>← กลับ</Button>
            </div>

            {/* Technician summary */}
            <Card>
              <CardContent className="p-4 flex gap-3 items-center">
                <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-xl">🔧</div>
                <div>
                  <p className="font-semibold">{selectedTech.user?.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedSubCategory?.name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Job details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">รายละเอียดงาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>วันที่</Label>
                  <Input type="date" value={form.jobDate} onChange={e => setForm({ ...form, jobDate: e.target.value })} required />
                </div>
                <div>
                  <Label>เวลา</Label>
                  <Input type="time" value={form.jobTime} onChange={e => setForm({ ...form, jobTime: e.target.value })} />
                </div>
                <div>
                  <Label>รายละเอียดเพิ่มเติม</Label>
                  <Textarea placeholder="อธิบายปัญหาหรือสิ่งที่ต้องการ..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                {/* Address */}
                {addresses.length > 0 && (
                  <div>
                    <Label>ที่อยู่</Label>
                    <div className="space-y-2">
                      {addresses.map(addr => (
                        <div
                          key={addr.id}
                          className={`p-3 border rounded-lg cursor-pointer ${selectedAddress?.id === addr.id ? 'border-yellow-500 bg-yellow-50' : ''}`}
                          onClick={() => setSelectedAddress(addr)}
                        >
                          <p className="font-medium text-sm">{addr.label}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">สรุปราคา</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ค่าแรง</span>
                  <Input
                    type="number"
                    className="w-32 text-right h-8"
                    value={form.laborCost}
                    onChange={e => setForm({ ...form, laborCost: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div className="flex justify-between">
                  <span>ค่าเดินทาง</span>
                  <Input
                    type="number"
                    className="w-32 text-right h-8"
                    value={form.travelCost}
                    onChange={e => setForm({ ...form, travelCost: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>ค่าธรรมเนียม (10%)</span>
                  <span className="text-gray-500">฿{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>รวมทั้งหมด</span>
                  <span className="text-yellow-600">฿{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmitOrder}
              disabled={loading || !form.jobDate}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              size="lg"
            >
              {loading ? 'กำลังจอง…' : `จองเลย ฿${total.toFixed(2)}`}
            </Button>
          </div>
        )}
      </main>
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <BookingPageInner />
    </Suspense>
  )
}
