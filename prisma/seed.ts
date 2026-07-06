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
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
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

  const getSubCategoryId = async (categorySlug: string, subSlug: string) => {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!cat) throw new Error(`Category ${categorySlug} not found`)
    const sub = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: cat.id, slug: subSlug } },
    })
    if (!sub) throw new Error(`SubCategory ${subSlug} not found`)
    return sub.id
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
    { categoryId: homeId, name: 'กำจัดแมลง', slug: 'pest-control', icon: '🐜' },
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
      where: { categoryId_slug: { categoryId: sub.categoryId, slug: sub.slug } },
      update: {},
      create: sub,
    })
  }
  console.log('✅ SubCategories seeded')

  // =============================================
  // TECHNICIANS SEED DATA
  // =============================================
  const technicians = [
    {
      email: 'somsak.elec@demo.com',
      phone: '0811111111',
      fullName: 'สมศักดิ์ วิชัยรุ่งโรจน์',
      avatarUrl: null,
      profession: 'electrical' as const,
      headline: 'ช่างไฟฟ้า 15 ปี บริการรวดเร็ว ราคายุติธรรม',
      bio: 'รับงานติดตั้งและซ่อมไฟฟ้าภายในบ้าน คอนโด อาคารสำนักงาน มีใบ กว. ไฟฟ้า พร้อมใบรับรอง บริการ 24 ชม. ทั่วกรุงเทพฯ และปริมณฑล',
      yearsExperience: 15,
      hourlyRate: 350,
      ratingAvg: 4.8,
      ratingCount: 127,
      isAvailable: true,
      verifiedAt: new Date(),
      latitude: 13.7563,
      longitude: 100.5018,
      serviceRadius: 20,
      certifications: [
        { name: 'ใบอนุญาตช่างไฟฟ้า กว.', issuer: 'กรมพัฒนาพลังงานทดแทน', year: '2561', fileUrl: '' },
        { name: 'วุฒิบัตรช่างไฟฟ้า ระดับ 3', issuer: 'สถาบันพัฒนาบุคลากร', year: '2558', fileUrl: '' },
      ],
      categories: ['repair', 'it'],
      services: [
        { subCatSlug: 'electric', price: 300, desc: 'ติดตั้งปลั๊กไฟ สวิตช์ ดวงโคม', images: [] },
        { subCatSlug: 'electric', price: 500, desc: 'ซ่อมไฟฟ้าลัดวงจร ดูแลตู้คอนทรอล', images: [] },
        { subCatSlug: 'cctv', price: 800, desc: 'ติดตั้งกล้องวงจรปิด CCTV', images: [] },
      ],
      portfolio: [
        { images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], caption: 'ติดตั้งระบบไฟฟ้าภายในบ้านเดี่ยว 2 ชั้น ย่านสยาม' },
        { images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], caption: 'เดินสายไฟใหม่หมดในคอนโดมิเนียม ระยะเวลา 2 วัน' },
      ],
    },
    {
      email: 'malee.plum@demo.com',
      phone: '0822222222',
      fullName: 'มาลี รัตนโชติสกุล',
      avatarUrl: null,
      profession: 'plumbing' as const,
      headline: 'ช่างประปามืออาชีพ รับติดตั้ง-ซ่อมท่อน้ำทุกชนิด',
      bio: 'เชี่ยวชาญงานประปามากว่า 10 ปี รับติดตั้ง ซ่อม ดัด ต่อท่อน้ำ ท่อระบายน้ำ ห้องน้ำ ครัว งานเดินท่อใหม่ท่อเก่า รับประกันงาน 6 เดือน',
      yearsExperience: 12,
      hourlyRate: 300,
      ratingAvg: 4.6,
      ratingCount: 89,
      isAvailable: true,
      verifiedAt: new Date(),
      latitude: 13.7234,
      longitude: 100.5297,
      serviceRadius: 15,
      certifications: [
        { name: 'ใบรับรองช่างประปา', issuer: 'สมาคมช่างประปาแห่งประเทศไทย', year: '2560', fileUrl: '' },
      ],
      categories: ['repair', 'home'],
      services: [
        { subCatSlug: 'plumbing', price: 250, desc: 'ซ่อมก็อกรั่ว น้ำไม่ไหล ท่ออุดตัน', images: [] },
        { subCatSlug: 'plumbing', price: 800, desc: 'เดินท่อน้ำใหม่ ขนาด 1/2-2 นิ้ว', images: [] },
        { subCatSlug: 'general', price: 400, desc: 'ติดตั้งสุขภัณฑ์ อ่างล้างหน้า', images: [] },
      ],
      portfolio: [
        { images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400'], caption: 'รีโนเวทห้องน้ำคอนโดใหม่ย่านพระราม 9' },
      ],
    },
    {
      email: 'kittipong.it@demo.com',
      phone: '0833333333',
      fullName: 'กิตติพงศ์ ศรีสว่างวงศ์',
      avatarUrl: null,
      profession: 'it' as const,
      headline: 'ช่าง IT รับซ่อมคอม และติดตั้งระบบเครือข่าย',
      bio: 'วิศวกร IT อาวุโส รับซ่อมคอมพิวเตอร์ โน้ตบุ๊ก ติดตั้ง Windows, macOS, Linux ติดตั้งระบบเครือข่าย LAN/WiFi ออกแบบระบบ Cloud Server สำหรับธุรกิจขนาดเล็ก-กลาง',
      yearsExperience: 10,
      hourlyRate: 500,
      ratingAvg: 4.9,
      ratingCount: 203,
      isAvailable: true,
      verifiedAt: new Date(),
      latitude: 13.6842,
      longitude: 100.6322,
      serviceRadius: 30,
      certifications: [
        { name: 'CCNA Routing & Switching', issuer: 'Cisco', year: '2562', fileUrl: '' },
        { name: 'CompTIA A+ Certified', issuer: 'CompTIA', year: '2561', fileUrl: '' },
        { name: 'Microsoft Certified: Azure', issuer: 'Microsoft', year: '2563', fileUrl: '' },
      ],
      categories: ['it'],
      services: [
        { subCatSlug: 'computer', price: 500, desc: 'ซ่อมคอมพิวเตอร์/โน้ตบุ๊ก  диагностика ฟรี', images: [] },
        { subCatSlug: 'internet', price: 1000, desc: 'ออกแบบและติดตั้งระบบ WiFi ออฟฟิศ', images: [] },
        { subCatSlug: 'cloud', price: 2000, desc: 'ติดตั้งและตั้งค่า Cloud Server', images: [] },
        { subCatSlug: 'cctv', price: 900, desc: 'ติดตั้งกล้องวงจรปิด Hikvision', images: [] },
      ],
      portfolio: [
        { images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'], caption: 'ติดตั้งระบบ Server Room ให้บริษัท Logistics ในนิคมอุตสาหกรรม' },
        { images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400'], caption: 'ออกแบบระบบเครือข่าย WiFi ให้ Co-working Space 5 ชั้น' },
        { images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400'], caption: 'กู้ข้อมูลจาก Harddisk เสียหาย สำเร็จ 100%' },
      ],
    },
    {
      email: 'suda.const@demo.com',
      phone: '0844444444',
      fullName: 'สุดา แสนทองดี',
      avatarUrl: null,
      profession: 'construction' as const,
      headline: 'รับเหมาก่อสร้าง ต่อเติม รีโนเวท ราคาชัด ไม่มีบวก',
      bio: 'ผู้รับเหมาก่อสร้างที่มีประสบการณ์กว่า 20 ปี รับงานก่อสร้างบ้าน อาคาร ต่อเติม รีโนเวททั้งหมด มีทีมงานช่างครบวงจร รับงานได้ทั้งโครงการเล็กและใหญ่ ราคาชัดเจน ไม่มีค่าใช้จ่ายซ่อนเร้น',
      yearsExperience: 20,
      hourlyRate: 400,
      ratingAvg: 4.7,
      ratingCount: 64,
      isAvailable: false,
      verifiedAt: new Date(),
      latitude: 13.8129,
      longitude: 100.5621,
      serviceRadius: 50,
      certifications: [
        { name: 'ใบอนุญาตรับเหมาก่อสร้าง', issuer: 'สภาวิศวกร', year: '2553', fileUrl: '' },
        { name: 'มาตรฐาน ISO 9001', issuer: 'TISI', year: '2562', fileUrl: '' },
      ],
      categories: ['construction', 'repair'],
      services: [
        { subCatSlug: 'general-contractor', price: 0, desc: 'รับเหมาก่อสร้างบ้าน อาคาร เปิดราคาตามแบบ', images: [] },
        { subCatSlug: 'masonry', price: 300, desc: 'งานปูน ก่ออิฐ ฉาบ ปูกระเบื้อง', images: [] },
        { subCatSlug: 'painting', price: 80, desc: 'ทาสีภายนอก-ใน ตราสี ราคาต่อ ตร.ม.', images: [] },
        { subCatSlug: 'flooring', price: 250, desc: 'ปูพื้นกระเบื้อง ต่อ ตร.ม.', images: [] },
      ],
      portfolio: [
        { images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400'], caption: 'ต่อเติมครัวและระเบียงหลังบ้าน บ้านเดี่ยวชานเมือง' },
        { images: ['https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=400'], caption: 'รีโนเวทบ้าน 2 ชั้น ให้เป็นบ้านมินิมอลสไตล์ญี่ปุ่น' },
      ],
    },
    {
      email: 'chai.aut@demo.com',
      phone: '0855555555',
      fullName: 'ชัยยศ วงศ์ไทย',
      avatarUrl: null,
      profession: 'it' as const,
      headline: 'ช่างยานยนต์ 18 ปี ซ่อมเครื่องยนต์ รับรถทุกยี่ห้อ',
      bio: 'ช่างยนต์มืออาชีพ รับซ่อมเครื่องยนต์ ระบบเกียร์ ระบบเบรก ระบบไฟ รับเปลี่ยนถ่ายน้ำมันเครื่อง รับตรวจเช็คสภาพรถ รับรถทุกยี่ห้อ รับงานทั้งรถเล็กและรถบรรทุก',
      yearsExperience: 18,
      hourlyRate: 400,
      ratingAvg: 4.5,
      ratingCount: 156,
      isAvailable: true,
      verifiedAt: new Date(),
      latitude: 13.6029,
      longitude: 100.7312,
      serviceRadius: 30,
      certifications: [
        { name: 'วุฒิบัตรช่างยนต์ ระดับ 3', issuer: 'กรมพัฒนาฝีมือแรงงาน', year: '2556', fileUrl: '' },
        { name: 'ใบรับรองระบบแอร์รถยนต์', issuer: 'สมาคมช่างยนต์ไทย', year: '2559', fileUrl: '' },
      ],
      categories: ['automotive'],
      services: [
        { subCatSlug: 'engine', price: 500, desc: 'ตรวจเช็คและซ่อมเครื่องยนต์', images: [] },
        { subCatSlug: 'tire', price: 200, desc: 'เปลี่ยนยาง ตั้มลมยาง สลับยาง', images: [] },
        { subCatSlug: 'car-electric', price: 400, desc: 'ซ่อมระบบไฟรถยนต์ อัลเทอร์นีเตอร์ ไดนาโม', images: [] },
        { subCatSlug: 'car-wash', price: 300, desc: 'ล้างรถ ขัดสี ถ่ายน้ำมันเครื่อง เปลี่ยนถ่ายน้ำมันเกียร์', images: [] },
      ],
      portfolio: [
        { images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400'], caption: 'ซ่อมเครื่อง Toyota Camry ทำลายเกียร์ CVT' },
        { images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], caption: 'ตรวจเช็คระบบแอร์รถยนต์ BMW X3 รีชาร์จแก๊ส R134a' },
      ],
    },
  ]

  // =============================================
  // INSERT TECHNICIANS
  // =============================================
  for (const tech of technicians) {
    const passwordHash = '$2b$10$demopasswordhashfordemo1234567890' // dummy hash, not for login

    const user = await prisma.user.upsert({
      where: { email: tech.email },
      update: {},
      create: {
        email: tech.email,
        phone: tech.phone,
        passwordHash,
        role: 'technician',
        fullName: tech.fullName,
        avatarUrl: tech.avatarUrl,
        isVerified: true,
      },
    })

    const existingTech = await prisma.technician.findUnique({ where: { userId: user.id } })
    if (existingTech) {
      console.log(`⏩ Technician ${tech.fullName} already exists, skipping...`)
      continue
    }

    const technician = await prisma.technician.create({
      data: {
        userId: user.id,
        profession: tech.profession,
        headline: tech.headline,
        bio: tech.bio,
        yearsExperience: tech.yearsExperience,
        hourlyRate: tech.hourlyRate,
        ratingAvg: tech.ratingAvg,
        ratingCount: tech.ratingCount,
        isAvailable: tech.isAvailable,
        verifiedAt: tech.verifiedAt,
        latitude: tech.latitude,
        longitude: tech.longitude,
        serviceRadius: tech.serviceRadius,
        certifications: tech.certifications as any,
      },
    })

    // Categories
    for (const catSlug of tech.categories) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
      if (cat) {
        await prisma.technicianCategory.create({
          data: { technicianId: technician.id, categoryId: cat.id },
        })
      }
    }

    // Services
    for (const svc of tech.services) {
      const subCatId = await getSubCategoryId('repair', svc.subCatSlug)
        .catch(() => null)
        .catch(() => getSubCategoryId('it', svc.subCatSlug)
          .catch(() => getSubCategoryId('automotive', svc.subCatSlug)
            .catch(() => null)))

      const actualSubCatId = await (async () => {
        const slugs = ['repair', 'it', 'construction', 'automotive', 'home', 'beauty', 'education', 'event']
        for (const s of slugs) {
          try { return await getSubCategoryId(s, svc.subCatSlug) } catch {}
        }
        return null
      })()

      if (actualSubCatId) {
        await prisma.technicianService.create({
          data: {
            technicianId: technician.id,
            subCategoryId: actualSubCatId,
            description: svc.desc,
            basePrice: svc.price,
            images: svc.images,
          },
        })
      }
    }

    // Portfolio
    for (const item of tech.portfolio) {
      await prisma.portfolioItem.create({
        data: {
          technicianId: technician.id,
          images: item.images,
          caption: item.caption,
        },
      })
    }

    console.log(`✅ Technician: ${tech.fullName} (${tech.email})`)
    console.log(`   📍 Lat: ${tech.latitude}, Lng: ${tech.longitude} | Radius: ${tech.serviceRadius}km`)
    console.log(`   ⭐ ${tech.ratingAvg}/5 (${tech.ratingCount} reviews) | ${tech.yearsExperience} yrs exp`)
    console.log(`   🔧 Services: ${tech.services.map(s => s.subCatSlug).join(', ')}`)
    console.log(`   🖼️  Portfolio: ${tech.portfolio.length} items`)
    console.log(`   🏅 Certifications: ${tech.certifications.length}`)
  }

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
