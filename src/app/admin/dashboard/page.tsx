'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | 'executive' | 'buyers' | 'sellers' | 'jobs' | 'orders' | 'escrow'
  | 'withdrawal' | 'payments' | 'promotions' | 'notifications'
  | 'support' | 'reviews' | 'cms' | 'categories' | 'search'
  | 'analytics' | 'fraud' | 'ai' | 'marketing' | 'server'
  | 'logs' | 'security' | 'admin' | 'files' | 'api' | 'financial'
  | 'automation' | 'settings' | 'widgets';

interface NavItem {
  id: SectionId;
  label: string;
  icon: string;
  group: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TH = {
  currency: (n: number) => `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`,
  number: (n: number) => n.toLocaleString('th-TH'),
  date: (d: string) => d,
};

const mockKPI = {
  gmv: 48200000,
  revenue: 4820000,
  commission: 964000,
  grossProfit: 3200000,
  activeUsers: 18420,
  newUsersToday: 312,
  newBuyers: 180,
  newSellers: 132,
  todaysJobs: 847,
  inProgress: 1240,
  completed: 38291,
  cancelled: 892,
  tickets: 34,
  disputes: 12,
  escrowHeld: 5840000,
  pendingWithdrawal: 1280000,
  conversionRate: 3.8,
  aov: 4850,
  ltv: 12400,
  cac: 820,
  retentionRate: 78.5,
};

const mockBuyers = [
  { id: 'B001', name: 'สมชาย วงศ์สกุล', email: 'somchai@email.com', spend: 48500, orders: 12, trustScore: 94, status: 'active', kyc: 'verified', joined: '2024-03-15', lastLogin: '2026-07-09' },
  { id: 'B002', name: 'พิมพ์ชนก สุขใจ', email: 'pimchanok@email.com', spend: 12800, orders: 5, trustScore: 88, status: 'active', kyc: 'verified', joined: '2024-07-22', lastLogin: '2026-07-08' },
  { id: 'B003', name: 'ธนา นาคะรินทร์', email: 'thana@email.com', spend: 3200, orders: 2, trustScore: 71, status: 'suspended', kyc: 'pending', joined: '2025-01-10', lastLogin: '2026-06-30' },
  { id: 'B004', name: 'อลินา บุญธรรม', email: 'alina@email.com', spend: 67200, orders: 24, trustScore: 99, status: 'active', kyc: 'verified', joined: '2023-11-05', lastLogin: '2026-07-09' },
  { id: 'B005', name: 'ภูริพล แสนโพธิ์', email: 'puri@email.com', spend: 8900, orders: 4, trustScore: 82, status: 'active', kyc: 'verified', joined: '2025-02-28', lastLogin: '2026-07-07' },
];

const mockSellers = [
  { id: 'S001', name: 'มานะ ศิลป์วัฒนา', skill: 'งานไฟฟ้า', income: 384000, withdrawn: 320000, rating: 4.9, responseRate: 98, completionRate: 97, onTime: 96, status: 'active', jobsDone: 342 },
  { id: 'S002', name: 'นภา รักสงบ', skill: 'งานประปา', income: 215000, withdrawn: 180000, rating: 4.7, responseRate: 95, completionRate: 94, onTime: 92, status: 'active', jobsDone: 187 },
  { id: 'S003', name: 'ชัยวัฒน์ ใจดี', skill: 'งานเชื่อม', income: 520000, withdrawn: 480000, rating: 4.8, responseRate: 91, completionRate: 89, onTime: 88, status: 'active', jobsDone: 456 },
  { id: 'S004', name: 'สุภาพร มั่นคง', skill: 'งานก่อสร้าง', income: 89000, withdrawn: 60000, rating: 4.5, responseRate: 87, completionRate: 85, onTime: 83, status: 'warning', jobsDone: 78 },
  { id: 'S005', name: 'ณัฐพล วีระพงษ์', skill: 'งานติดตั้ง', income: 156000, withdrawn: 140000, rating: 4.6, responseRate: 93, completionRate: 91, onTime: 90, status: 'suspended', jobsDone: 134 },
];

const mockJobs = [
  { id: 'J001', title: 'ติดตั้งแอร์ 2 คอมเพรสเซอร์', owner: 'สมชาย วงศ์สกุล', freelancer: 'มานะ ศิลป์วัฒนา', price: 8500, status: 'in_progress', timeline: '2 ชม.', created: '2026-07-09', chat: true },
  { id: 'J002', title: 'เดินสายไฟบ้าน 2 ชั้น', owner: 'พิมพ์ชนก สุขใจ', freelancer: 'ณัฐพล วีระพงษ์', price: 12000, status: 'completed', timeline: '1 วัน', created: '2026-07-07', chat: false },
  { id: 'J003', title: 'ซ่อมปั๊มน้ำ', owner: 'ธนา นาคะรินทร์', freelancer: '-', price: 2500, status: 'pending', timeline: '30 นาที', created: '2026-07-09', chat: false },
  { id: 'J004', title: 'ติดตั้งกล้อง CCTV 4 ตัว', owner: 'อลินา บุญธรรม', freelancer: 'ชัยวัฒน์ ใจดี', price: 15000, status: 'delivered', timeline: '4 ชม.', created: '2026-07-08', chat: true },
  { id: 'J005', title: 'ปรับปรุงห้องครัว', owner: 'ภูริพล แสนโพธิ์', freelancer: 'สุภาพร มั่นคง', price: 35000, status: 'disputed', timeline: '3 วัน', created: '2026-07-05', chat: true },
  { id: 'J006', title: 'เปลี่ยนท่อน้ำทิ้ง', owner: 'สมชาย วงศ์สกุล', freelancer: 'นภา รักสงบ', price: 3000, status: 'cancelled', timeline: '1 ชม.', created: '2026-07-06', chat: false },
  { id: 'J007', title: 'ติดตั้งโซลาร์เซลล์', owner: 'อลินา บุญธรรม', freelancer: 'มานะ ศิลป์วัฒนา', price: 85000, status: 'in_progress', timeline: '2 วัน', created: '2026-07-08', chat: true },
];

const mockOrders = [
  { id: 'ORD001', customer: 'สมชาย วงศ์สกุล', service: 'ติดตั้งแอร์ 2 คอมเพรสเซอร์', amount: 8500, tax: 595, commission: 850, status: 'completed', receipt: 'RC001', escrow: 'released', date: '2026-07-09' },
  { id: 'ORD002', customer: 'พิมพ์ชนก สุขใจ', service: 'เดินสายไฟบ้าน 2 ชั้น', amount: 12000, tax: 840, commission: 1200, status: 'completed', receipt: 'RC002', escrow: 'released', date: '2026-07-08' },
  { id: 'ORD003', customer: 'ธนา นาคะรินทร์', service: 'ซ่อมปั๊มน้ำ', amount: 2500, tax: 175, commission: 250, status: 'pending', receipt: '-', escrow: 'held', date: '2026-07-09' },
  { id: 'ORD004', customer: 'อลินา บุญธรรม', service: 'ติดตั้งกล้อง CCTV 4 ตัว', amount: 15000, tax: 1050, commission: 1500, status: 'refunded', receipt: 'RC003', escrow: 'refunded', date: '2026-07-07' },
  { id: 'ORD005', customer: 'ภูริพล แสนโพธิ์', service: 'ปรับปรุงห้องครัว', amount: 35000, tax: 2450, commission: 3500, status: 'disputed', receipt: '-', escrow: 'held', date: '2026-07-05' },
];

const mockEscrow = [
  { id: 'ESC001', order: 'ORD001', amount: 8500, status: 'released', heldAt: '2026-07-07', releasedAt: '2026-07-09', reason: 'Job completed' },
  { id: 'ESC002', order: 'ORD003', amount: 2500, status: 'held', heldAt: '2026-07-09', releasedAt: '-', reason: 'Awaiting delivery' },
  { id: 'ESC003', order: 'ORD005', amount: 35000, status: 'problem', heldAt: '2026-07-05', releasedAt: '-', reason: 'Disputed by buyer' },
  { id: 'ESC004', order: 'ORD006', amount: 6200, status: 'pending_release', heldAt: '2026-07-08', releasedAt: '-', reason: 'Auto-release in 24h' },
  { id: 'ESC005', order: 'ORD007', amount: 18500, status: 'held', heldAt: '2026-07-08', releasedAt: '-', reason: 'In progress' },
  { id: 'ESC006', order: 'ORD008', amount: 4200, status: 'released', heldAt: '2026-07-06', releasedAt: '2026-07-07', reason: 'Job completed' },
];

const mockWithdrawals = [
  { id: 'WD001', seller: 'มานะ ศิลป์วัฒนา', bank: 'SCB', account: '***4521', amount: 50000, fee: 15, method: 'bank_transfer', status: 'approved', date: '2026-07-09' },
  { id: 'WD002', seller: 'นภา รักสงบ', bank: 'KBANK', account: '***8832', amount: 15000, fee: 10, method: 'promptpay', status: 'approved', date: '2026-07-09' },
  { id: 'WD003', seller: 'ชัยวัฒน์ ใจดี', bank: 'SCB', account: '***1109', amount: 80000, fee: 25, method: 'bank_transfer', status: 'pending', date: '2026-07-09' },
  { id: 'WD004', seller: 'สุภาพร มั่นคง', bank: 'BBL', account: '***7723', amount: 5000, fee: 5, method: 'promptpay', status: 'rejected', date: '2026-07-08', rejectReason: 'Account mismatch' },
  { id: 'WD005', seller: 'ณัฐพล วีระพงษ์', bank: 'KBank', account: '***3341', amount: 25000, fee: 15, method: 'bank_transfer', status: 'approved', date: '2026-07-08' },
];

const mockPayments = [
  { id: 'PAY001', type: 'credit_card', amount: 8500, status: 'success', date: '2026-07-09', gateway: 'Stripe', card: '****4242' },
  { id: 'PAY002', type: 'qr_promptpay', amount: 12000, status: 'success', date: '2026-07-08', gateway: 'SCB QR', card: '-' },
  { id: 'PAY003', type: 'bank_transfer', amount: 35000, status: 'pending', date: '2026-07-09', gateway: 'Manual', card: 'BAAC-8842' },
  { id: 'PAY004', type: 'wallet', amount: 2500, status: 'success', date: '2026-07-09', gateway: 'Beefix Wallet', card: '-' },
  { id: 'PAY005', type: 'credit_card', amount: 6200, status: 'failed', date: '2026-07-09', gateway: 'Stripe', card: '****1234', error: 'Insufficient funds' },
  { id: 'PAY006', type: 'qr_promptpay', amount: 4800, status: 'chargeback', date: '2026-07-07', gateway: 'KBank QR', card: '-', error: 'Customer disputed' },
  { id: 'PAY007', type: 'credit_card', amount: 15000, status: 'success', date: '2026-07-08', gateway: 'Stripe', card: '****8888' },
];

const mockPromotions = [
  { id: 'PR001', type: 'coupon', code: 'NEWUSER50', discount: '฿50', minSpend: 300, usage: 1240, limit: 5000, status: 'active', exp: '2026-08-31' },
  { id: 'PR002', type: 'flash_sale', name: 'ลดราคา 20% สุดสัปดาห์', discount: '20%', usage: 3420, limit: null, status: 'active', exp: '2026-07-12' },
  { id: 'PR003', type: 'referral', name: 'แนะนำเพื่อน', bonus: '฿100', usage: 892, status: 'active', exp: '2026-12-31' },
  { id: 'PR004', type: 'cashback', name: 'คืนเงิน 10%', cashback: '10%', usage: 2100, status: 'paused', exp: '2026-07-20' },
  { id: 'PR005', type: 'campaign', name: 'แคมเปญวันเด็ก', budget: 50000, spent: 32000, usage: 640, status: 'active', exp: '2026-08-15' },
  { id: 'PR006', type: 'voucher', code: 'BEEFIX500', discount: '฿500', minSpend: 2000, usage: 45, limit: 200, status: 'expired', exp: '2026-06-30' },
];

const mockTickets = [
  { id: 'TK001', subject: 'เงินไม่เข้าบัญชี', user: 'ภูริพล แสนโพธิ์', type: 'payment', status: 'open', priority: 'high', assigned: 'ทีมงาน A', date: '2026-07-09' },
  { id: 'TK002', subject: 'ช่างไม่ตอบแชท', user: 'พิมพ์ชนก สุขใจ', type: 'complaint', status: 'pending', priority: 'medium', assigned: 'ทีมงาน B', date: '2026-07-08' },
  { id: 'TK003', subject: 'ขอยกเลิกงาน', user: 'ธนา นาคะรินทร์', type: 'refund', status: 'closed', priority: 'low', assigned: 'ทีมงาน A', date: '2026-07-07' },
  { id: 'TK004', subject: 'คุณภาพงานไม่ตรงปก', user: 'สมชาย วงศ์สกุล', type: 'dispute', status: 'open', priority: 'high', assigned: '-', date: '2026-07-09' },
  { id: 'TK005', subject: 'ต้องการใบเสร็จรับเงิน', user: 'อลินา บุญธรรม', type: 'general', status: 'pending', priority: 'low', assigned: 'ทีมงาน C', date: '2026-07-08' },
];

const mockReviews = [
  { id: 'RV001', from: 'สมชาย วงศ์สกุล', to: 'มานะ ศิลป์วัฒนา', job: 'ติดตั้งแอร์', rating: 5, comment: 'ช่างเชี่ยวชาญมาก ทำงานเรียบร้อย พูดจาดี', status: 'visible', date: '2026-07-09', fakeScore: 0.1 },
  { id: 'RV002', from: 'พิมพ์ชนก สุขใจ', to: 'นภา รักสงบ', job: 'เดินสายไฟบ้าน', rating: 4, comment: 'ทำงานได้ดี แต่มาสาย 30 นาที', status: 'visible', date: '2026-07-08', fakeScore: 0.2 },
  { id: 'RV003', from: 'ธนา นาคะรินทร์', to: 'ณัฐพล วีระพงษ์', job: 'ซ่อมปั๊มน้ำ', rating: 1, comment: 'ทำงานไม่เสร็จ เรียกเพิ่มเงิน', status: 'hidden', date: '2026-07-07', fakeScore: 0.9 },
  { id: 'RV004', from: 'อลินา บุญธรรม', to: 'ชัยวัฒน์ ใจดี', job: 'ติดตั้งกล้อง CCTV', rating: 5, comment: 'ติดตั้งสวยมาก ราคายุติธรรม', status: 'visible', date: '2026-07-08', fakeScore: 0.05 },
  { id: 'RV005', from: 'ภูริพล แสนโพธิ์', to: 'สุภาพร มั่นคง', job: 'ปรับปรุงห้องครัว', rating: 2, comment: 'วัสดุไม่ตรงปก ต้องแก้หลายจุด', status: 'reported', date: '2026-07-06', fakeScore: 0.7 },
];

const mockCMS = [
  { id: 'CMS001', type: 'banner', title: 'แบนเนอร์หน้าแรก', content: 'ส่วนลด 20% วันเสาร์-อาทิตย์', status: 'published', updated: '2026-07-01' },
  { id: 'CMS002', type: 'blog', title: 'วิธีเลือกช่างไฟที่ดี', content: 'คู่มือเลือกช่างไฟสำหรับบ้าน...', status: 'published', updated: '2026-06-28' },
  { id: 'CMS003', type: 'faq', title: 'คำถามที่พบบ่อย', content: 'คำตอบสำหรับคำถามทั่วไป...', status: 'published', updated: '2026-07-02' },
  { id: 'CMS004', type: 'terms', title: 'ข้อกำหนดการใช้งาน', content: 'ข้อตกลงและเงื่อนไขการใช้บริการ...', status: 'draft', updated: '2026-06-15' },
  { id: 'CMS005', type: 'privacy', title: 'นโยบายความเป็นส่วนตัว', content: 'นโยบายการเก็บข้อมูลและความเป็นส่วนตัว...', status: 'published', updated: '2026-05-20' },
  { id: 'CMS006', type: 'help', title: 'ศูนย์ช่วยเหลือ', content: 'แนะนำการใช้งานแพลตฟอร์ม...', status: 'published', updated: '2026-07-03' },
];

const mockCategories = [
  { id: 'CAT001', name: 'ไฟฟ้า', icon: '💡', tags: ['ติดตั้งแอร์', 'เดินสายไฟ', 'ซ่อมไฟฟ้า'], skills: 1240, jobs: 3840, status: 'active' },
  { id: 'CAT002', name: 'ประปา', icon: '🚿', tags: ['ซ่อมปั๊มน้ำ', 'เปลี่ยนท่อ', 'ติดตั้งสุขภัณฑ์'], skills: 890, jobs: 2150, status: 'active' },
  { id: 'CAT003', name: 'เชื่อม/โลหะ', icon: '⚡', tags: ['เชื่อมสแตนเลส', 'ติดตั้งเหล็ก'], skills: 340, jobs: 780, status: 'active' },
  { id: 'CAT004', name: 'ก่อสร้าง', icon: '🏗️', tags: ['ปรับปรุงบ้าน', 'ฉาบผนัง', 'ทาสี'], skills: 560, jobs: 1340, status: 'warning' },
  { id: 'CAT005', name: 'ติดตั้ง/ซ่อม', icon: '🔧', tags: ['ติดตั้งกล้อง', 'ติดตั้งล็อค'], skills: 720, jobs: 1980, status: 'active' },
  { id: 'CAT006', name: 'เฟอร์นิเจอร์', icon: '🪑', tags: ['ประกอบโต๊ะ', 'ซ่อมตู้'], skills: 280, jobs: 640, status: 'inactive' },
];

const mockSearchKeywords = [
  { keyword: 'ติดตั้งแอร์', searches: 12400, results: 340, ctr: 68, trending: 'up' },
  { keyword: 'ซ่อมไฟฟ้า', searches: 8900, results: 220, ctr: 72, trending: 'up' },
  { keyword: 'เดินสายไฟบ้าน', searches: 6700, results: 180, ctr: 64, trending: 'stable' },
  { keyword: 'ติดตั้งกล้อง CCTV', searches: 5400, results: 95, ctr: 55, trending: 'up' },
  { keyword: 'ซ่อมปั๊มน้ำ', searches: 4300, results: 140, ctr: 61, trending: 'down' },
  { keyword: 'ปรับปรุงห้องครัว', searches: 3200, results: 80, ctr: 48, trending: 'up' },
];

const mockAnalytics = [
  { metric: 'DAU', value: 8420, change: +5.2, label: 'ผู้ใช้รายวัน' },
  { metric: 'WAU', value: 32100, change: +3.8, label: 'ผู้ใช้รายสัปดาห์' },
  { metric: 'MAU', value: 98400, change: +8.1, label: 'ผู้ใช้รายเดือน' },
  { metric: 'GMV (เดือน)', value: 48200000, change: +12.4, label: 'GMV รวมเดือนนี้' },
  { metric: 'Revenue (เดือน)', value: 4820000, change: +12.4, label: 'รายได้รวมเดือนนี้' },
  { metric: 'Growth', value: 12.4, change: +2.1, label: 'อัตราการเติบโต', suffix: '%' },
  { metric: 'Conversion Rate', value: 3.8, change: -0.2, label: 'อัตราการแปลง', suffix: '%' },
  { metric: 'AOV', value: 4850, change: +6.5, label: 'มูลค่าต่อออเดอร์' },
  { metric: 'CAC', value: 820, change: -3.2, label: 'ต้นทุนการได้มาลูกค้า' },
  { metric: 'LTV', value: 12400, change: +9.1, label: 'มูลค่าตลอดอายุลูกค้า' },
  { metric: 'Retention Rate', value: 78.5, change: +1.3, label: 'อัตราการรักษาลูกค้า', suffix: '%' },
];

const mockFraudAlerts = [
  { id: 'FR001', type: 'bot', severity: 'high', user: 'user_8x29a', detail: 'พฤติกรรมบอท: คลิกเร็วผิดปกติ', date: '2026-07-09', status: 'investigating' },
  { id: 'FR002', type: 'fake_account', severity: 'medium', user: 'seller_4k21z', detail: 'บัญชีซ้ำ: IP ซ้ำกับ 3 บัญชีอื่น', date: '2026-07-09', status: 'flagged' },
  { id: 'FR003', type: 'multiple_login', severity: 'medium', user: 'buyer_9m38b', detail: 'เข้าสู่ระบบจาก 5 อุปกรณ์พร้อมกัน', date: '2026-07-08', status: 'flagged' },
  { id: 'FR004', type: 'chargeback', severity: 'high', user: 'user_2p54c', detail: 'Chargeback จาก Stripe: จำนวน ฿6,200', date: '2026-07-08', status: 'banned' },
  { id: 'FR005', type: 'fake_review', severity: 'low', user: 'seller_7r82d', detail: 'รีวิวที่น่าสงสัย: เขียนรีวิวเร็วเกินไป', date: '2026-07-07', status: 'pending_review' },
  { id: 'FR006', type: 'vpn_proxy', severity: 'medium', user: 'user_1q93f', detail: 'เชื่อมต่อผ่าน VPN: ประเทศ Russia', date: '2026-07-07', status: 'flagged' },
  { id: 'FR007', type: 'spam', severity: 'low', user: 'user_5t67g', detail: 'ส่งข้อความสแปมไปยัง 42 ผู้ใช้', date: '2026-07-06', status: 'pending_review' },
];

const mockAIMonitor = [
  { metric: 'Matching Accuracy', value: 94.2, change: +0.8, unit: '%' },
  { metric: 'Chat Usage (ต่อวัน)', value: 48200, change: +15.3, unit: 'ครั้ง' },
  { metric: 'Recommendations CTR', value: 34.5, change: +2.1, unit: '%' },
  { metric: 'AI Cost (เดือน)', value: 184000, change: +8.7, unit: '฿' },
  { metric: 'Token Usage (เดือน)', value: 28400000, change: +12.4, unit: 'tokens' },
  { metric: 'Error Rate', value: 0.28, change: -0.05, unit: '%' },
];

const mockMarketing = [
  { channel: 'Google Ads', spend: 128000, revenue: 512000, roi: 300, roas: 4.0, cpa: 320, conversions: 400 },
  { channel: 'Facebook Ads', spend: 85000, revenue: 297500, roi: 250, roas: 3.5, cpa: 425, conversions: 200 },
  { channel: 'TikTok Ads', spend: 62000, revenue: 186000, roi: 200, roas: 3.0, cpa: 310, conversions: 200 },
  { channel: 'SEO / Organic', spend: 30000, revenue: 420000, roi: 1300, roas: 14.0, cpa: 0, conversions: 850 },
  { channel: 'Affiliate', spend: 45000, revenue: 270000, roi: 500, roas: 6.0, cpa: 150, conversions: 300 },
  { channel: 'Referral', spend: 15000, revenue: 105000, roi: 600, roas: 7.0, cpa: 50, conversions: 300 },
];

const mockServer = [
  { resource: 'CPU', usage: 42, status: 'healthy' },
  { resource: 'RAM', usage: 68, status: 'healthy' },
  { resource: 'Storage', usage: 55, status: 'healthy' },
  { resource: 'Database', usage: 71, status: 'warning' },
  { resource: 'Redis Cache', usage: 38, status: 'healthy' },
  { resource: 'Queue Worker', usage: 25, status: 'healthy' },
  { resource: 'API Gateway', usage: 82, status: 'warning' },
  { resource: 'CDN', usage: 31, status: 'healthy' },
  { resource: 'SSL Certificate', usage: 100, status: 'healthy', expiry: '2027-01-15' },
  { resource: 'Uptime (30 วัน)', usage: 99.97, status: 'healthy', suffix: '%' },
];

const mockLogs = [
  { id: 'LOG001', type: 'admin', action: 'อนุมัติถอนเงิน', admin: 'admin@beefix.com', target: 'มานะ ศิลป์วัฒนา', ip: '103.12.45.82', date: '2026-07-09 14:32:11', status: 'success' },
  { id: 'LOG002', type: 'payment', action: 'ชำระเงินสำเร็จ', admin: '-', target: 'ORD001', ip: '-', date: '2026-07-09 14:28:55', status: 'success' },
  { id: 'LOG003', type: 'login', action: 'เข้าสู่ระบบ', admin: 'superadmin@beefix.com', target: '-', ip: '1.46.234.18', date: '2026-07-09 13:45:02', status: 'success' },
  { id: 'LOG004', type: 'api', action: 'Webhook delivery failed', admin: '-', target: 'payment.stripe.com', ip: '-', date: '2026-07-09 12:15:33', status: 'failed' },
  { id: 'LOG005', type: 'activity', action: 'แก้ไขราคางาน', admin: 'manager@beefix.com', target: 'J005', ip: '203.150.82.41', date: '2026-07-09 11:30:18', status: 'success' },
  { id: 'LOG006', type: 'email', action: 'ส่งอีเมลยืนยัน', admin: '-', target: 'pimchanok@email.com', ip: '-', date: '2026-07-09 10:05:44', status: 'success' },
  { id: 'LOG007', type: 'security', action: 'เปลี่ยนรหัสผ่าน', admin: 'admin@beefix.com', target: '-', ip: '49.228.17.93', date: '2026-07-08 22:14:08', status: 'success' },
];

const mockAdmins = [
  { id: 'ADM001', name: 'สุรชัย ใจดี', email: 'surachai@beefix.com', role: 'super_admin', department: 'Management', lastLogin: '2026-07-09', status: 'active', sessions: 2 },
  { id: 'ADM002', name: 'ณิชารีย์ เจริญ', email: 'nitcharee@beefix.com', role: 'finance_manager', department: 'Finance', lastLogin: '2026-07-09', status: 'active', sessions: 1 },
  { id: 'ADM003', name: 'ปิยะ วงศ์ธนกิจ', email: 'piya@beefix.com', role: 'support_manager', department: 'Support', lastLogin: '2026-07-08', status: 'active', sessions: 1 },
  { id: 'ADM004', name: 'อัครา ศรีสุวรรณ', email: 'akkara@beefix.com', role: 'content_manager', department: 'Marketing', lastLogin: '2026-07-07', status: 'inactive', sessions: 0 },
  { id: 'ADM005', name: 'วิชัย เกษตรวิสุทธิ์', email: 'vichai@beefix.com', role: 'operations', department: 'Operations', lastLogin: '2026-07-09', status: 'active', sessions: 3 },
];

const mockFiles = [
  { name: 'wall-photo.jpg', type: 'image', size: '2.4 MB', owner: 'สมชาย วงศ์สกุล', uploads: 24, storage: '8.2 GB', status: 'active' },
  { name: 'blueprint.pdf', type: 'document', size: '5.1 MB', owner: 'อลินา บุญธรรม', uploads: 8, storage: '1.5 GB', status: 'active' },
  { name: 'demo-video.mp4', type: 'video', size: '184 MB', owner: 'ชัยวัฒน์ ใจดี', uploads: 3, storage: '220 GB', status: 'active' },
  { name: 'invoice_001.pdf', type: 'document', size: '0.3 MB', owner: 'พิมพ์ชนก สุขใจ', uploads: 45, storage: '0.8 GB', status: 'active' },
  { name: 'avatar_default.png', type: 'image', size: '0.1 MB', owner: 'System', uploads: 18420, storage: '0.5 GB', status: 'active' },
];

const mockAPIKeys = [
  { name: 'Beefix iOS App', key: 'bfx_live_************k92m', permissions: ['read', 'write'], rateLimit: '1000/นาที', lastUsed: '2026-07-09', status: 'active', calls: 4821000 },
  { name: 'Beefix Android App', key: 'bfx_live_************a71p', permissions: ['read', 'write'], rateLimit: '1000/นาที', lastUsed: '2026-07-09', status: 'active', calls: 5210000 },
  { name: 'Stripe Webhook', key: 'bfx_live_************w38x', permissions: ['read'], rateLimit: '500/นาที', lastUsed: '2026-07-09', status: 'active', calls: 892000 },
  { name: 'Google Maps API', key: 'AIzaSy************B7k', permissions: ['read'], rateLimit: '100/นาที', lastUsed: '2026-07-09', status: 'active', calls: 1240000 },
  { name: 'Internal Analytics', key: 'bfx_int_************92nz', permissions: ['read'], rateLimit: '5000/นาที', lastUsed: '2026-07-09', status: 'active', calls: 8920000 },
  { name: 'Test Environment', key: 'bfx_test_************4h28', permissions: ['read', 'write'], rateLimit: '100/นาที', lastUsed: '2026-06-30', status: 'inactive', calls: 42000 },
];

const mockFinancialReports = [
  { period: '2026-07-09', gmv: 4820000, revenue: 482000, commission: 96400, vat: 33600, cost: 146000, profit: 239600 },
  { period: '2026-07-08', gmv: 5340000, revenue: 534000, commission: 106800, vat: 37400, cost: 162000, profit: 265200 },
  { period: '2026-07-07', gmv: 4280000, revenue: 428000, commission: 85600, vat: 29960, cost: 130000, profit: 212440 },
  { period: '2026-07-06', gmv: 6120000, revenue: 612000, commission: 122400, vat: 42840, cost: 186000, profit: 302760 },
  { period: '2026-07-05', gmv: 3890000, revenue: 389000, commission: 77800, vat: 27230, cost: 118000, profit: 192970 },
];

const mockAutomations = [
  { name: 'Auto Release Escrow', trigger: 'Buyer confirms completion', schedule: 'Instant', lastRun: '2026-07-09 14:45:02', status: 'active', successRate: 98.2 },
  { name: 'Auto Refund (Cancelled)', trigger: 'Job cancelled > 24h', schedule: 'Every 6h', lastRun: '2026-07-09 12:00:00', status: 'active', successRate: 100 },
  { name: 'Auto Ban (Fraud)', trigger: 'Fraud score > 0.9', schedule: 'Instant', lastRun: '2026-07-09 08:15:33', status: 'active', successRate: 95.0 },
  { name: 'Auto Email Notification', trigger: 'Job status change', schedule: 'Instant', lastRun: '2026-07-09 14:50:18', status: 'active', successRate: 99.8 },
  { name: 'Auto Reminder (Review)', trigger: 'Job completed > 48h', schedule: 'Daily 09:00', lastRun: '2026-07-09 09:00:01', status: 'active', successRate: 87.4 },
  { name: 'Auto Backup (Database)', trigger: 'Schedule', schedule: 'Daily 02:00', lastRun: '2026-07-09 02:00:15', status: 'active', successRate: 100 },
  { name: 'Auto Suspend (Incomplete)', trigger: 'Job pending > 7 days', schedule: 'Daily 06:00', lastRun: '2026-07-09 06:00:00', status: 'active', successRate: 91.2 },
];

const mockWidgets = [
  { id: 'w1', label: "Today's Revenue", value: TH.currency(482000), change: '+12.4%', trend: 'up', enabled: true },
  { id: 'w2', label: 'Online Users', value: '842', change: '+5.2%', trend: 'up', enabled: true },
  { id: 'w3', label: 'New Jobs Today', value: '847', change: '+8.1%', trend: 'up', enabled: true },
  { id: 'w4', label: 'Problem Jobs', value: '23', change: '-2.4%', trend: 'down', enabled: true },
  { id: 'w5', label: 'Withdrawal Requests', value: '8', change: '+3', trend: 'up', enabled: true },
  { id: 'w6', label: 'System Alerts', value: '3', change: '⚠️', trend: 'neutral', enabled: true },
  { id: 'w7', label: 'Recent Errors', value: '7', change: '-15%', trend: 'down', enabled: false },
  { id: 'w8', label: 'Server Load', value: '42%', change: '+3%', trend: 'up', enabled: false },
  { id: 'w9', label: 'AI Usage', value: '48,200', change: '+15.3%', trend: 'up', enabled: true },
  { id: 'w10', label: 'Conversion Rate', value: '3.8%', change: '-0.2%', trend: 'down', enabled: true },
  { id: 'w11', label: 'Top Seller', value: 'มานะ ศิลป์วัฒนา', change: '฿38,400', trend: 'up', enabled: true },
  { id: 'w12', label: 'Top Buyer', value: 'อลินา บุญธรรม', change: '฿6,720', trend: 'up', enabled: true },
  { id: 'w13', label: 'Trending Category', value: 'ไฟฟ้า', change: '+18.2%', trend: 'up', enabled: true },
];

// ─── Navigation ───────────────────────────────────────────────────────────────

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: '📊 ภาพรวมธุรกิจ',
    items: [
      { id: 'executive', label: 'Executive Dashboard', icon: '📊', group: '📊 ภาพรวมธุรกิจ' },
      { id: 'analytics', label: 'Analytics', icon: '📈', group: '📊 ภาพรวมธุรกิจ' },
      { id: 'widgets', label: 'Dashboard Widgets', icon: '🧩', group: '📊 ภาพรวมธุรกิจ' },
      { id: 'financial', label: 'Financial Report', icon: '💰', group: '📊 ภาพรวมธุรกิจ' },
    ],
  },
  {
    group: '👥 ผู้ใช้งาน',
    items: [
      { id: 'buyers', label: 'Buyers', icon: '🛒', group: '👥 ผู้ใช้งาน' },
      { id: 'sellers', label: 'Sellers', icon: '🛠️', group: '👥 ผู้ใช้งาน' },
    ],
  },
  {
    group: '📦 งาน & ออเดอร์',
    items: [
      { id: 'jobs', label: 'Jobs', icon: '📋', group: '📦 งาน & ออเดอร์' },
      { id: 'orders', label: 'Orders', icon: '🧾', group: '📦 งาน & ออเดอร์' },
      { id: 'escrow', label: 'Escrow', icon: '🔒', group: '📦 งาน & ออเดอร์' },
      { id: 'withdrawal', label: 'Withdrawal', icon: '🏧', group: '📦 งาน & ออเดอร์' },
      { id: 'payments', label: 'Payments', icon: '💳', group: '📦 งาน & ออเดอร์' },
    ],
  },
  {
    group: '🎁 โปรโมชัน & การตลาด',
    items: [
      { id: 'promotions', label: 'Promotions', icon: '🎟️', group: '🎁 โปรโมชัน & การตลาด' },
      { id: 'notifications', label: 'Notifications', icon: '📢', group: '🎁 โปรโมชัน & การตลาด' },
      { id: 'marketing', label: 'Marketing', icon: '📣', group: '🎁 โปรโมชัน & การตลาด' },
    ],
  },
  {
    group: '🎧 สนับสนุน',
    items: [
      { id: 'support', label: 'Support Center', icon: '🎧', group: '🎧 สนับสนุน' },
      { id: 'reviews', label: 'Reviews', icon: '⭐', group: '🎧 สนับสนุน' },
    ],
  },
  {
    group: '📂 เนื้อหา',
    items: [
      { id: 'cms', label: 'CMS', icon: '📄', group: '📂 เนื้อหา' },
      { id: 'categories', label: 'Categories', icon: '🏷️', group: '📂 เนื้อหา' },
      { id: 'search', label: 'Search', icon: '🔍', group: '📂 เนื้อหา' },
    ],
  },
  {
    group: '🛡️ ระบบ & ความปลอดภัย',
    items: [
      { id: 'fraud', label: 'Fraud Detection', icon: '🚨', group: '🛡️ ระบบ & ความปลอดภัย' },
      { id: 'ai', label: 'AI Monitor', icon: '🤖', group: '🛡️ ระบบ & ความปลอดภัย' },
      { id: 'security', label: 'Security', icon: '🔐', group: '🛡️ ระบบ & ความปลอดภัย' },
      { id: 'server', label: 'Server Monitor', icon: '🖥️', group: '🛡️ ระบบ & ความปลอดภัย' },
      { id: 'logs', label: 'Logs', icon: '📜', group: '🛡️ ระบบ & ความปลอดภัย' },
    ],
  },
  {
    group: '⚙️ จัดการระบบ',
    items: [
      { id: 'admin', label: 'Admin Management', icon: '👔', group: '⚙️ จัดการระบบ' },
      { id: 'files', label: 'File Management', icon: '📁', group: '⚙️ จัดการระบบ' },
      { id: 'api', label: 'API Management', icon: '🔌', group: '⚙️ จัดการระบบ' },
      { id: 'automation', label: 'Automation', icon: '⚡', group: '⚙️ จัดการระบบ' },
      { id: 'settings', label: 'Settings', icon: '⚙️', group: '⚙️ จัดการระบบ' },
    ],
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function KPICard({ label, value, change, sparkline, icon }: {
  label: string; value: string | number; change?: number | string;
  sparkline?: number[]; icon?: string;
}) {
  const isPositive = typeof change === 'number' ? change >= 0 : true;
  const changeBg = typeof change === 'number'
    ? (change >= 0 ? 'bg-[#00c853]/20 text-[#00c853]' : 'bg-[#ff5252]/20 text-[#ff5252]')
    : 'bg-[#2a2f4a] text-[#8a8fa3]';
  const changeArrow = typeof change === 'number'
    ? (change >= 0 ? '↑' : '↓')
    : '';
  const sparkColor = isPositive ? '#00c853' : '#ff5252';
  const iconBg = isPositive ? 'bg-[#00c853]/20' : 'bg-[#ff5252]/20';

  return (
    <div className="bg-[#252a40] rounded-xl p-5 border border-[#2a2f4a] hover:border-[#3a3f5a] transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="text-[11px] text-[#8a8fa3] font-medium uppercase tracking-wide">{label}</div>
        {icon && (
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-lg`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white leading-tight">
        {typeof value === 'number' ? value.toLocaleString('th-TH') : value}
      </div>
      <div className="flex items-center justify-between">
        {change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${changeBg}`}>
            {changeArrow} {typeof change === 'number' ? `${change >= 0 ? '+' : ''}${change}%` : change}
          </span>
        )}
        {sparkline && (
          <MiniSparkline data={sparkline} color={sparkColor} height={28} />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-[#00c853]/20 text-[#00c853]' },
    completed: { label: 'Completed', className: 'bg-[#00c853]/20 text-[#00c853]' },
    success: { label: 'Success', className: 'bg-[#00c853]/20 text-[#00c853]' },
    approved: { label: 'Approved', className: 'bg-[#00c853]/20 text-[#00c853]' },
    published: { label: 'Published', className: 'bg-[#00c853]/20 text-[#00c853]' },
    visible: { label: 'Visible', className: 'bg-[#00c853]/20 text-[#00c853]' },
    healthy: { label: 'Healthy', className: 'bg-[#00c853]/20 text-[#00c853]' },
    confirmed: { label: 'Confirmed', className: 'bg-[#00c853]/20 text-[#00c853]' },
    delivered: { label: 'Delivered', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    held: { label: 'Held', className: 'bg-[#2196f3]/20 text-[#2196f3]' },
    in_progress: { label: 'In Progress', className: 'bg-[#e91e63]/20 text-[#e91e63]' },
    processing: { label: 'Processing', className: 'bg-[#e91e63]/20 text-[#e91e63]' },
    disputed: { label: 'Disputed', className: 'bg-[#e91e63]/20 text-[#e91e63]' },
    refunded: { label: 'Refunded', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    pending: { label: 'Pending', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    warning: { label: 'Warning', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    paused: { label: 'Paused', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    draft: { label: 'Draft', className: 'bg-[#5a6078]/30 text-[#8a8fa3]' },
    inactive: { label: 'Inactive', className: 'bg-[#5a6078]/30 text-[#8a8fa3]' },
    suspended: { label: 'Suspended', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    cancelled: { label: 'Cancelled', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    rejected: { label: 'Rejected', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    failed: { label: 'Failed', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    error: { label: 'Error', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    chargeback: { label: 'Chargeback', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    problem: { label: 'Problem', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    pending_release: { label: 'Pending Release', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    released: { label: 'Released', className: 'bg-[#00c853]/20 text-[#00c853]' },
    open: { label: 'Open', className: 'bg-[#2196f3]/20 text-[#2196f3]' },
    reported: { label: 'Reported', className: 'bg-[#e91e63]/20 text-[#e91e63]' },
    hidden: { label: 'Hidden', className: 'bg-[#5a6078]/30 text-[#8a8fa3]' },
    banned: { label: 'Banned', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    flagged: { label: 'Flagged', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    investigating: { label: 'Investigating', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    pending_review: { label: 'Pending Review', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    high: { label: 'High', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    medium: { label: 'Medium', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    low: { label: 'Low', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    expired: { label: 'Expired', className: 'bg-[#5a6078]/30 text-[#8a8fa3]' },
    super_admin: { label: 'Super Admin', className: 'bg-[#e91e63]/20 text-[#e91e63]' },
    finance_manager: { label: 'Finance', className: 'bg-[#2196f3]/20 text-[#2196f3]' },
    support_manager: { label: 'Support', className: 'bg-[#00c853]/20 text-[#00c853]' },
    content_manager: { label: 'Content', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    operations: { label: 'Operations', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    image: { label: 'Image', className: 'bg-[#2196f3]/20 text-[#2196f3]' },
    video: { label: 'Video', className: 'bg-[#e91e63]/20 text-[#e91e63]' },
    document: { label: 'Document', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    bank_transfer: { label: 'Bank Transfer', className: 'bg-[#2196f3]/20 text-[#2196f3]' },
    credit_card: { label: 'Credit Card', className: 'bg-[#2196f3]/20 text-[#2196f3]' },
    wallet: { label: 'Wallet', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    qr_promptpay: { label: 'QR PromptPay', className: 'bg-[#00c853]/20 text-[#00c853]' },
    promptpay: { label: 'PromptPay', className: 'bg-[#00c853]/20 text-[#00c853]' },
    used: { label: 'Used', className: 'bg-[#5a6078]/30 text-[#8a8fa3]' },
    closed: { label: 'Closed', className: 'bg-[#5a6078]/30 text-[#8a8fa3]' },
    verified: { label: 'Verified', className: 'bg-[#00c853]/20 text-[#00c853]' },
    kyc: { label: 'KYC', className: 'bg-[#00c853]/20 text-[#00c853]' },
    kyc_approved: { label: 'KYC Approved', className: 'bg-[#00c853]/20 text-[#00c853]' },
    kyc_pending: { label: 'KYC Pending', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    kyc_rejected: { label: 'KYC Rejected', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
    'kyc-pending': { label: 'KYC Pending', className: 'bg-[#ffc107]/20 text-[#ffc107]' },
    'kyc-approved': { label: 'KYC Approved', className: 'bg-[#00c853]/20 text-[#00c853]' },
    'kyc-rejected': { label: 'KYC Rejected', className: 'bg-[#ff5252]/20 text-[#ff5252]' },
  };
  const cfg = map[status] || { label: status, className: 'bg-[#2a2f4a] text-[#8a8fa3]' };
  return <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

function SectionHeader({ title, icon, actions }: { title: string; icon?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {actions}
    </div>
  );
}

function ActionBtn({ label, variant = 'secondary', size = 'md', onClick }: {
  label: string; variant?: 'primary' | 'secondary' | 'danger'; size?: 'sm' | 'md'; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-colors text-xs
        ${size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2'}
        ${variant === 'primary' ? 'bg-[#e91e63] text-white hover:bg-[#c1175a]' :
          variant === 'danger' ? 'bg-[#ff5252] text-white hover:bg-[#e54545]' :
          'bg-[#252a40] text-white border border-[#2a2f4a] hover:bg-[#2a2f4a]'
        }`}
    >
      {label}
    </button>
  );
}

function TabPills({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 mb-5 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            active === tab
              ? 'bg-[#e91e63] text-white'
              : 'bg-[#252a40] text-[#8a8fa3] border border-[#2a2f4a] hover:bg-[#2a2f4a] hover:text-white'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2f4a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1e2235]">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-t border-[#2a2f4a] ${ri % 2 === 0 ? 'bg-[#1e2235]' : 'bg-[#252a40]'}`}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-sm text-white">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniBar({ value, max = 100, color = '#FFB800' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-[#1e2235] rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function MiniSparkline({ data, color = '#FFB800', height = 28 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DateRangePicker() {
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252a40] border border-[#2a2f4a] rounded-lg text-xs text-[#8a8fa3] hover:bg-[#2a2f4a] hover:text-white transition-colors">
      📅 1 – 31 ก.ค. 2569
    </button>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function Section_01_ExecutiveDashboard() {
  const [tab, setTab] = useState('Today');
  const tabs = ['Today', '7 Days', '30 Days', '90 Days', 'Year'];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionHeader title="Executive Dashboard KPIs" icon="📊" />
        <div className="flex items-center gap-3">
          <DateRangePicker />
          <ActionBtn label="📤 Export" variant="secondary" />
        </div>
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        <KPICard label="GMV" value={TH.currency(mockKPI.gmv)} change={12.4} />
        <KPICard label="Revenue" value={TH.currency(mockKPI.revenue)} change={12.4} />
        <KPICard label="Commission" value={TH.currency(mockKPI.commission)} change={11.8} />
        <KPICard label="Gross Profit" value={TH.currency(mockKPI.grossProfit)} change={15.2} />
        <KPICard label="Active Users" value={TH.number(mockKPI.activeUsers)} change={8.1} />
        <KPICard label="New Users (Today)" value={TH.number(mockKPI.newUsersToday)} change={12.3} />
        <KPICard label="New Buyers" value={TH.number(mockKPI.newBuyers)} change={9.5} />
        <KPICard label="New Sellers" value={TH.number(mockKPI.newSellers)} change={15.7} />
        <KPICard label="Today's Jobs" value={TH.number(mockKPI.todaysJobs)} change={8.1} />
        <KPICard label="In Progress" value={TH.number(mockKPI.inProgress)} change={-2.4} />
        <KPICard label="Completed" value={TH.number(mockKPI.completed)} change={18.2} />
        <KPICard label="Cancelled" value={TH.number(mockKPI.cancelled)} change={3.1} />
        <KPICard label="Tickets" value={TH.number(mockKPI.tickets)} change={-12.5} />
        <KPICard label="Disputes" value={TH.number(mockKPI.disputes)} change={8.3} />
        <KPICard label="Escrow Held" value={TH.currency(mockKPI.escrowHeld)} change={5.4} />
        <KPICard label="Pending Withdrawal" value={TH.currency(mockKPI.pendingWithdrawal)} change={22.1} />
        <KPICard label="Conversion Rate" value={`${mockKPI.conversionRate}%`} change={-0.2} />
        <KPICard label="AOV" value={TH.currency(mockKPI.aov)} change={6.5} />
        <KPICard label="LTV" value={TH.currency(mockKPI.ltv)} change={9.1} />
        <KPICard label="CAC" value={TH.currency(mockKPI.cac)} change={-3.2} />
        <KPICard label="Retention Rate" value={`${mockKPI.retentionRate}%`} change={1.3} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">💰 Revenue Overview (7 วันล่าสุด)</h3>
          <div className="flex items-end gap-2 h-32">
            {[42, 55, 48, 63, 58, 71, 68].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${v * 0.45}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }} />
                <span className="text-xs text-[#8a8fa3]">วัน {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">📈 GMV Trend (7 วันล่าสุด)</h3>
          <div className="flex items-end gap-2 h-32">
            {[38, 52, 45, 60, 55, 70, 65].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${v * 0.45}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }} />
                <span className="text-xs text-[#8a8fa3]">วัน {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_02_Buyers() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Active', 'Suspended', 'Pending KYC'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Buyers Management" icon="🛒" actions={<><ActionBtn label="+ เพิ่ม Buyer" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ชื่อ', 'อีเมล', 'ใช้จ่าย (฿)', 'ออเดอร์', 'Trust Score', 'KYC', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockBuyers.map((b, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{b.id}</td>
                <td className="px-3 py-2 font-semibold text-xs">{b.name}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{b.email}</td>
                <td className="px-3 py-2 font-semibold text-xs text-white">{TH.currency(b.spend)}</td>
                <td className="px-3 py-2 text-xs">{b.orders}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><MiniBar value={b.trustScore} color={b.trustScore >= 90 ? '#00c853' : b.trustScore >= 70 ? '#ffc107' : '#ff5252'} /><span className="text-xs font-semibold">{b.trustScore}</span></div></td>
                <td className="px-3 py-2"><StatusBadge status={b.kyc} /></td>
                <td className="px-3 py-2"><StatusBadge status={b.status} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">🔑</button>
                    {b.status === 'active' ? <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⛔</button> : <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">✓</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_03_Sellers() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Active', 'Warning', 'Suspended'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Sellers Management" icon="🛠️" actions={<><ActionBtn label="+ เพิ่ม Seller" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ชื่อ', 'สกิล', 'รายได้ (฿)', 'ถอนแล้ว (฿)', 'Rating', 'Response', 'Completion', 'On-Time', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSellers.map((s, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{s.id}</td>
                <td className="px-3 py-2 font-semibold">{s.name}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{s.skill}</td>
                <td className="px-3 py-2 font-semibold text-white">{TH.currency(s.income)}</td>
                <td className="px-3 py-2 text-[#8a8fa3]">{TH.currency(s.withdrawn)}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-1"><span className="text-[#ffc107]">⭐</span><span className="font-bold">{s.rating}</span></div></td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><MiniBar value={s.responseRate} color={s.responseRate >= 95 ? '#00c853' : '#ffc107'} /><span className="text-xs font-semibold">{s.responseRate}%</span></div></td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><MiniBar value={s.completionRate} color={s.completionRate >= 90 ? '#00c853' : '#ffc107'} /><span className="text-xs font-semibold">{s.completionRate}%</span></div></td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><MiniBar value={s.onTime} color={s.onTime >= 90 ? '#00c853' : '#ffc107'} /><span className="text-xs font-semibold">{s.onTime}%</span></div></td>
                <td className="px-3 py-2"><StatusBadge status={s.status} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">💰</button>
                    {s.status !== 'suspended' ? <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⛔</button> : <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">✓</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_04_Jobs() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Pending', 'Published', 'In Progress', 'Delivered', 'Completed', 'Cancelled', 'Disputed', 'Refunded'];
  const statusMap: Record<string, string> = {
    'All': 'ทั้งหมด', 'Pending': 'รอดำเนินการ', 'Published': 'เผยแพร่', 'In Progress': 'กำลังดำเนินการ',
    'Delivered': 'ส่งมอบแล้ว', 'Completed': 'เสร็จสิ้น', 'Cancelled': 'ยกเลิก', 'Disputed': 'ข้อพิพาท', 'Refunded': 'คืนเงิน'
  };
  return (
    <div className="space-y-3">
      <SectionHeader title="Job Management" icon="📋" actions={<><ActionBtn label="+ สร้างงาน" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="flex items-center gap-3 flex-wrap">
        <TabPills tabs={tabs} active={tab} onChange={setTab} />
        <input type="text" placeholder="🔍 ค้นหางาน..." className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63] flex-1 min-w-[200px]" />
      </div>
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ชื่องาน', 'ผู้ว่าจ้าง', 'ช่าง', 'ราคา (฿)', 'สถานะ', 'Timeline', 'สร้างเมื่อ', 'แชท', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockJobs.map((j, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{j.id}</td>
                <td className="px-3 py-2 font-semibold text-xs max-w-[180px] truncate">{j.title}</td>
                <td className="px-3 py-2 text-xs">{j.owner}</td>
                <td className="px-3 py-2 text-xs">{j.freelancer}</td>
                <td className="px-3 py-2 font-semibold text-white">{TH.currency(j.price)}</td>
                <td className="px-3 py-2"><StatusBadge status={j.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{j.timeline}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{j.created}</td>
                <td className="px-3 py-2">{j.chat ? <span className="text-[#00c853] font-bold">💬</span> : <span className="text-[#5a6078]">-</span>}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_05_Orders() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Completed', 'Pending', 'Refunded', 'Disputed'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Order Management" icon="🧾" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="+ สร้างออเดอร์" variant="primary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ลูกค้า', 'บริการ', 'มูลค่า (฿)', 'ภาษี (฿)', 'ค่าคอม (฿)', 'ใบเสร็จ', 'Escrow', 'สถานะ', 'วันที่'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                <td className="px-3 py-2 font-semibold text-xs">{o.customer}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3] max-w-[160px] truncate">{o.service}</td>
                <td className="px-3 py-2 font-bold text-xs text-white">{TH.currency(o.amount)}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{TH.currency(o.tax)}</td>
                <td className="px-3 py-2 text-[#ffc107] font-semibold">{TH.currency(o.commission)}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.receipt}</td>
                <td className="px-3 py-2"><StatusBadge status={o.escrow} /></td>
                <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_06_Escrow() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Held', 'Released', 'Pending Release', 'Problem'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Escrow Management" icon="🔒" actions={<><ActionBtn label="📤 Export Log" variant="secondary" size="sm" /><ActionBtn label="+ ปล่อย Escrow" variant="primary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Escrow Held" value={TH.currency(5840000)} change={5.4} />
        <KPICard label="Released (วันนี้)" value={TH.currency(8500)} change={-12.0} />
        <KPICard label="Pending Release" value={TH.currency(6200)} change={8.2} />
        <KPICard label="Problem Funds" value={TH.currency(35000)} change={22.1} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'Order', 'มูลค่า (฿)', 'สถานะ', 'วันที่ถือ', 'วันปล่อย', 'เหตุผล', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockEscrow.map((e, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{e.id}</td>
                <td className="px-3 py-2 font-mono text-xs">{e.order}</td>
                <td className="px-3 py-2 font-bold text-xs text-white">{TH.currency(e.amount)}</td>
                <td className="px-3 py-2"><StatusBadge status={e.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{e.heldAt}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{e.releasedAt}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{e.reason}</td>
                <td className="px-3 py-2">
                  {e.status === 'held' && <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">ปล่อย</button>}
                  {e.status === 'problem' && <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">แก้ไข</button>}
                  {e.status === 'pending_release' && <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">รอ...</button>}
                  {e.status === 'released' && <span className="text-xs text-[#8a8fa3]">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_07_Withdrawal() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Withdrawal Management" icon="🏧" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="⚙️ ตั้งค่าค่าธรรมเนียม" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="รอดำเนินการ" value={TH.currency(80000)} change={8} />
        <KPICard label="อนุมัติแล้ว (วันนี้)" value={TH.currency(50000 + 15000 + 25000)} change={12} />
        <KPICard label="ปฏิเสธ (วันนี้)" value={TH.currency(5000)} change={0} />
        <KPICard label="ค่าธรรมเนียมรวม" value={TH.currency(65)} change={3} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ผู้ขาย', 'ธนาคาร', 'เลขบัญชี', 'จำนวน (฿)', 'ค่าธรรมเนียม (฿)', 'วิธี', 'สถานะ', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockWithdrawals.map((w, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{w.id}</td>
                <td className="px-3 py-2 font-semibold text-xs">{w.seller}</td>
                <td className="px-3 py-2 text-xs">{w.bank}</td>
                <td className="px-3 py-2 font-mono text-xs">{w.account}</td>
                <td className="px-3 py-2 font-bold text-white">{TH.currency(w.amount)}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{TH.currency(w.fee)}</td>
                <td className="px-3 py-2 text-xs"><StatusBadge status={w.method} /></td>
                <td className="px-3 py-2"><StatusBadge status={w.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{w.date}</td>
                <td className="px-3 py-2">
                  {w.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">✓</button>
                      <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">✗</button>
                    </div>
                  )}
                  {w.status !== 'pending' && <span className="text-xs text-[#8a8fa3]">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_08_Payments() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Credit Card', 'QR PromptPay', 'Bank Transfer', 'Wallet', 'Failed', 'Chargeback'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Payment Management" icon="💳" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="+ ทดสอบ Payment" variant="primary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Success (วันนี้)" value={TH.currency(8500 + 12000 + 2500 + 15000)} change={8.2} />
        <KPICard label="Failed (วันนี้)" value={TH.currency(6200)} change={1} />
        <KPICard label="Chargeback" value={TH.currency(4800)} change={0} />
        <KPICard label="Pending" value={TH.currency(35000)} change={12} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ประเภท', 'มูลค่า (฿)', 'สถานะ', 'Gateway', 'Card/Account', 'วันที่', 'รายละเอียด'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((p, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                <td className="px-3 py-2 text-xs font-semibold">{p.type.replace('_', ' ')}</td>
                <td className="px-3 py-2 font-bold text-xs text-white">{TH.currency(p.amount)}</td>
                <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                <td className="px-3 py-2 text-xs">{p.gateway}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.card}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{p.date}</td>
                <td className="px-3 py-2 text-xs text-[#ff5252]">{p.error || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_09_Promotions() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Coupon', 'Flash Sale', 'Campaign', 'Referral', 'Cashback', 'Voucher', 'Expired'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Promotion Management" icon="🎟️" actions={<><ActionBtn label="+ สร้างโปรโมชัน" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Promotions" value="4" change={0} />
        <KPICard label="Total Usage (วันนี้)" value="7,650" change={22.4} />
        <KPICard label="Budget Spent (เดือน)" value={TH.currency(32000)} change={64} />
        <KPICard label="Expired" value="1" change={0} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ประเภท', 'ชื่อ/Code', 'ส่วนลด', 'ใช้ไป/จำกัด', 'Status', 'หมดอายุ', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPromotions.map((p, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                <td className="px-3 py-2"><StatusBadge status={p.type} /></td>
                <td className="px-3 py-2 font-semibold text-xs">{p.code || p.name}</td>
                <td className="px-3 py-2 font-bold text-[#ffc107]">{p.discount || p.bonus || p.cashback}</td>
                <td className="px-3 py-2 text-xs">{p.usage}{p.limit ? `/${p.limit}` : ''}</td>
                <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{p.exp}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⛔</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_10_Notifications() {
  const [tab, setTab] = useState('Send Notification');
  const tabs = ['Send Notification', 'History', 'Templates', 'Settings'];
  const channelIcons: Record<string, string> = { 'Email': '📧', 'SMS': '📱', 'Push': '🔔', 'In-App': '💬', 'Broadcast Seller': '📢', 'Broadcast Buyer': '📢' };
  const channels = ['Email', 'SMS', 'Push', 'In-App', 'Broadcast Seller', 'Broadcast Buyer'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Notification Center" icon="📢" />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">📤 ส่งการแจ้งเตือน</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">ช่องทาง</label>
              <div className="flex gap-2 flex-wrap">
                {channels.map(ch => (
                  <label key={ch} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="checkbox" className="accent-[#e91e63]" defaultChecked={ch === 'Email'} />
                    <span>{channelIcons[ch]} {ch}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">กลุ่มเป้าหมาย</label>
              <select className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]">
                <option>ทุกผู้ใช้</option>
                <option>เฉพาะ Seller</option>
                <option>เฉพาะ Buyer</option>
                <option>ผู้ใช้ที่เลือก</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">หัวข้อ</label>
              <input type="text" className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" placeholder="แจ้งเตือน: ระบบบำรุงรักษา" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">เนื้อหา</label>
              <textarea className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" rows={4} placeholder="พิมพ์ข้อความที่นี่..." />
            </div>
            <button className="bg-[#e91e63] text-white hover:bg-[#c1175a] px-6 py-2 rounded-lg font-semibold transition-colors w-auto">📤 ส่งการแจ้งเตือน</button>
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">📋 ประวัติการส่งล่าสุด</h3>
          <div className="space-y-3">
            {[
              { ch: '📧', title: 'แจ้งเตือนเตือนรีวิว', target: '342 คน', status: 'sent', time: '2 ชม. ที่แล้ว' },
              { ch: '📱', title: 'SMS ยืนยันการชำระ', target: '28 คน', status: 'sent', time: '4 ชม. ที่แล้ว' },
              { ch: '🔔', title: 'Push: งานใหม่', target: '1,240 คน', status: 'sent', time: '6 ชม. ที่แล้ว' },
              { ch: '📢', title: 'Broadcast: แคมเปญวันเสาร์', target: '8,420 คน', status: 'sent', time: '1 วันที่แล้ว' },
              { ch: '📧', title: 'Email: สรุปรายเดือน', target: '2,180 คน', status: 'failed', time: '1 วันที่แล้ว' },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{n.ch}</span>
                  <div>
                    <div className="font-semibold text-sm text-white">{n.title}</div>
                    <div className="text-xs text-[#8a8fa3]">{n.target}</div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={n.status} />
                  <div className="text-xs text-[#8a8fa3] mt-1">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_11_Support() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Open', 'Pending', 'Closed', 'Dispute', 'Refund', 'Complaint'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Support Center" icon="🎧" actions={<><ActionBtn label="+ สร้าง Ticket" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Open" value="2" change={0} />
        <KPICard label="Pending" value="2" change={1} />
        <KPICard label="Closed (วันนี้)" value="1" change={-3} />
        <KPICard label="SLA Breach" value="0" change={0} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'หัวข้อ', 'ผู้ใช้', 'ประเภท', 'Priority', 'มอบหมาย', 'สถานะ', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((t, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{t.id}</td>
                <td className="px-3 py-2 font-semibold text-xs">{t.subject}</td>
                <td className="px-3 py-2 text-xs">{t.user}</td>
                <td className="px-3 py-2"><StatusBadge status={t.type} /></td>
                <td className="px-3 py-2"><StatusBadge status={t.priority} /></td>
                <td className="px-3 py-2 text-xs">{t.assigned}</td>
                <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{t.date}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">✓</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_12_Reviews() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Visible', 'Hidden', 'Reported', 'Suspicious'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Review Management" icon="⭐" actions={<><ActionBtn label="🤖 AI Detection" variant="secondary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Reviews" value="38,420" change={12.4} />
        <KPICard label="Suspicious (AI)" value="3" change={0} />
        <KPICard label="Hidden" value="2" change={0} />
        <KPICard label="Avg Rating" value="4.7" change={0.1} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'จาก', 'ถึง', 'งาน', 'Rating', 'Comment', 'AI Score', 'Status', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockReviews.map((r, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="px-3 py-2 text-xs">{r.from}</td>
                <td className="px-3 py-2 text-xs">{r.to}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{r.job}</td>
                <td className="px-3 py-2"><div className="flex text-[#ffc107] text-xs">{Array.from({ length: r.rating }).map((_, j) => '⭐').join('')}</div></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3] max-w-[200px] truncate">{r.comment}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><MiniBar value={r.fakeScore * 100} max={100} color={r.fakeScore > 0.7 ? '#ff5252' : r.fakeScore > 0.3 ? '#ffc107' : '#00c853'} /><span className="text-xs font-semibold">{r.fakeScore}</span></div></td>
                <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{r.date}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {r.status === 'visible' && <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">🙈</button>}
                    {r.status === 'reported' && <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">🔍</button>}
                    <button className="px-2 py-1 text-xs bg-[#2a2f4a] text-[#8a8fa3] rounded hover:bg-[#2a2f4a] font-semibold">✓</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_13_CMS() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Banner', 'Blog', 'FAQ', 'Terms', 'Privacy', 'Help Center'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Content Management (CMS)" icon="📄" actions={<><ActionBtn label="+ สร้างเนื้อหา" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ประเภท', 'ชื่อเรื่อง', 'เนื้อหา', 'Status', 'อัปเดต', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCMS.map((c, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                <td className="px-3 py-2"><StatusBadge status={c.type} /></td>
                <td className="px-3 py-2 font-semibold text-xs">{c.title}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3] max-w-[200px] truncate">{c.content}</td>
                <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{c.updated}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_14_Categories() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Active', 'Warning', 'Inactive'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Category Management" icon="🏷️" actions={<><ActionBtn label="+ สร้าง Category" variant="primary" size="sm" /><ActionBtn label="+ สร้าง Tag" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ไอคอน', 'ชื่อ Category', 'Tags', 'Skills', 'Jobs', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCategories.map((c, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                <td className="px-3 py-2 text-xl">{c.icon}</td>
                <td className="px-3 py-2 font-bold text-xs text-white">{c.name}</td>
                <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{c.tags.slice(0, 2).map(t => <span key={t} className="text-xs bg-[#ffc107]/20 text-[#ffc107] px-2 py-0.5 rounded-full">{t}</span>)}</div></td>
                <td className="px-3 py-2 font-semibold text-xs">{TH.number(c.skills)}</td>
                <td className="px-3 py-2 font-semibold text-xs">{TH.number(c.jobs)}</td>
                <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-[#2a2f4a] text-[#8a8fa3] rounded hover:bg-[#2a2f4a] font-semibold">📋</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_15_Search() {
  const [tab, setTab] = useState('Keywords');
  const tabs = ['Keywords', 'Ranking', 'Trending', 'Popular Services'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Search Management" icon="🔍" actions={<><ActionBtn label="+ เพิ่ม Keyword" variant="primary" size="sm" /><ActionBtn label="🔄 Sync Search Index" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['Keyword', 'การค้นหา/วัน', 'ผลลัพธ์', 'CTR', 'แนวโน้ม', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSearchKeywords.map((k, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-semibold text-xs text-white">{k.keyword}</td>
                <td className="px-3 py-2 font-semibold text-xs">{TH.number(k.searches)}</td>
                <td className="px-3 py-2 text-xs">{k.results}</td>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><MiniBar value={k.ctr} color={k.ctr >= 60 ? '#00c853' : '#ffc107'} /><span className="text-xs font-semibold">{k.ctr}%</span></div></td>
                <td className="px-3 py-2">
                  {k.trending === 'up' && <span className="text-[#00c853] font-bold">↑</span>}
                  {k.trending === 'down' && <span className="text-[#ff5252] font-bold">↓</span>}
                  {k.trending === 'stable' && <span className="text-[#5a6078] font-bold">→</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">🚫</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_16_Analytics() {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', 'DAU/WAU/MAU', 'GMV & Revenue', 'Funnel', 'Top Sellers', 'Buyer Spending'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Analytics" icon="📈" actions={<><DateRangePicker /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
        {mockAnalytics.map((a, i) => (
          <KPICard key={i} label={a.label} value={`${typeof a.value === 'number' && a.value > 1000 ? TH.currency(a.value) : a.value}${a.suffix || ''}`} change={a.change} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">👥 User Growth</h3>
          <div className="space-y-3">
            {[{ label: 'DAU', val: 8420 }, { label: 'WAU', val: 32100 }, { label: 'MAU', val: 98400 }].map((u, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-white">{u.label}: {TH.number(u.val)}</span>
                  <span className="text-[#00c853] text-xs font-bold">+{mockAnalytics[i]?.change}%</span>
                </div>
                <MiniBar value={(u.val / 100000) * 100} color="#FFB800" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">💰 Revenue Mix</h3>
          <div className="space-y-3">
            {[{ label: 'GMV', val: 48200000, color: '#e91e63' }, { label: 'Revenue', val: 4820000, color: '#ff8c00' }, { label: 'Commission', val: 964000, color: '#ffc107' }, { label: 'Profit', val: 3200000, color: '#00c853' }].map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-white">{r.label}</span>
                  <span className="font-bold text-white">{TH.currency(r.val)}</span>
                </div>
                <MiniBar value={(r.val / 50000000) * 100} color={r.color} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">🔄 Conversion Funnel</h3>
          <div className="space-y-2">
            {[['เข้าชม', 12400, '#e91e63'], ['สนใจ', 8200, '#ff8c00'], ['ติดต่อ', 3400, '#ffc107'], ['จ้างงาน', 1240, '#00c853']].map(([label, val, color], i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-16 text-[#8a8fa3]">{label}</span>
                <div className="flex-1 bg-[#1e2235] rounded-full h-5">
                  <div className="h-5 rounded-full flex items-center justify-end pr-2" style={{ width: `${(Number(val) / 12400) * 100}%`, background: color as string }}>
                    <span className="text-xs font-bold text-white">{TH.number(Number(val))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_17_Fraud() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Bot', 'Fake Account', 'Chargeback', 'Fake Review', 'VPN/Proxy', 'Spam'];
  const severityColor: Record<string, string> = { high: 'bg-[#ff5252]/20 text-red-600', medium: 'bg-[#ffc107]/20 text-orange-600', low: 'bg-[#ffc107]/20 text-yellow-700' };
  return (
    <div className="space-y-3">
      <SectionHeader title="Fraud Detection" icon="🚨" actions={<><ActionBtn label="🤖 AI Settings" variant="secondary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Alerts (วันนี้)" value="7" change={2} />
        <KPICard label="High Severity" value="2" change={1} />
        <KPICard label="Banned (วันนี้)" value="1" change={0} />
        <KPICard label="False Positive Rate" value="4.2%" change={-0.8} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ประเภท', 'ระดับ', 'ผู้ใช้', 'รายละเอียด', 'สถานะ', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockFraudAlerts.map((f, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{f.id}</td>
                <td className="px-3 py-2 text-xs font-semibold">{f.type.replace('_', ' ')}</td>
                <td className="px-3 py-2"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${severityColor[f.severity]}`}>{f.severity.toUpperCase()}</span></td>
                <td className="px-3 py-2 font-mono text-xs">{f.user}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3] max-w-[200px]">{f.detail}</td>
                <td className="px-3 py-2"><StatusBadge status={f.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{f.date}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {f.status === 'investigating' && <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⛔</button>}
                    {f.status === 'flagged' && <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">🔍</button>}
                    <button className="px-2 py-1 text-xs bg-[#2a2f4a] text-[#8a8fa3] rounded hover:bg-[#2a2f4a] font-semibold">✓</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_18_AI() {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', 'Matching', 'Chat', 'Recommendations', 'Cost'];
  return (
    <div className="space-y-3">
      <SectionHeader title="AI Monitor" icon="🤖" actions={<><ActionBtn label="⚙️ AI Settings" variant="secondary" size="sm" /><ActionBtn label="📤 Report" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {mockAIMonitor.map((a, i) => (
          <KPICard key={i} label={a.metric} value={`${typeof a.value === 'number' && a.value > 1000 ? TH.number(a.value) : a.value}${a.unit}`} change={a.change} />
        ))}
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">🎯 Matching Accuracy Trend (7 วัน)</h3>
          <div className="flex items-end gap-2 h-32">
            {[91.2, 92.5, 93.1, 92.8, 94.0, 93.7, 94.2].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg flex items-end" style={{ height: `${v * 1.05}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }}>
                  <div className="w-full rounded-t-lg" style={{ height: `${v}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }} />
                </div>
                <span className="text-xs text-[#8a8fa3]">วัน {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-sm font-semibold text-white">Current: <span className="text-[#ffc107]">94.2%</span> ↑ +0.8%</div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">💬 Chat Usage (7 วัน)</h3>
          <div className="flex items-end gap-2 h-32">
            {[38200, 41000, 39500, 44200, 46800, 45200, 48200].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${(v / 50000) * 128}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }} />
                <span className="text-xs text-[#8a8fa3]">วัน {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-sm font-semibold text-white">Today: <span className="text-[#ffc107]">48,200</span> ↑ +15.3%</div>
        </div>
      </div>
    </div>
  );
}

function Section_19_Marketing() {
  const [tab, setTab] = useState('All Channels');
  const tabs = ['All Channels', 'Google Ads', 'Facebook Ads', 'TikTok Ads', 'SEO', 'Affiliate', 'Referral'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Marketing Dashboard" icon="📣" actions={<><ActionBtn label="+ เพิ่ม Campaign" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <KPICard label="Total Spend" value={TH.currency(365000)} change={8.4} />
        <KPICard label="Total Revenue" value={TH.currency(1790500)} change={12.1} />
        <KPICard label="Avg ROI" value="475%" change={5.2} />
        <KPICard label="Avg ROAS" value="4.9" change={0.3} />
        <KPICard label="Total CPA" value={TH.currency(189)} change={-4.2} />
        <KPICard label="Conversions" value="2,250" change={15.3} />
      </div>
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['Channel', 'Spend (฿)', 'Revenue (฿)', 'ROI %', 'ROAS', 'CPA (฿)', 'Conversions', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockMarketing.map((m, i) => (
              <tr key={m.channel}
                className="border-b border-[#2a2f4a] hover:bg-[#2a2f4a]"
              >
                <td className="px-3 py-2 font-semibold text-white">{m.channel}</td>
                <td className="px-3 py-2">{TH.currency(m.spend)}</td>
                <td className="px-3 py-2 font-semibold text-white">{TH.currency(m.revenue)}</td>
                <td className="px-3 py-2">
                  <span className="text-[#00c853] font-bold">{m.roi}%</span>
                </td>
                <td className="px-3 py-2 font-semibold text-white">{m.roas.toFixed(1)}x</td>
                <td className="px-3 py-2 font-semibold text-white">{TH.currency(m.cpa)}</td>
                <td className="px-3 py-2 font-semibold">{TH.number(m.conversions)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">📊</button>
                    <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_20_ServerMonitor() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Compute', 'Database', 'Cache', 'Network', 'SSL'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Server Monitor" icon="🖥️" actions={<><ActionBtn label="🔄 Refresh" variant="secondary" size="sm" /><ActionBtn label="📤 Server Report" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KPICard label="Uptime (30 วัน)" value="99.97%" change={0.01} />
        <KPICard label="Avg CPU" value="42%" change={3} />
        <KPICard label="Avg RAM" value="68%" change={-2} />
        <KPICard label="Active Alerts" value="2" change={1} />
        <KPICard label="API Latency (ms)" value="124" change={-8} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['Resource', 'Usage', 'Status', 'Details', 'Last Checked'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockServer.map((s, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-semibold text-xs text-white">{s.resource}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <MiniBar value={s.usage} max={100} color={s.usage >= 80 ? '#ff5252' : s.usage >= 60 ? '#ffc107' : '#00c853'} />
                    <span className="text-xs font-bold">{typeof s.usage === 'number' && s.usage < 100 ? `${s.usage}%` : s.usage}{s.suffix || ''}</span>
                  </div>
                </td>
                <td className="px-3 py-2"><StatusBadge status={s.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{s.expiry ? `หมดอายุ: ${s.expiry}` : '-'}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">2 วินาทีที่แล้ว</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">⚡ API Latency (ms)</h3>
          <div className="flex items-end gap-2 h-24">
            {[120, 135, 118, 142, 128, 115, 124].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${v * 0.6}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }} />
                <span className="text-xs text-[#8a8fa3]">{v}ms</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">💾 Memory Usage</h3>
          <div className="flex items-end gap-2 h-24">
            {[58, 62, 65, 61, 68, 70, 68].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${v * 0.5}px`, background: i === 6 ? '#e91e63' : '#ff8c00' }} />
                <span className="text-xs text-[#8a8fa3]">{v}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">📊 Storage Breakdown</h3>
          <div className="space-y-2">
            {[{ label: 'Images', val: 42, color: '#e91e63' }, { label: 'Videos', val: 28, color: '#ff8c00' }, { label: 'Documents', val: 18, color: '#ffc107' }, { label: 'Others', val: 12, color: '#5a6078' }].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5"><span className="text-[#8a8fa3]">{s.label}</span><span className="font-semibold text-white">{s.val}%</span></div>
                <div className="bg-[#1e2235] rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${s.val}%`, background: s.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_21_Logs() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Admin', 'Activity', 'Login', 'API', 'Payment', 'Email', 'Security'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Logs" icon="📜" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="⚙️ Log Settings" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'Type', 'Action', 'Admin', 'Target', 'IP', 'Date & Time', 'Status'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((l, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{l.id}</td>
                <td className="px-3 py-2"><StatusBadge status={l.type} /></td>
                <td className="px-3 py-2 text-xs font-semibold text-white">{l.action}</td>
                <td className="px-3 py-2 text-xs">{l.admin}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{l.target}</td>
                <td className="px-3 py-2 font-mono text-xs text-[#8a8fa3]">{l.ip}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{l.date}</td>
                <td className="px-3 py-2"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_22_Security() {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', '2FA', 'Sessions', 'Login History', 'Devices', 'Permissions', 'API Keys', 'OAuth'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Security" icon="🔐" actions={<><ActionBtn label="🔄 Force Logout All" variant="danger" size="sm" /><ActionBtn label="⚙️ Security Settings" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Sessions" value="14" change={3} />
        <KPICard label="2FA Enabled" value="18/20" change={10} />
        <KPICard label="Failed Login (วันนี้)" value="8" change={-3} />
        <KPICard label="Suspicious IPs" value="2" change={1} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">👥 Active Admin Sessions</h3>
          <div className="space-y-3">
            {[
              { name: 'สุรชัย ใจดี', email: 'surachai@beefix.com', device: 'Chrome / macOS', ip: '1.46.234.18', location: 'Bangkok, TH', time: '2 ชม. ที่แล้ว', current: true },
              { name: 'ณิชารีย์ เจริญ', email: 'nitcharee@beefix.com', device: 'Safari / iOS', ip: '49.228.17.93', location: 'Chiang Mai, TH', time: '5 ชม. ที่แล้ว', current: false },
              { name: 'วิชัย เกษตรวิสุทธิ์', email: 'vichai@beefix.com', device: 'Firefox / Windows', ip: '203.150.82.41', location: 'Phuket, TH', time: '1 ชม. ที่แล้ว', current: false },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-[#1e2235] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <div>
                      <div className="font-semibold text-sm text-white">{s.name}</div>
                      <div className="text-xs text-[#8a8fa3]">{s.email}</div>
                    </div>
                  </div>
                  {s.current && <span className="text-xs bg-[#00c853]/20 text-green-700 px-2 py-0.5 rounded-full font-bold">Current</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8a8fa3]">
                  <span>📱 {s.device}</span>
                  <span>🌐 {s.ip}</span>
                  <span>📍 {s.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#8a8fa3]">{s.time}</span>
                  {!s.current && <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⛔ Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">🔑 API Key Management</h3>
          <div className="space-y-3">
            {[
              { name: 'Beefix iOS App', key: 'bfx_live_************k92m', perms: 'Read, Write', calls: '4.8M', status: 'active' },
              { name: 'Stripe Webhook', key: 'bfx_live_************w38x', perms: 'Read', calls: '892K', status: 'active' },
              { name: 'Test Environment', key: 'bfx_test_************4h28', perms: 'Read, Write', calls: '42K', status: 'inactive' },
            ].map((k, i) => (
              <div key={i} className="p-3 bg-[#1e2235] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-white">{k.name}</span>
                  <StatusBadge status={k.status} />
                </div>
                <div className="font-mono text-xs text-[#8a8fa3] mb-1">{k.key}</div>
                <div className="flex items-center gap-3 text-xs text-[#8a8fa3]">
                  <span>🔑 {k.perms}</span>
                  <span>📊 {k.calls}</span>
                  <button className="text-blue-500 hover:underline ml-auto">✏️ Rotate</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_23_AdminManagement() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Super Admin', 'Finance', 'Support', 'Content', 'Operations'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Admin Management" icon="👔" actions={<><ActionBtn label="+ เพิ่ม Admin" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Admins" value="5" change={0} />
        <KPICard label="Active Sessions" value="4" change={1} />
        <KPICard label="Last 24h Login" value="4" change={-1} />
        <KPICard label="Departments" value="4" change={0} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['ID', 'ชื่อ', 'อีเมล', 'Role', 'แผนก', 'Sessions', 'สถานะ', 'เข้าล่าสุด', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAdmins.map((a, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-mono text-xs">{a.id}</td>
                <td className="px-3 py-2 font-semibold text-xs text-white">{a.name}</td>
                <td className="px-3 py-2 text-xs">{a.email}</td>
                <td className="px-3 py-2"><StatusBadge status={a.role} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{a.department}</td>
                <td className="px-3 py-2"><span className="font-bold text-xs text-white">{a.sessions}</span></td>
                <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{a.lastLogin}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    {a.status === 'active' ? <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⛔</button> : <button className="px-2 py-1 text-xs bg-[#00c853]/20 text-[#00c853] rounded hover:bg-[#00c853]/20 font-semibold">✓</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_24_FileManagement() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Images', 'Videos', 'Documents', 'Storage'];
  return (
    <div className="space-y-3">
      <SectionHeader title="File Management" icon="📁" actions={<><ActionBtn label="🧹 Find Duplicates" variant="secondary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Files" value="184,420" change={128} />
        <KPICard label="Total Storage" value="230.5 GB" change={2.4} />
        <KPICard label="Images" value="8.2 GB" change={0.8} />
        <KPICard label="Videos" value="220 GB" change={1.6} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['File Name', 'Type', 'Size', 'Owner', 'Uploads', 'Storage', 'Status', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockFiles.map((f, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-semibold text-xs text-white max-w-[180px] truncate">{f.name}</td>
                <td className="px-3 py-2"><StatusBadge status={f.type} /></td>
                <td className="px-3 py-2 font-semibold text-xs">{f.size}</td>
                <td className="px-3 py-2 text-xs">{f.owner}</td>
                <td className="px-3 py-2 text-xs">{TH.number(f.uploads)}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{f.storage}</td>
                <td className="px-3 py-2"><StatusBadge status={f.status} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_25_APIManagement() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Active', 'Inactive', 'Rate Limited'];
  return (
    <div className="space-y-3">
      <SectionHeader title="API Management" icon="🔌" actions={<><ActionBtn label="+ สร้าง API Key" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Keys" value="5" change={0} />
        <KPICard label="Total Calls (วันนี้)" value="13.4M" change={8.2} />
        <KPICard label="Avg Latency" value="42ms" change={-5} />
        <KPICard label="Error Rate" value="0.12%" change={-0.03} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['Name', 'API Key', 'Permissions', 'Rate Limit', 'Total Calls', 'Last Used', 'Status', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAPIKeys.map((k, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-semibold text-xs text-white">{k.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-[#8a8fa3]">{k.key}</td>
                <td className="px-3 py-2"><div className="flex gap-1 flex-wrap">{k.permissions.map(p => <span key={p} className="text-xs bg-[#ffc107]/20 text-[#ffc107] px-1.5 py-0.5 rounded">{p}</span>)}</div></td>
                <td className="px-3 py-2 text-xs">{k.rateLimit}</td>
                <td className="px-3 py-2 font-semibold text-xs">{TH.number(k.calls)}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{k.lastUsed}</td>
                <td className="px-3 py-2"><StatusBadge status={k.status} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">🔄</button>
                    <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_26_FinancialReport() {
  const [tab, setTab] = useState('Daily');
  const tabs = ['Daily', 'Monthly', 'Yearly'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Financial Report" icon="💰" actions={<><ActionBtn label="📊 Export Excel" variant="secondary" size="sm" /><ActionBtn label="📄 Export PDF" variant="secondary" size="sm" /></>} />
      <div className="flex items-center justify-between">
        <TabPills tabs={tabs} active={tab} onChange={setTab} />
        <DateRangePicker />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KPICard label="Total GMV" value={TH.currency(4820000)} change={8.4} />
        <KPICard label="Total Revenue" value={TH.currency(482000)} change={8.4} />
        <KPICard label="Commission" value={TH.currency(96400)} change={7.2} />
        <KPICard label="VAT" value={TH.currency(33600)} change={6.8} />
        <KPICard label="Net Profit" value={TH.currency(239600)} change={12.1} />
      </div>
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['วันที่', 'GMV (฿)', 'Revenue (฿)', 'Commission (฿)', 'VAT (฿)', 'Cost (฿)', 'Profit (฿)'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockFinancialReports.map((r, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-semibold text-xs text-white">{r.period}</td>
                <td className="px-3 py-2 font-semibold text-xs">{TH.currency(r.gmv)}</td>
                <td className="px-3 py-2 text-xs">{TH.currency(r.revenue)}</td>
                <td className="px-3 py-2 text-[#ffc107] font-semibold">{TH.currency(r.commission)}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{TH.currency(r.vat)}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{TH.currency(r.cost)}</td>
                <td className="px-3 py-2 font-bold text-[#00c853] text-xs">{TH.currency(r.profit)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[#e91e63] bg-[#1e2235] font-bold">
              <td className="px-3 py-2 text-xs text-white">รวม</td>
              <td className="px-3 py-2 text-xs text-white">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.gmv, 0))}</td>
              <td className="px-3 py-2 text-xs text-white">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.revenue, 0))}</td>
              <td className="px-3 py-2 text-xs text-[#ffc107]">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.commission, 0))}</td>
              <td className="px-3 py-2 text-xs text-white">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.vat, 0))}</td>
              <td className="px-3 py-2 text-xs text-white">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.cost, 0))}</td>
              <td className="px-3 py-2 text-[#00c853] text-xs">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.profit, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">💵 P&L Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Revenue', val: 482000, color: '#FFB800' },
              { label: 'Commission', val: 96400, color: '#E5A500' },
              { label: 'VAT', val: 33600, color: '#8B6914' },
              { label: 'Operating Cost', val: 146000, color: '#EF4444' },
              { label: 'Net Profit', val: 239600, color: '#22C55E' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#8a8fa3]">{item.label}</span>
                  <span className="font-bold text-white">{TH.currency(item.val)}</span>
                </div>
                <div className="bg-[#1e2235] rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${(item.val / 500000) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]">
          <h3 className="font-bold text-white mb-3">📊 Cash Flow</h3>
          <div className="flex items-end gap-2 h-40">
            {[
              { label: 'ต.ค.', in: 4.2, out: 2.1 },
              { label: 'พ.ย.', in: 3.8, out: 1.9 },
              { label: 'ธ.ค.', in: 5.1, out: 2.5 },
              { label: 'ม.ค.', in: 4.5, out: 2.2 },
              { label: 'ก.พ.', in: 4.8, out: 2.3 },
              { label: 'มี.ค.', in: 5.3, out: 2.6 },
            ].map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col-reverse" style={{ height: '80px' }}>
                  <div className="w-full rounded-t-sm" style={{ height: `${m.in * 15}px`, background: '#00c853' }} />
                  <div className="w-full rounded-t-sm" style={{ height: `${m.out * 15}px`, background: '#ff5252' }} />
                </div>
                <span className="text-xs text-[#8a8fa3] mt-1">{m.label}</span>
                <div className="flex gap-0.5 mt-0.5">
                  <div className="w-3 h-2 rounded-sm bg-[#00c853]" />
                  <div className="w-3 h-2 rounded-sm bg-[#ff5252]" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#8a8fa3]">
            <span className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-[#00c853]" /> Inflow</span>
            <span className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-[#ff5252]" /> Outflow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_27_Automation() {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Active', 'Paused', 'Failed'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Automation" icon="⚡" actions={<><ActionBtn label="+ สร้าง Automation" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Automations" value="7" change={0} />
        <KPICard label="Avg Success Rate" value="95.3%" change={0.8} />
        <KPICard label="Runs Today" value="1,847" change={12.4} />
        <KPICard label="Failed (วันนี้)" value="3" change={-2} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2235]">
              {['Name', 'Trigger', 'Schedule', 'Last Run', 'Success Rate', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold text-[#8a8fa3] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAutomations.map((a, i) => (
              <tr key={i} className={`border-t border-[#2a2f4a] ${i % 2 === 0 ? 'bg-white' : 'bg-[#1e2235]'}`}>
                <td className="px-3 py-2 font-semibold text-xs text-white">{a.name}</td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3] max-w-[160px] truncate">{a.trigger}</td>
                <td className="px-3 py-2 text-xs"><StatusBadge status={a.schedule} /></td>
                <td className="px-3 py-2 text-xs text-[#8a8fa3]">{a.lastRun}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <MiniBar value={a.successRate} max={100} color={a.successRate >= 95 ? '#00c853' : a.successRate >= 85 ? '#ffc107' : '#ff5252'} />
                    <span className="text-xs font-bold text-white">{a.successRate}%</span>
                  </div>
                </td>
                <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">▶️</button>
                    <button className="px-2 py-1 text-xs bg-[#ff5252]/20 text-[#ff5252] rounded hover:bg-[#ff5252]/20 font-semibold">⏸️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section_28_Settings() {
  const [tab, setTab] = useState('General');
  const tabs = ['General', 'Language', 'Currency', 'Tax', 'Payment Gateway', 'SMTP', 'Cloud Storage', 'Maintenance'];
  return (
    <div className="space-y-3">
      <SectionHeader title="Settings" icon="⚙️" actions={<><ActionBtn label="💾 Save All" variant="primary" size="sm" /><ActionBtn label="🔄 Reset" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a] space-y-3">
          <h3 className="font-bold text-white">🌐 General Settings</h3>
          <div>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">Site Name</label>
            <input type="text" className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" defaultValue="Beefix" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">Site URL</label>
            <input type="text" className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" defaultValue="https://beefix.co.th" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">Support Email</label>
            <input type="text" className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" defaultValue="support@beefix.co.th" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">Default Language</label>
            <select className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" defaultValue="th">
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">Default Currency</label>
            <select className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" defaultValue="THB">
              <option value="THB">THB (บาท)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8a8fa3] mb-1">Tax Rate (%)</label>
            <input type="number" className="bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]" defaultValue="7" />
          </div>
        </div>
        <div className="bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a] space-y-3">
          <h3 className="font-bold text-white">💳 Payment Gateway</h3>
          <div className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-semibold text-sm">Stripe</div>
                <div className="text-xs text-[#00c853]">● Connected</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">Configure</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-semibold text-sm">PromptPay / SCB QR</div>
                <div className="text-xs text-[#00c853]">● Connected</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">Configure</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏦</span>
              <div>
                <div className="font-semibold text-sm">Bank Transfer (Manual)</div>
                <div className="text-xs text-yellow-600">● Pending Setup</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-[#ffc107]/20 text-[#ffc107] rounded hover:bg-[#ffc107]/20 font-semibold">Setup</button>
          </div>
          <h3 className="font-bold text-white pt-4">☁️ Cloud Storage</h3>
          <div className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-semibold text-sm">AWS S3</div>
                <div className="text-xs text-[#00c853]">● Connected (230.5 GB used)</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-[#2196f3]/20 text-[#2196f3] rounded hover:bg-[#2196f3]/20 font-semibold">Settings</button>
          </div>
          <h3 className="font-bold text-white pt-4">🔧 Maintenance Mode</h3>
          <div className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">
            <div>
              <div className="font-semibold text-sm">Maintenance Mode</div>
              <div className="text-xs text-[#ff5252]">ปิดปรับปรุงระบบ</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-[#2a2f4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#2a2f4a] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e91e63]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section_29_Widgets() {
  const [widgets, setWidgets] = useState(mockWidgets);
  const toggle = (id: string) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  return (
    <div className="space-y-3">
      <SectionHeader title="Dashboard Widgets" icon="🧩" actions={<><ActionBtn label="🔄 Reset to Default" variant="secondary" size="sm" /><ActionBtn label="💾 Save Layout" variant="primary" size="sm" /></>} />
      <p className="text-sm text-[#8a8fa3]">คลิกเพื่อเปิด/ปิด widget — ลากเพื่อจัดเรียงใหม่ (drag-to-reorder)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {widgets.map(w => (
          <div
            key={w.id}
            onClick={() => toggle(w.id)}
            className={`cursor-pointer rounded-2xl p-4 border transition-all ${w.enabled ? 'bg-white border-[#2a2f4a] shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-60'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${w.enabled ? 'bg-[#FFF0B3]' : 'bg-[#2a2f4a]'}`}>
                {{
                  w1: '💰', w2: '👥', w3: '📋', w4: '⚠️', w5: '🏧',
                  w6: '🔔', w7: '❌', w8: '🖥️', w9: '🤖', w10: '📊',
                  w11: '🛠️', w12: '🛒', w13: '💡'
                }[w.id] || '📊'}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${w.enabled ? 'border-[#e91e63] bg-[#e91e63]' : 'border-[#2a2f4a]'}`}>
                {w.enabled && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <div className="text-lg font-bold text-white">{w.value}</div>
            <div className="text-xs text-[#8a8fa3] font-semibold">{w.label}</div>
            <div className={`text-xs font-bold mt-1 ${w.trend === 'up' ? 'text-[#00c853]' : w.trend === 'down' ? 'text-[#ff5252]' : 'text-[#5a6078]'}`}>
              {w.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<SectionId>('executive');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['📊 ภาพรวมธุรกิจ']));

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'executive': return <Section_01_ExecutiveDashboard />;
      case 'buyers': return <Section_02_Buyers />;
      case 'sellers': return <Section_03_Sellers />;
      case 'jobs': return <Section_04_Jobs />;
      case 'orders': return <Section_05_Orders />;
      case 'escrow': return <Section_06_Escrow />;
      case 'withdrawal': return <Section_07_Withdrawal />;
      case 'payments': return <Section_08_Payments />;
      case 'promotions': return <Section_09_Promotions />;
      case 'notifications': return <Section_10_Notifications />;
      case 'support': return <Section_11_Support />;
      case 'reviews': return <Section_12_Reviews />;
      case 'cms': return <Section_13_CMS />;
      case 'categories': return <Section_14_Categories />;
      case 'search': return <Section_15_Search />;
      case 'analytics': return <Section_16_Analytics />;
      case 'fraud': return <Section_17_Fraud />;
      case 'ai': return <Section_18_AI />;
      case 'marketing': return <Section_19_Marketing />;
      case 'server': return <Section_20_ServerMonitor />;
      case 'logs': return <Section_21_Logs />;
      case 'security': return <Section_22_Security />;
      case 'admin': return <Section_23_AdminManagement />;
      case 'files': return <Section_24_FileManagement />;
      case 'api': return <Section_25_APIManagement />;
      case 'financial': return <Section_26_FinancialReport />;
      case 'automation': return <Section_27_Automation />;
      case 'settings': return <Section_28_Settings />;
      case 'widgets': return <Section_29_Widgets />;
      default: return <Section_01_ExecutiveDashboard />;
    }
  };


  return (
    <div className="min-h-screen bg-[#1a1d2e] flex">
      {/* Sidebar */}
      {/* Sidebar — flex, always visible on desktop, hidden on mobile */}
      <aside className="w-[240px] flex-shrink-0 bg-[#15172a] border-r border-[#2a2f4a] flex flex-col overflow-y-auto">
  {/* Logo */}
  <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2f4a]">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">🐝</div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-white text-sm">Beefix</div>
      <div className="text-[10px] text-[#8a8fa3]">Admin Panel</div>
    </div>
  </div>
  {/* Nav */}
  <nav className="flex-1 overflow-y-auto py-3 px-3">
    {navGroups.map(group => (
      <div key={group.group} className="mb-4">
        <div className="text-[10px] font-bold text-[#5a6078] uppercase tracking-widest px-2 mb-2">
          {group.group}
        </div>
        {group.items.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all ${
              activeSection === item.id
                ? 'bg-[rgba(233,30,99,0.15)] text-white border-l-2 border-[#e91e63] font-semibold'
                : 'text-[#8a8fa3] hover:bg-[#1e2235] hover:text-white'
            }`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    ))}
  </nav>
  {/* Admin profile */}
  <div className="border-t border-[#2a2f4a] p-4">
    <div className="flex items-center gap-3 px-2 py-1.5">
      <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">A</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">Admin</div>
        <div className="text-[11px] text-[#8a8fa3] truncate">superadmin@beefix.com</div>
      </div>
    </div>
  </div>
</aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#1a1d2e] border-b border-[#2a2f4a] px-5 py-3 flex items-center justify-between gap-3">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-sm font-bold text-white">🐝</div>
    <div>
      <h1 className="font-bold text-white text-sm">Beefix Admin</h1>
      <p className="text-[11px] text-[#8a8fa3]">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <button onClick={() => addToast('🔔 3 การแจ้งเตือนใหม่', 'info')} className="relative p-2 text-[#8a8fa3] hover:text-white hover:bg-[#252a40] rounded-lg transition-colors text-sm">
      🔔<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e91e63] text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
    </button>
    <button onClick={() => addToast('⚙️ การตั้งค่าถูกบันทึกแล้ว', 'success')} className="p-2 text-[#8a8fa3] hover:text-white hover:bg-[#252a40] rounded-lg transition-colors text-sm">⚙️</button>
    <button onClick={() => addToast('ออกจากระบบสำเร็จ 👋', 'warning')} className="px-3 py-1.5 bg-[#e91e63] text-white rounded-lg text-xs font-semibold hover:bg-[#c1175a] transition-colors">ออก</button>
  </div>
</header>

        {/* Page Content */}
        <div className="bg-[#1a1d2e] p-5 min-h-[calc(100vh-57px)]">
          <div className="max-w-[1440px] mx-auto">
            {renderSection()}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[200] space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-[fadeIn_0.3s_ease] border ${
              toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
              toast.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-blue-50 text-[#2196f3] border-blue-200'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
