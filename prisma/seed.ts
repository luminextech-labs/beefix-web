import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // =============================================
  // CATEGORIES
  // =============================================
  const categories = [
    { name: 'ซ่อม/ติดตั้ง', slug: 'repair', icon: '⚡' },
    { name: 'ก่อสร้าง/ต่อเติม', slug: 'construction', icon: '🏗' },
    { name: 'IT/เทคโนโลยี', slug: 'it', icon: '💻' },
    { name: 'ยานยนต์', slug: 'automotive', icon: '🚗' },
    { name: 'บริการบ้าน', slug: 'home', icon: '🏠' },
    { name: 'เสริมสวย/สุขภาพ', slug: 'beauty', icon: '💄' },
    { name: 'สอน/ติว', slug: 'education', icon: '📚' },
    { name: 'อีเวนต์/อื่นๆ', slug: 'event', icon: '🎨' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories seeded')

  // =============================================
  // SUB CATEGORIES
  // =============================================
  const getCategoryId = async (slug: string) => {
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) throw new Error(`Category ${slug} not found`)
    return cat.id
  }

  const repairId = await getCategoryId('repair')
  const constructionId = await getCategoryId('construction')
  const itId = await getCategoryId('it')
  const automotiveId = await getCategoryId('automotive')
  const homeId = await getCategoryId('home')
  const beautyId = await getCategoryId('beauty')
  const educationId = await getCategoryId('education')
  const eventId = await getCategoryId('event')

  const subCategories = [
    // ซ่อม/ติดตั้ง
    { categoryId: repairId, name: 'ไฟฟ้า', slug: 'electric', icon: '⚡' },
    { categoryId: repairId, name: 'ประปา', slug: 'plumbing', icon: '🚿' },
    { categoryId: repairId, name: 'แอร์', slug: 'aircon', icon: '❄️' },
    { categoryId: repairId, name: 'กลอน/ล็อก', slug: 'lock', icon: '🔐' },
    { categoryId: repairId, name: 'หน้าต่าง/ประตู', slug: 'door-window', icon: '🚪' },
    { categoryId: repairId, name: 'หลังคา', slug: 'roof', icon: '🏠' },
    { categoryId: repairId, name: 'เฟอร์นิเจอร์', slug: 'furniture', icon: '🪑' },
    { categoryId: repairId, name: 'โทรศัพท์/แท็บเล็ต', slug: 'phone-tablet', icon: '📱' },
    { categoryId: repairId, name: 'ซ่อมทั่วไป', slug: 'general', icon: '🔧' },

    // ก่อสร้าง/ต่อเติม
    { categoryId: constructionId, name: 'รับเหมาทั่วไป', slug: 'general-contractor', icon: '🏗️' },
    { categoryId: constructionId, name: 'ช่างปูน/ก่ออิฐ', slug: 'masonry', icon: '🧱' },
    { categoryId: constructionId, name: 'ช่างเชื่อม', slug: 'welding', icon: '⚙️' },
    { categoryId: constructionId, name: 'กระจก/อลูมิเนียม', slug: 'glass', icon: '🪟' },
    { categoryId: constructionId, name: 'ทาสี/ฉาบ', slug: 'painting', icon: '🎨' },
    { categoryId: constructionId, name: 'ปูพื้น/กระเบื้อง', slug: 'flooring', icon: '🪵' },

    // IT/เทคโนโลยี
    { categoryId: itId, name: 'ซ่อมคอม/โน้ตบุ๊ก', slug: 'computer', icon: '🖥️' },
    { categoryId: itId, name: 'ติดตั้งอินเทอร์เน็ต', slug: 'internet', icon: '📶' },
    { categoryId: itId, name: 'ติดตั้งกล้อง', slug: 'camera', icon: '📹' },
    { categoryId: itId, name: 'ออกแบบเว็บไซต์', slug: 'web-design', icon: '🌐' },
    { categoryId: itId, name: 'ออกแบบกราฟิก', slug: 'graphic', icon: '🎨' },
    { categoryId: itId, name: 'ซ่อมโทรศัพท์', slug: 'phone-repair', icon: '📱' },
    { categoryId: itId, name: 'Cloud/Server', slug: 'cloud', icon: '☁️' },
    { categoryId: itId, name: 'ติดตั้งกล้องวงจรปิด', slug: 'cctv', icon: '🔒' },
    { categoryId: itId, name: 'กู้ข้อมูล', slug: 'data-recovery', icon: '💾' },

    // ยานยนต์
    { categoryId: automotiveId, name: 'ซ่อมเครื่องยนต์', slug: 'engine', icon: '🔧' },
    { categoryId: automotiveId, name: 'เปลี่ยนยาง', slug: 'tire', icon: '🛞' },
    { categoryId: automotiveId, name: 'ล้างรถ/ขัดสี', slug: 'car-wash', icon: '🚿' },
    { categoryId: automotiveId, name: 'ไฟฟ้ารถยนต์', slug: 'car-electric', icon: '⚡' },
    { categoryId: automotiveId, name: 'กระจกรถยนต์', slug: 'car-glass', icon: '🪟' },

    // บริการบ้าน
    { categoryId: homeId, name: 'ทำความสะอาด', slug: 'cleaning', icon: '🧹' },
    { categoryId: homeId, name: 'อาบู/กำจัดปects', slug: 'pest-control', icon: '🐜' },
    { categoryId: homeId, name: 'เคลื่อนย้ายบ้าน/ของ', slug: 'moving', icon: '📦' },
    { categoryId: homeId, name: 'ดูแลสัตว์เลี้ยง', slug: 'pet-care', icon: '🐕' },
    { categoryId: homeId, name: 'ตัดหญ้า/ดูแลสวน', slug: 'gardening', icon: '🌿' },

    // เสริมสวย/สุขภาพ
    { categoryId: beautyId, name: 'ตัดผม', slug: 'haircut', icon: '💇' },
    { categoryId: beautyId, name: 'ทำเล็บ', slug: 'nail', icon: '💅' },
    { categoryId: beautyId, name: 'นวด/สปา', slug: 'massage', icon: '💆' },
    { categoryId: beautyId, name: 'แต่งหน้า/แต่งผม', slug: 'makeup', icon: '💄' },

    // สอน/ติว
    { categoryId: educationId, name: 'สอนพิเศษ', slug: 'tutoring', icon: '📖' },
    { categoryId: educationId, name: 'ติวสอบ', slug: 'exam-prep', icon: '📝' },
    { categoryId: educationId, name: 'สอนดนตรี', slug: 'music', icon: '🎵' },
    { categoryId: educationId, name: 'สอนภาษา', slug: 'language', icon: '🗣️' },

    // อีเวนต์/อื่นๆ
    { categoryId: eventId, name: 'ถ่ายภาพ/วิดีโอ', slug: 'photography', icon: '📷' },
    { categoryId: eventId, name: 'จัดงานอีเวนต์', slug: 'event-planning', icon: '🎉' },
    { categoryId: eventId, name: 'พิธีกร', slug: 'mc', icon: '🎤' },
    { categoryId: eventId, name: 'งานตามสั่ง/รับจ้าง', slug: 'freelance', icon: '🤝' },
  ]

  for (const sub of subCategories) {
    await prisma.subCategory.upsert({
      where: {
        categoryId_slug: {
          categoryId: sub.categoryId,
          slug: sub.slug,
        },
      },
      update: {},
      create: sub,
    })
  }
  console.log('✅ SubCategories seeded')

  // =============================================
  // SYSTEM COUPON (Welcome bonus)
  // =============================================
  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      discountType: 'percent',
      discountValue: 50,
      minOrderAmount: 0,
      maxDiscount: 100,
      validFrom: new Date(),
      validUntil: new Date('2030-12-31'),
      usageLimit: 1,
      isActive: true,
    },
  })
  console.log('✅ System coupon seeded')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
