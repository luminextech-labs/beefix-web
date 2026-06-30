import { NextRequest, NextResponse } from 'next/server'
import { supabase, getPublicUrl } from '@/lib/storage'
import { authGuard } from '@/lib/auth/guard'

export async function POST(req: NextRequest) {
  const auth = authGuard(req)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'chat'

    if (!file) {
      return NextResponse.json({ success: false, message: 'ไม่พบไฟล์' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'รองรับเฉพาะไฟล์ภาพ (JPEG, PNG, GIF, WebP)' }, { status: 400 })
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'ไฟล์ต้องไม่เกิน 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${auth.user.userId}/${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error || !data) {
      console.error('Upload error:', error)
      return NextResponse.json({ success: false, message: 'อัปโหลดไฟล์ไม่สำเร็จ' }, { status: 500 })
    }

    const publicUrl = getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: publicUrl, path: data.path })
  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
