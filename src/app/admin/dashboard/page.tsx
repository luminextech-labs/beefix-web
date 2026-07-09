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
  gmvSpark: [28, 35, 31, 42, 38, 48, 45],
  revenue: 4820000,
  revenueSpark: [26, 33, 29, 40, 36, 46, 43],
  commission: 964000,
  commissionSpark: [5, 7, 6, 9, 8, 10, 9],
  grossProfit: 3200000,
  grossProfitSpark: [18, 22, 20, 28, 25, 32, 30],
  activeUsers: 18420,
  activeUsersSpark: [12000, 13500, 14200, 15800, 16500, 17800, 18420],
  newUsersToday: 312,
  newUsersSpark: [180, 220, 250, 280, 240, 300, 312],
  newBuyers: 180,
  newBuyersSpark: [100, 130, 140, 160, 150, 175, 180],
  newSellers: 132,
  newSellersSpark: [80, 95, 100, 110, 105, 125, 132],
  todaysJobs: 847,
  todaysJobsSpark: [500, 620, 580, 720, 680, 810, 847],
  inProgress: 1240,
  inProgressSpark: [800, 900, 950, 1100, 1050, 1180, 1240],
  completed: 38291,
  completedSpark: [25000, 28000, 29500, 32000, 33500, 36500, 38291],
  cancelled: 892,
  cancelledSpark: [600, 720, 680, 800, 750, 860, 892],
  tickets: 34,
  ticketsSpark: [45, 40, 38, 35, 42, 30, 34],
  disputes: 12,
  disputesSpark: [8, 10, 9, 11, 10, 13, 12],
  escrowHeld: 5840000,
  escrowHeldSpark: [3200000, 3800000, 4100000, 4500000, 4900000, 5400000, 5840000],
  pendingWithdrawal: 1280000,
  pendingWithdrawalSpark: [800000, 900000, 850000, 1000000, 1100000, 1200000, 1280000],
  conversionRate: 3.8,
  conversionRateSpark: [3.2, 3.4, 3.3, 3.6, 3.5, 3.7, 3.8],
  aov: 4850,
  aovSpark: [4200, 4400, 4300, 4600, 4500, 4750, 4850],
  ltv: 12400,
  ltvSpark: [10000, 10500, 10800, 11200, 11600, 12000, 12400],
  cac: 820,
  cacSpark: [920, 900, 880, 860, 840, 830, 820],
  retentionRate: 78.5,
  retentionRateSpark: [72, 73, 74, 75, 76, 77, 78.5],
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

function MiniSparkline({ data, color = '#FFB800', height = 32 }: { data: number[]; color?: string; height?: number }) {
  if (!data || data.length < 2) return <div style={{ width: 56, height }} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 56;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={w} height={height} className="inline-block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function KPICard({ label, value, change, prefix = '', suffix = '', trend, sparkline, icon }: {
  label: string; value: string | number; change?: number | string;
  prefix?: string; suffix?: string; trend?: 'up' | 'down' | 'neutral';
  sparkline?: number[]; icon?: string;
}) {
  const isPositive = typeof change === 'number' ? change >= 0 : trend === 'up' || trend === 'neutral';
  const changeBg = typeof change === 'number' ? (change >= 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-100';
  const changeText = typeof change === 'number' ? (change >= 0 ? 'text-white' : 'text-white') : 'text-gray-500';
  const arrow = typeof change === 'number' ? (change >= 0 ? '↑' : '↓') : (trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→');
  const sparkColor = isPositive ? '#22C55E' : '#EF4444';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-[#B8A882] font-semibold mb-1 uppercase tracking-wider">{label}</div>
        <div className="text-xl font-bold text-[#1a1a1a] leading-tight">{prefix}{typeof value === 'number' ? value.toLocaleString('th-TH') : value}{suffix}</div>
        {change !== undefined && (
          <div className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${changeBg} ${changeText}`}>
            {arrow} {typeof change === 'number' ? `${change >= 0 ? '+' : ''}${change}${typeof change === 'number' && Math.abs(change) < 100 ? '%' : ''}` : change}
          </div>
        )}
      </div>
      {sparkline && (
        <MiniSparkline data={sparkline} color={sparkColor} height={40} />
      )}
      {!sparkline && icon && (
        <div className="text-2xl opacity-50">{icon}</div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
    completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
    success: { label: 'Success', className: 'bg-emerald-50 text-emerald-700' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700' },
    published: { label: 'Published', className: 'bg-emerald-50 text-emerald-700' },
    visible: { label: 'Visible', className: 'bg-emerald-50 text-emerald-700' },
    healthy: { label: 'Healthy', className: 'bg-emerald-50 text-emerald-700' },
    confirmed: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700' },
    in_progress: { label: 'In Progress', className: 'bg-violet-50 text-violet-700' },
    delivered: { label: 'Delivered', className: 'bg-sky-50 text-sky-700' },
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
    warning: { label: 'Warning', className: 'bg-amber-50 text-amber-700' },
    paused: { label: 'Paused', className: 'bg-amber-50 text-amber-700' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-500' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-500' },
    suspended: { label: 'Suspended', className: 'bg-red-50 text-red-600' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600' },
    failed: { label: 'Failed', className: 'bg-red-50 text-red-600' },
    error: { label: 'Error', className: 'bg-red-50 text-red-600' },
    disputed: { label: 'Disputed', className: 'bg-orange-50 text-orange-700' },
    refunded: { label: 'Refunded', className: 'bg-orange-50 text-orange-700' },
    chargeback: { label: 'Chargeback', className: 'bg-red-50 text-red-600' },
    held: { label: 'Held', className: 'bg-sky-50 text-sky-700' },
    problem: { label: 'Problem', className: 'bg-red-50 text-red-600' },
    pending_release: { label: 'Pending Release', className: 'bg-amber-50 text-amber-700' },
    released: { label: 'Released', className: 'bg-emerald-50 text-emerald-700' },
    open: { label: 'Open', className: 'bg-red-50 text-red-600' },
    reported: { label: 'Reported', className: 'bg-orange-50 text-orange-700' },
    hidden: { label: 'Hidden', className: 'bg-gray-100 text-gray-500' },
    banned: { label: 'Banned', className: 'bg-red-50 text-red-600' },
    flagged: { label: 'Flagged', className: 'bg-orange-50 text-orange-700' },
    investigating: { label: 'Investigating', className: 'bg-amber-50 text-amber-700' },
    pending_review: { label: 'Pending Review', className: 'bg-amber-50 text-amber-700' },
    high: { label: 'High', className: 'bg-red-50 text-red-600' },
    medium: { label: 'Medium', className: 'bg-orange-50 text-orange-700' },
    low: { label: 'Low', className: 'bg-amber-50 text-amber-700' },
    expired: { label: 'Expired', className: 'bg-gray-100 text-gray-500' },
    super_admin: { label: 'Super Admin', className: 'bg-violet-50 text-violet-700' },
    finance_manager: { label: 'Finance', className: 'bg-sky-50 text-sky-700' },
    support_manager: { label: 'Support', className: 'bg-emerald-50 text-emerald-700' },
    content_manager: { label: 'Content', className: 'bg-amber-50 text-amber-700' },
    operations: { label: 'Operations', className: 'bg-orange-50 text-orange-700' },
    bank_transfer: { label: 'Bank Transfer', className: 'bg-sky-50 text-sky-700' },
    promptpay: { label: 'PromptPay', className: 'bg-emerald-50 text-emerald-700' },
    image: { label: 'Image', className: 'bg-sky-50 text-sky-700' },
    video: { label: 'Video', className: 'bg-violet-50 text-violet-700' },
    document: { label: 'Document', className: 'bg-amber-50 text-amber-700' },
    banner: { label: 'Banner', className: 'bg-pink-50 text-pink-700' },
    blog: { label: 'Blog', className: 'bg-sky-50 text-sky-700' },
    faq: { label: 'FAQ', className: 'bg-emerald-50 text-emerald-700' },
    terms: { label: 'Terms', className: 'bg-gray-100 text-gray-500' },
    privacy: { label: 'Privacy', className: 'bg-blue-50 text-blue-700' },
    help: { label: 'Help', className: 'bg-sky-50 text-sky-700' },
    referral: { label: 'Referral', className: 'bg-emerald-50 text-emerald-700' },
    cashback: { label: 'Cashback', className: 'bg-green-50 text-green-700' },
    campaign: { label: 'Campaign', className: 'bg-pink-50 text-pink-700' },
    voucher: { label: 'Voucher', className: 'bg-amber-50 text-amber-700' },
    coupon: { label: 'Coupon', className: 'bg-amber-50 text-amber-700' },
    flash_sale: { label: 'Flash Sale', className: 'bg-red-50 text-red-600' },
    credit_card: { label: 'Credit Card', className: 'bg-sky-50 text-sky-700' },
    qr_promptpay: { label: 'QR PromptPay', className: 'bg-emerald-50 text-emerald-700' },
    wallet: { label: 'Wallet', className: 'bg-violet-50 text-violet-700' },
    admin: { label: 'Admin', className: 'bg-violet-50 text-violet-700' },
    payment: { label: 'Payment', className: 'bg-sky-50 text-sky-700' },
    login: { label: 'Login', className: 'bg-sky-50 text-sky-700' },
    api: { label: 'API', className: 'bg-amber-50 text-amber-700' },
    email: { label: 'Email', className: 'bg-sky-50 text-sky-700' },
    security: { label: 'Security', className: 'bg-red-50 text-red-600' },
    activity: { label: 'Activity', className: 'bg-gray-100 text-gray-500' },
    Instant: { label: 'Instant', className: 'bg-emerald-50 text-emerald-700' },
    'Every 6h': { label: 'Every 6h', className: 'bg-sky-50 text-sky-700' },
    'Daily 09:00': { label: 'Daily 09:00', className: 'bg-amber-50 text-amber-700' },
    'Daily 02:00': { label: 'Daily 02:00', className: 'bg-violet-50 text-violet-700' },
    'Daily 06:00': { label: 'Daily 06:00', className: 'bg-orange-50 text-orange-700' },
    complaint: { label: 'Complaint', className: 'bg-orange-50 text-orange-700' },
    refund: { label: 'Refund', className: 'bg-orange-50 text-orange-700' },
    general: { label: 'General', className: 'bg-gray-100 text-gray-500' },
    bot: { label: 'Bot', className: 'bg-red-50 text-red-600' },
    fake_account: { label: 'Fake Account', className: 'bg-orange-50 text-orange-700' },
    multiple_login: { label: 'Multiple Login', className: 'bg-orange-50 text-orange-700' },
    fake_review: { label: 'Fake Review', className: 'bg-red-50 text-red-600' },
    vpn_proxy: { label: 'VPN/Proxy', className: 'bg-orange-50 text-orange-700' },
    spam: { label: 'Spam', className: 'bg-amber-50 text-amber-700' },
  };
  const cfg = map[status] || { label: status, className: 'bg-gray-100 text-gray-500' };
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

function SectionHeader({ title, icon, actions }: { title: string; icon?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
      <h2 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span>{title}</span>
      </h2>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function ActionBtn({ label, variant = 'primary', size = 'sm' }: { label: string; variant?: 'primary' | 'secondary' | 'danger'; size?: 'sm' | 'md' }) {
  const base = 'rounded-lg font-semibold cursor-pointer transition-all font-Prompt inline-flex items-center gap-1.5';
  const sizeCls = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const variantCls = variant === 'primary' ? 'bg-[#FFB800] text-[#3D2C00] hover:bg-[#E5A500] shadow-sm' : variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm' : 'bg-gray-50 text-[#3D2C00] border border-gray-200 hover:bg-gray-100';
  return <button className={`${base} ${sizeCls} ${variantCls}`}>{label}</button>;
}

function TabPills({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 mb-5 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${active === tab ? 'bg-[#FFB800] text-[#3D2C00] font-bold' : 'bg-transparent text-[#8B7355] hover:bg-[#FFF8E7]'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#FAFAFA] border-b border-gray-100">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8B7355] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-b border-gray-50 hover:bg-gray-50/30 transition-colors ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-white'}`}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-xs text-[#3D2C00]">{cell}</td>
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
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}


function DateRangePicker() {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-4 py-3">
      <span className="text-sm">📅</span>
      <span className="text-xs text-[#8B7355]">09 ก.ค. 2026 – 09 ก.ค. 2026</span>
      <span className="text-xs text-[#FFB800] font-semibold cursor-pointer ml-1">เปลี่ยน</span>
    </div>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function Section_01_ExecutiveDashboard() {
  const [tab, setTab] = useState('Today');
  const tabs = ['Today', '7 Days', '30 Days', '90 Days', 'Year'];

  // Line chart data
  const chartData = [
    { day: 'จ.', gmv: 28, rev: 26 },
    { day: 'อ.', gmv: 35, rev: 33 },
    { day: 'พ.', gmv: 31, rev: 29 },
    { day: 'พฤ.', gmv: 42, rev: 40 },
    { day: 'ศ.', gmv: 38, rev: 36 },
    { day: 'ส.', gmv: 48, rev: 46 },
    { day: 'อา.', gmv: 45, rev: 43 },
  ];
  const maxVal = Math.max(...chartData.map(d => d.gmv));

  // Job donut
  const jobStats = [
    { label: 'Completed', value: 38291, color: '#22C55E' },
    { label: 'In Progress', value: 1240, color: '#8B5CF6' },
    { label: 'Pending', value: 847, color: '#F59E0B' },
    { label: 'Cancelled', value: 892, color: '#9CA3AF' },
    { label: 'Disputed', value: 12, color: '#EF4444' },
  ];
  const totalJobs = jobStats.reduce((s, j) => s + j.value, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const donut = jobStats.map(j => {
    const pct = j.value / totalJobs;
    const dash = circumference * pct;
    const gap = circumference - dash;
    const seg = { ...j, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionHeader title="Overview" icon="📊" />
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <ActionBtn label="📤 Export" variant="secondary" />
        </div>
      </div>

      <TabPills tabs={tabs} active={tab} onChange={setTab} />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard label="GMV" value={TH.currency(mockKPI.gmv)} change={12.4} sparkline={mockKPI.gmvSpark} />
        <KPICard label="Revenue" value={TH.currency(mockKPI.revenue)} change={12.4} sparkline={mockKPI.revenueSpark} />
        <KPICard label="Commission" value={TH.currency(mockKPI.commission)} change={11.8} sparkline={mockKPI.commissionSpark} />
        <KPICard label="Active Users" value={TH.number(mockKPI.activeUsers)} change={8.1} sparkline={mockKPI.activeUsersSpark} />
        <KPICard label="New Users" value={TH.number(mockKPI.newUsersToday)} change={12.3} sparkline={mockKPI.newUsersSpark} />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard label="New Buyers" value={TH.number(mockKPI.newBuyers)} change={9.5} sparkline={mockKPI.newBuyersSpark} />
        <KPICard label="New Sellers" value={TH.number(mockKPI.newSellers)} change={15.7} sparkline={mockKPI.newSellersSpark} />
        <KPICard label="Jobs Today" value={TH.number(mockKPI.todaysJobs)} change={8.1} sparkline={mockKPI.todaysJobsSpark} />
        <KPICard label="Completed" value={TH.number(mockKPI.completed)} change={18.2} sparkline={mockKPI.completedSpark} />
        <KPICard label="In Progress" value={TH.number(mockKPI.inProgress)} change={-2.4} sparkline={mockKPI.inProgressSpark} />
      </div>

      {/* KPI Row 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard label="Cancelled" value={TH.number(mockKPI.cancelled)} change={3.1} sparkline={mockKPI.cancelledSpark} />
        <KPICard label="Tickets" value={TH.number(mockKPI.tickets)} change={-12.5} sparkline={mockKPI.ticketsSpark} />
        <KPICard label="Disputes" value={TH.number(mockKPI.disputes)} change={8.3} sparkline={mockKPI.disputesSpark} />
        <KPICard label="Escrow Held" value={TH.currency(mockKPI.escrowHeld)} change={5.4} sparkline={mockKPI.escrowHeldSpark} />
        <KPICard label="Pending Withdraw" value={TH.currency(mockKPI.pendingWithdrawal)} change={22.1} sparkline={mockKPI.pendingWithdrawalSpark} />
      </div>

      {/* KPI Row 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard label="Conversion Rate" value={`${mockKPI.conversionRate}%`} change={-0.2} sparkline={mockKPI.conversionRateSpark} />
        <KPICard label="AOV" value={TH.currency(mockKPI.aov)} change={6.5} sparkline={mockKPI.aovSpark} />
        <KPICard label="LTV" value={TH.currency(mockKPI.ltv)} change={9.1} sparkline={mockKPI.ltvSpark} />
        <KPICard label="CAC" value={TH.currency(mockKPI.cac)} change={-3.2} sparkline={mockKPI.cacSpark} />
        <KPICard label="Retention Rate" value={`${mockKPI.retentionRate}%`} change={1.3} sparkline={mockKPI.retentionRateSpark} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[#1a1a1a] text-sm">GMV & Revenue Trend</h3>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#FFB800] inline-block rounded-full"/>GMV</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-green-500 inline-block rounded-full"/>Revenue</span>
            </div>
          </div>
          <div className="relative h-44">
            <svg viewBox="0 0 420 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB800" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#FFB800" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.1"/>
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[25, 50, 75].map(y => (
                <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="#F0F0F0" strokeWidth="0.5" />
              ))}
              <polyline
                points={chartData.map((d, i) => `${i * 60 + 30},${100 - (d.gmv / maxVal) * 80}`).join(' ')}
                fill="none" stroke="#FFB800" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              />
              <polyline
                points={chartData.map((d, i) => `${i * 60 + 30},${100 - (d.rev / maxVal) * 80}`).join(' ')}
                fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <circle key={i} cx={i * 60 + 30} cy={100 - (d.gmv / maxVal) * 80} r="3.5" fill="#FFB800" />
              ))}
            </svg>
            <div className="flex justify-between mt-2 px-2">
              {chartData.map((d, i) => (
                <span key={i} className="text-[11px] text-[#8B7355]">{d.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1a1a1a] text-sm mb-5">Jobs Summary</h3>
          <div className="flex flex-col items-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              {donut.map((seg, i) => (
                <circle key={i} cx="70" cy="70" r={radius + 4} fill="none" stroke={seg.color} strokeWidth="18" strokeDasharray={`${seg.dash * 1.2} ${seg.gap * 1.2}`} strokeDashoffset={-seg.offset * 1.2} />
              ))}
              <circle cx="70" cy="70" r="32" fill="white" />
            </svg>
            <div className="text-center -mt-4">
              <div className="text-2xl font-bold text-[#1a1a1a]">{TH.number(totalJobs)}</div>
              <div className="text-[11px] text-[#8B7355] font-medium">Total Jobs</div>
            </div>
            <div className="mt-4 space-y-2 w-full">
              {jobStats.map((j, i) => (
                <div key={i} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: j.color }} />
                    <span className="text-[#3D2C00]">{j.label}</span>
                  </span>
                  <span className="font-semibold text-[#3D2C00]">{TH.number(j.value)}</span>
                </div>
              ))}
            </div>
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
    <div className="space-y-5">
      <SectionHeader title="Buyers Management" icon="🛒" actions={<><ActionBtn label="+ เพิ่ม Buyer" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ชื่อ', 'อีเมล', 'ใช้จ่าย (฿)', 'ออเดอร์', 'Trust Score', 'KYC', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockBuyers.map((b, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                <td className="px-4 py-3 font-semibold text-xs">{b.name}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{b.email}</td>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{TH.currency(b.spend)}</td>
                <td className="px-4 py-3 text-xs">{b.orders}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={b.trustScore} color={b.trustScore >= 90 ? '#22C55E' : b.trustScore >= 70 ? '#FFB800' : '#EF4444'} /><span className="text-xs font-semibold">{b.trustScore}</span></div></td>
                <td className="px-4 py-3"><StatusBadge status={b.kyc} /></td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">🔑</button>
                    {b.status === 'active' ? <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⛔</button> : <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">✓</button>}
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
    <div className="space-y-5">
      <SectionHeader title="Sellers Management" icon="🛠️" actions={<><ActionBtn label="+ เพิ่ม Seller" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ชื่อ', 'สกิล', 'รายได้ (฿)', 'ถอนแล้ว (฿)', 'Rating', 'Response', 'Completion', 'On-Time', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSellers.map((s, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{s.skill}</td>
                <td className="px-4 py-3 font-semibold text-[#3D2C00]">{TH.currency(s.income)}</td>
                <td className="px-4 py-3 text-[#8B7355]">{TH.currency(s.withdrawn)}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1"><span className="text-yellow-500">⭐</span><span className="font-bold">{s.rating}</span></div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={s.responseRate} color={s.responseRate >= 95 ? '#22C55E' : '#FFB800'} /><span className="text-xs font-semibold">{s.responseRate}%</span></div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={s.completionRate} color={s.completionRate >= 90 ? '#22C55E' : '#FFB800'} /><span className="text-xs font-semibold">{s.completionRate}%</span></div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={s.onTime} color={s.onTime >= 90 ? '#22C55E' : '#FFB800'} /><span className="text-xs font-semibold">{s.onTime}%</span></div></td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">💰</button>
                    {s.status !== 'suspended' ? <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⛔</button> : <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">✓</button>}
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
    <div className="space-y-5">
      <SectionHeader title="Job Management" icon="📋" actions={<><ActionBtn label="+ สร้างงาน" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="flex items-center gap-3 flex-wrap">
        <TabPills tabs={tabs} active={tab} onChange={setTab} />
        <input type="text" placeholder="🔍 ค้นหางาน..." className="form-input flex-1 min-w-[200px]" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ชื่องาน', 'ผู้ว่าจ้าง', 'ช่าง', 'ราคา (฿)', 'สถานะ', 'Timeline', 'สร้างเมื่อ', 'แชท', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockJobs.map((j, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{j.id}</td>
                <td className="px-4 py-3 font-semibold text-xs max-w-[180px] truncate">{j.title}</td>
                <td className="px-4 py-3 text-xs">{j.owner}</td>
                <td className="px-4 py-3 text-xs">{j.freelancer}</td>
                <td className="px-4 py-3 font-semibold text-[#3D2C00]">{TH.currency(j.price)}</td>
                <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{j.timeline}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{j.created}</td>
                <td className="px-4 py-3">{j.chat ? <span className="text-green-500 font-bold">💬</span> : <span className="text-gray-300">-</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">✏️</button>
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
    <div className="space-y-5">
      <SectionHeader title="Order Management" icon="🧾" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="+ สร้างออเดอร์" variant="primary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ลูกค้า', 'บริการ', 'มูลค่า (฿)', 'ภาษี (฿)', 'ค่าคอม (฿)', 'ใบเสร็จ', 'Escrow', 'สถานะ', 'วันที่'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                <td className="px-4 py-3 font-semibold text-xs">{o.customer}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355] max-w-[160px] truncate">{o.service}</td>
                <td className="px-4 py-3 font-bold text-xs text-[#3D2C00]">{TH.currency(o.amount)}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{TH.currency(o.tax)}</td>
                <td className="px-4 py-3 text-[#FFB800] font-semibold">{TH.currency(o.commission)}</td>
                <td className="px-4 py-3 font-mono text-xs">{o.receipt}</td>
                <td className="px-4 py-3"><StatusBadge status={o.escrow} /></td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{o.date}</td>
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
    <div className="space-y-5">
      <SectionHeader title="Escrow Management" icon="🔒" actions={<><ActionBtn label="📤 Export Log" variant="secondary" size="sm" /><ActionBtn label="+ ปล่อย Escrow" variant="primary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Escrow Held" value={TH.currency(5840000)} change={5.4} />
        <KPICard label="Released (วันนี้)" value={TH.currency(8500)} change={-12.0} />
        <KPICard label="Pending Release" value={TH.currency(6200)} change={8.2} />
        <KPICard label="Problem Funds" value={TH.currency(35000)} change={22.1} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'Order', 'มูลค่า (฿)', 'สถานะ', 'วันที่ถือ', 'วันปล่อย', 'เหตุผล', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockEscrow.map((e, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{e.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{e.order}</td>
                <td className="px-4 py-3 font-bold text-xs text-[#3D2C00]">{TH.currency(e.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{e.heldAt}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{e.releasedAt}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{e.reason}</td>
                <td className="px-4 py-3">
                  {e.status === 'held' && <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">ปล่อย</button>}
                  {e.status === 'problem' && <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">แก้ไข</button>}
                  {e.status === 'pending_release' && <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">รอ...</button>}
                  {e.status === 'released' && <span className="text-xs text-[#8B7355]">-</span>}
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
    <div className="space-y-5">
      <SectionHeader title="Withdrawal Management" icon="🏧" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="⚙️ ตั้งค่าค่าธรรมเนียม" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="รอดำเนินการ" value={TH.currency(80000)} change={8} />
        <KPICard label="อนุมัติแล้ว (วันนี้)" value={TH.currency(50000 + 15000 + 25000)} change={12} />
        <KPICard label="ปฏิเสธ (วันนี้)" value={TH.currency(5000)} change={0} />
        <KPICard label="ค่าธรรมเนียมรวม" value={TH.currency(65)} change={3} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ผู้ขาย', 'ธนาคาร', 'เลขบัญชี', 'จำนวน (฿)', 'ค่าธรรมเนียม (฿)', 'วิธี', 'สถานะ', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockWithdrawals.map((w, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{w.id}</td>
                <td className="px-4 py-3 font-semibold text-xs">{w.seller}</td>
                <td className="px-4 py-3 text-xs">{w.bank}</td>
                <td className="px-4 py-3 font-mono text-xs">{w.account}</td>
                <td className="px-4 py-3 font-bold text-[#3D2C00]">{TH.currency(w.amount)}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{TH.currency(w.fee)}</td>
                <td className="px-4 py-3 text-xs"><StatusBadge status={w.method} /></td>
                <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{w.date}</td>
                <td className="px-4 py-3">
                  {w.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">✓</button>
                      <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">✗</button>
                    </div>
                  )}
                  {w.status !== 'pending' && <span className="text-xs text-[#8B7355]">-</span>}
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
    <div className="space-y-5">
      <SectionHeader title="Payment Management" icon="💳" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="+ ทดสอบ Payment" variant="primary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Success (วันนี้)" value={TH.currency(8500 + 12000 + 2500 + 15000)} change={8.2} />
        <KPICard label="Failed (วันนี้)" value={TH.currency(6200)} change={1} />
        <KPICard label="Chargeback" value={TH.currency(4800)} change={0} />
        <KPICard label="Pending" value={TH.currency(35000)} change={12} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ประเภท', 'มูลค่า (฿)', 'สถานะ', 'Gateway', 'Card/Account', 'วันที่', 'รายละเอียด'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((p, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3 text-xs font-semibold">{p.type.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-bold text-xs text-[#3D2C00]">{TH.currency(p.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs">{p.gateway}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.card}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{p.date}</td>
                <td className="px-4 py-3 text-xs text-red-500">{p.error || '-'}</td>
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
    <div className="space-y-5">
      <SectionHeader title="Promotion Management" icon="🎟️" actions={<><ActionBtn label="+ สร้างโปรโมชัน" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Promotions" value="4" change={0} />
        <KPICard label="Total Usage (วันนี้)" value="7,650" change={22.4} />
        <KPICard label="Budget Spent (เดือน)" value={TH.currency(32000)} change={64} />
        <KPICard label="Expired" value="1" change={0} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ประเภท', 'ชื่อ/Code', 'ส่วนลด', 'ใช้ไป/จำกัด', 'Status', 'หมดอายุ', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPromotions.map((p, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3"><StatusBadge status={p.type} /></td>
                <td className="px-4 py-3 font-semibold text-xs">{p.code || p.name}</td>
                <td className="px-4 py-3 font-bold text-[#FFB800]">{p.discount || p.bonus || p.cashback}</td>
                <td className="px-4 py-3 text-xs">{p.usage}{p.limit ? `/${p.limit}` : ''}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{p.exp}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⛔</button>
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
    <div className="space-y-5">
      <SectionHeader title="Notification Center" icon="📢" />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">📤 ส่งการแจ้งเตือน</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#8B7355] mb-1">ช่องทาง</label>
              <div className="flex gap-2 flex-wrap">
                {channels.map(ch => (
                  <label key={ch} className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="checkbox" className="accent-[#FFB800]" defaultChecked={ch === 'Email'} />
                    <span>{channelIcons[ch]} {ch}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B7355] mb-1">กลุ่มเป้าหมาย</label>
              <select className="form-input">
                <option>ทุกผู้ใช้</option>
                <option>เฉพาะ Seller</option>
                <option>เฉพาะ Buyer</option>
                <option>ผู้ใช้ที่เลือก</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B7355] mb-1">หัวข้อ</label>
              <input type="text" className="form-input" placeholder="แจ้งเตือน: ระบบบำรุงรักษา" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B7355] mb-1">เนื้อหา</label>
              <textarea className="form-input" rows={4} placeholder="พิมพ์ข้อความที่นี่..." />
            </div>
            <button className="btn-primary w-auto px-6">📤 ส่งการแจ้งเตือน</button>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">📋 ประวัติการส่งล่าสุด</h3>
          <div className="space-y-5">
            {[
              { ch: '📧', title: 'แจ้งเตือนเตือนรีวิว', target: '342 คน', status: 'sent', time: '2 ชม. ที่แล้ว' },
              { ch: '📱', title: 'SMS ยืนยันการชำระ', target: '28 คน', status: 'sent', time: '4 ชม. ที่แล้ว' },
              { ch: '🔔', title: 'Push: งานใหม่', target: '1,240 คน', status: 'sent', time: '6 ชม. ที่แล้ว' },
              { ch: '📢', title: 'Broadcast: แคมเปญวันเสาร์', target: '8,420 คน', status: 'sent', time: '1 วันที่แล้ว' },
              { ch: '📧', title: 'Email: สรุปรายเดือน', target: '2,180 คน', status: 'failed', time: '1 วันที่แล้ว' },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{n.ch}</span>
                  <div>
                    <div className="font-semibold text-sm text-[#3D2C00]">{n.title}</div>
                    <div className="text-xs text-[#8B7355]">{n.target}</div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={n.status} />
                  <div className="text-xs text-[#8B7355] mt-1">{n.time}</div>
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
    <div className="space-y-5">
      <SectionHeader title="Support Center" icon="🎧" actions={<><ActionBtn label="+ สร้าง Ticket" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Open" value="2" change={0} />
        <KPICard label="Pending" value="2" change={1} />
        <KPICard label="Closed (วันนี้)" value="1" change={-3} />
        <KPICard label="SLA Breach" value="0" change={0} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'หัวข้อ', 'ผู้ใช้', 'ประเภท', 'Priority', 'มอบหมาย', 'สถานะ', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((t, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                <td className="px-4 py-3 font-semibold text-xs">{t.subject}</td>
                <td className="px-4 py-3 text-xs">{t.user}</td>
                <td className="px-4 py-3"><StatusBadge status={t.type} /></td>
                <td className="px-4 py-3"><StatusBadge status={t.priority} /></td>
                <td className="px-4 py-3 text-xs">{t.assigned}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{t.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">✓</button>
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
    <div className="space-y-5">
      <SectionHeader title="Review Management" icon="⭐" actions={<><ActionBtn label="🤖 AI Detection" variant="secondary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Reviews" value="38,420" change={12.4} />
        <KPICard label="Suspicious (AI)" value="3" change={0} />
        <KPICard label="Hidden" value="2" change={0} />
        <KPICard label="Avg Rating" value="4.7" change={0.1} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'จาก', 'ถึง', 'งาน', 'Rating', 'Comment', 'AI Score', 'Status', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockReviews.map((r, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 text-xs">{r.from}</td>
                <td className="px-4 py-3 text-xs">{r.to}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{r.job}</td>
                <td className="px-4 py-3"><div className="flex text-yellow-400 text-xs">{Array.from({ length: r.rating }).map((_, j) => '⭐').join('')}</div></td>
                <td className="px-4 py-3 text-xs text-[#8B7355] max-w-[200px] truncate">{r.comment}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={r.fakeScore * 100} max={100} color={r.fakeScore > 0.7 ? '#EF4444' : r.fakeScore > 0.3 ? '#FFB800' : '#22C55E'} /><span className="text-xs font-semibold">{r.fakeScore}</span></div></td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{r.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {r.status === 'visible' && <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">🙈</button>}
                    {r.status === 'reported' && <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">🔍</button>}
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 font-semibold">✓</button>
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
    <div className="space-y-5">
      <SectionHeader title="Content Management (CMS)" icon="📄" actions={<><ActionBtn label="+ สร้างเนื้อหา" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ประเภท', 'ชื่อเรื่อง', 'เนื้อหา', 'Status', 'อัปเดต', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCMS.map((c, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3"><StatusBadge status={c.type} /></td>
                <td className="px-4 py-3 font-semibold text-xs">{c.title}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355] max-w-[200px] truncate">{c.content}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{c.updated}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">🗑️</button>
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
    <div className="space-y-5">
      <SectionHeader title="Category Management" icon="🏷️" actions={<><ActionBtn label="+ สร้าง Category" variant="primary" size="sm" /><ActionBtn label="+ สร้าง Tag" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ไอคอน', 'ชื่อ Category', 'Tags', 'Skills', 'Jobs', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCategories.map((c, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 text-xl">{c.icon}</td>
                <td className="px-4 py-3 font-bold text-xs text-[#3D2C00]">{c.name}</td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{c.tags.slice(0, 2).map(t => <span key={t} className="text-xs bg-[#FFF0B3] text-[#8B6914] px-2 py-0.5 rounded-full">{t}</span>)}</div></td>
                <td className="px-4 py-3 font-semibold text-xs">{TH.number(c.skills)}</td>
                <td className="px-4 py-3 font-semibold text-xs">{TH.number(c.jobs)}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 font-semibold">📋</button>
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
    <div className="space-y-5">
      <SectionHeader title="Search Management" icon="🔍" actions={<><ActionBtn label="+ เพิ่ม Keyword" variant="primary" size="sm" /><ActionBtn label="🔄 Sync Search Index" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['Keyword', 'การค้นหา/วัน', 'ผลลัพธ์', 'CTR', 'แนวโน้ม', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSearchKeywords.map((k, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{k.keyword}</td>
                <td className="px-4 py-3 font-semibold text-xs">{TH.number(k.searches)}</td>
                <td className="px-4 py-3 text-xs">{k.results}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><MiniBar value={k.ctr} color={k.ctr >= 60 ? '#22C55E' : '#FFB800'} /><span className="text-xs font-semibold">{k.ctr}%</span></div></td>
                <td className="px-4 py-3">
                  {k.trending === 'up' && <span className="text-green-500 font-bold">↑</span>}
                  {k.trending === 'down' && <span className="text-red-500 font-bold">↓</span>}
                  {k.trending === 'stable' && <span className="text-gray-400 font-bold">→</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">🚫</button>
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
    <div className="space-y-5">
      <SectionHeader title="Analytics" icon="📈" actions={<><DateRangePicker /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
        {mockAnalytics.map((a, i) => (
          <KPICard key={i} label={a.label} value={`${typeof a.value === 'number' && a.value > 1000 ? TH.currency(a.value) : a.value}${a.suffix || ''}`} change={a.change} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">👥 User Growth</h3>
          <div className="space-y-5">
            {[{ label: 'DAU', val: 8420 }, { label: 'WAU', val: 32100 }, { label: 'MAU', val: 98400 }].map((u, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-[#3D2C00]">{u.label}: {TH.number(u.val)}</span>
                  <span className="text-green-500 text-xs font-bold">+{mockAnalytics[i]?.change}%</span>
                </div>
                <MiniBar value={(u.val / 100000) * 100} color="#FFB800" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">💰 Revenue Mix</h3>
          <div className="space-y-5">
            {[{ label: 'GMV', val: 48200000, color: '#FFB800' }, { label: 'Revenue', val: 4820000, color: '#E5A500' }, { label: 'Commission', val: 964000, color: '#8B6914' }, { label: 'Profit', val: 3200000, color: '#22C55E' }].map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-[#3D2C00]">{r.label}</span>
                  <span className="font-bold text-[#3D2C00]">{TH.currency(r.val)}</span>
                </div>
                <MiniBar value={(r.val / 50000000) * 100} color={r.color} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">🔄 Conversion Funnel</h3>
          <div className="space-y-2">
            {[['เข้าชม', 12400, '#FFB800'], ['สนใจ', 8200, '#FFE066'], ['ติดต่อ', 3400, '#F0C040'], ['จ้างงาน', 1240, '#22C55E']].map(([label, val, color], i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-16 text-[#8B7355]">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5">
                  <div className="h-5 rounded-full flex items-center justify-end pr-2" style={{ width: `${(Number(val) / 12400) * 100}%`, background: color as string }}>
                    <span className="text-xs font-bold text-[#3D2C00]">{TH.number(Number(val))}</span>
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
  const severityColor: Record<string, string> = { high: 'bg-red-100 text-red-600', medium: 'bg-orange-100 text-orange-600', low: 'bg-yellow-100 text-yellow-700' };
  return (
    <div className="space-y-5">
      <SectionHeader title="Fraud Detection" icon="🚨" actions={<><ActionBtn label="🤖 AI Settings" variant="secondary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Alerts (วันนี้)" value="7" change={2} />
        <KPICard label="High Severity" value="2" change={1} />
        <KPICard label="Banned (วันนี้)" value="1" change={0} />
        <KPICard label="False Positive Rate" value="4.2%" change={-0.8} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ประเภท', 'ระดับ', 'ผู้ใช้', 'รายละเอียด', 'สถานะ', 'วันที่', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockFraudAlerts.map((f, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{f.id}</td>
                <td className="px-4 py-3 text-xs font-semibold">{f.type.replace('_', ' ')}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${severityColor[f.severity]}`}>{f.severity.toUpperCase()}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{f.user}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355] max-w-[200px]">{f.detail}</td>
                <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{f.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {f.status === 'investigating' && <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⛔</button>}
                    {f.status === 'flagged' && <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">🔍</button>}
                    <button className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 font-semibold">✓</button>
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
    <div className="space-y-5">
      <SectionHeader title="AI Monitor" icon="🤖" actions={<><ActionBtn label="⚙️ AI Settings" variant="secondary" size="sm" /><ActionBtn label="📤 Report" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {mockAIMonitor.map((a, i) => (
          <KPICard key={i} label={a.metric} value={`${typeof a.value === 'number' && a.value > 1000 ? TH.number(a.value) : a.value}${a.unit}`} change={a.change} />
        ))}
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">🎯 Matching Accuracy Trend (7 วัน)</h3>
          <div className="flex items-end gap-2 h-32">
            {[91.2, 92.5, 93.1, 92.8, 94.0, 93.7, 94.2].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg flex items-end" style={{ height: `${v * 1.05}px`, background: i === 6 ? '#FFB800' : '#FFF0B3' }}>
                  <div className="w-full rounded-t-lg" style={{ height: `${v}px`, background: i === 6 ? '#FFB800' : '#FFF0B3' }} />
                </div>
                <span className="text-xs text-[#8B7355]">วัน {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-sm font-semibold text-[#3D2C00]">Current: <span className="text-[#FFB800]">94.2%</span> ↑ +0.8%</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">💬 Chat Usage (7 วัน)</h3>
          <div className="flex items-end gap-2 h-32">
            {[38200, 41000, 39500, 44200, 46800, 45200, 48200].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${(v / 50000) * 128}px`, background: i === 6 ? '#FFB800' : '#FFF0B3' }} />
                <span className="text-xs text-[#8B7355]">วัน {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-sm font-semibold text-[#3D2C00]">Today: <span className="text-[#FFB800]">48,200</span> ↑ +15.3%</div>
        </div>
      </div>
    </div>
  );
}

function Section_19_Marketing() {
  const [tab, setTab] = useState('All Channels');
  const tabs = ['All Channels', 'Google Ads', 'Facebook Ads', 'TikTok Ads', 'SEO', 'Affiliate', 'Referral'];
  return (
    <div className="space-y-5">
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['Channel', 'Spend (฿)', 'Revenue (฿)', 'ROI %', 'ROAS', 'CPA (฿)', 'Conversions', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockMarketing.map((m, i) => (
              <tr key={m.channel}
                className="border-b border-[#F0E4C8] hover:bg-[#FFF8E7]/60"
              >
                <td className="px-4 py-3 font-semibold text-[#3D2C00]">{m.channel}</td>
                <td className="px-4 py-3">{TH.currency(m.spend)}</td>
                <td className="px-4 py-3 font-semibold text-[#3D2C00]">{TH.currency(m.revenue)}</td>
                <td className="px-4 py-3">
                  <span className="text-green-600 font-bold">{m.roi}%</span>
                </td>
                <td className="px-4 py-3 font-semibold text-[#3D2C00]">{m.roas.toFixed(1)}x</td>
                <td className="px-4 py-3 font-semibold text-[#3D2C00]">{TH.currency(m.cpa)}</td>
                <td className="px-4 py-3 font-semibold">{TH.number(m.conversions)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">📊</button>
                    <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">✏️</button>
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
    <div className="space-y-5">
      <SectionHeader title="Server Monitor" icon="🖥️" actions={<><ActionBtn label="🔄 Refresh" variant="secondary" size="sm" /><ActionBtn label="📤 Server Report" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KPICard label="Uptime (30 วัน)" value="99.97%" change={0.01} />
        <KPICard label="Avg CPU" value="42%" change={3} />
        <KPICard label="Avg RAM" value="68%" change={-2} />
        <KPICard label="Active Alerts" value="2" change={1} />
        <KPICard label="API Latency (ms)" value="124" change={-8} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['Resource', 'Usage', 'Status', 'Details', 'Last Checked'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockServer.map((s, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{s.resource}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MiniBar value={s.usage} max={100} color={s.usage >= 80 ? '#EF4444' : s.usage >= 60 ? '#FFB800' : '#22C55E'} />
                    <span className="text-xs font-bold">{typeof s.usage === 'number' && s.usage < 100 ? `${s.usage}%` : s.usage}{s.suffix || ''}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{s.expiry ? `หมดอายุ: ${s.expiry}` : '-'}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">2 วินาทีที่แล้ว</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">⚡ API Latency (ms)</h3>
          <div className="flex items-end gap-2 h-24">
            {[120, 135, 118, 142, 128, 115, 124].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${v * 0.6}px`, background: i === 6 ? '#FFB800' : '#FFF0B3' }} />
                <span className="text-xs text-[#8B7355]">{v}ms</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">💾 Memory Usage</h3>
          <div className="flex items-end gap-2 h-24">
            {[58, 62, 65, 61, 68, 70, 68].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${v * 0.5}px`, background: i === 6 ? '#FFB800' : '#FFF0B3' }} />
                <span className="text-xs text-[#8B7355]">{v}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">📊 Storage Breakdown</h3>
          <div className="space-y-2">
            {[{ label: 'Images', val: 42, color: '#FFB800' }, { label: 'Videos', val: 28, color: '#E5A500' }, { label: 'Documents', val: 18, color: '#8B6914' }, { label: 'Others', val: 12, color: '#F0E4C8' }].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5"><span className="text-[#8B7355]">{s.label}</span><span className="font-semibold text-[#3D2C00]">{s.val}%</span></div>
                <div className="bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${s.val}%`, background: s.color }} /></div>
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
    <div className="space-y-5">
      <SectionHeader title="Logs" icon="📜" actions={<><ActionBtn label="📤 Export" variant="secondary" size="sm" /><ActionBtn label="⚙️ Log Settings" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'Type', 'Action', 'Admin', 'Target', 'IP', 'Date & Time', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((l, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{l.id}</td>
                <td className="px-4 py-3"><StatusBadge status={l.type} /></td>
                <td className="px-4 py-3 text-xs font-semibold text-[#3D2C00]">{l.action}</td>
                <td className="px-4 py-3 text-xs">{l.admin}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{l.target}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#8B7355]">{l.ip}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{l.date}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
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
    <div className="space-y-5">
      <SectionHeader title="Security" icon="🔐" actions={<><ActionBtn label="🔄 Force Logout All" variant="danger" size="sm" /><ActionBtn label="⚙️ Security Settings" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Sessions" value="14" change={3} />
        <KPICard label="2FA Enabled" value="18/20" change={10} />
        <KPICard label="Failed Login (วันนี้)" value="8" change={-3} />
        <KPICard label="Suspicious IPs" value="2" change={1} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">👥 Active Admin Sessions</h3>
          <div className="space-y-5">
            {[
              { name: 'สุรชัย ใจดี', email: 'surachai@beefix.com', device: 'Chrome / macOS', ip: '1.46.234.18', location: 'Bangkok, TH', time: '2 ชม. ที่แล้ว', current: true },
              { name: 'ณิชารีย์ เจริญ', email: 'nitcharee@beefix.com', device: 'Safari / iOS', ip: '49.228.17.93', location: 'Chiang Mai, TH', time: '5 ชม. ที่แล้ว', current: false },
              { name: 'วิชัย เกษตรวิสุทธิ์', email: 'vichai@beefix.com', device: 'Firefox / Windows', ip: '203.150.82.41', location: 'Phuket, TH', time: '1 ชม. ที่แล้ว', current: false },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-[#FFF8E7] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <div>
                      <div className="font-semibold text-sm text-[#3D2C00]">{s.name}</div>
                      <div className="text-xs text-[#8B7355]">{s.email}</div>
                    </div>
                  </div>
                  {s.current && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Current</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8B7355]">
                  <span>📱 {s.device}</span>
                  <span>🌐 {s.ip}</span>
                  <span>📍 {s.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#8B7355]">{s.time}</span>
                  {!s.current && <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⛔ Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">🔑 API Key Management</h3>
          <div className="space-y-5">
            {[
              { name: 'Beefix iOS App', key: 'bfx_live_************k92m', perms: 'Read, Write', calls: '4.8M', status: 'active' },
              { name: 'Stripe Webhook', key: 'bfx_live_************w38x', perms: 'Read', calls: '892K', status: 'active' },
              { name: 'Test Environment', key: 'bfx_test_************4h28', perms: 'Read, Write', calls: '42K', status: 'inactive' },
            ].map((k, i) => (
              <div key={i} className="p-3 bg-[#FFF8E7] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#3D2C00]">{k.name}</span>
                  <StatusBadge status={k.status} />
                </div>
                <div className="font-mono text-xs text-[#8B7355] mb-1">{k.key}</div>
                <div className="flex items-center gap-3 text-xs text-[#8B7355]">
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
    <div className="space-y-5">
      <SectionHeader title="Admin Management" icon="👔" actions={<><ActionBtn label="+ เพิ่ม Admin" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Admins" value="5" change={0} />
        <KPICard label="Active Sessions" value="4" change={1} />
        <KPICard label="Last 24h Login" value="4" change={-1} />
        <KPICard label="Departments" value="4" change={0} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['ID', 'ชื่อ', 'อีเมล', 'Role', 'แผนก', 'Sessions', 'สถานะ', 'เข้าล่าสุด', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAdmins.map((a, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{a.name}</td>
                <td className="px-4 py-3 text-xs">{a.email}</td>
                <td className="px-4 py-3"><StatusBadge status={a.role} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{a.department}</td>
                <td className="px-4 py-3"><span className="font-bold text-xs text-[#3D2C00]">{a.sessions}</span></td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{a.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    {a.status === 'active' ? <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⛔</button> : <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold">✓</button>}
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
    <div className="space-y-5">
      <SectionHeader title="File Management" icon="📁" actions={<><ActionBtn label="🧹 Find Duplicates" variant="secondary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Total Files" value="184,420" change={128} />
        <KPICard label="Total Storage" value="230.5 GB" change={2.4} />
        <KPICard label="Images" value="8.2 GB" change={0.8} />
        <KPICard label="Videos" value="220 GB" change={1.6} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['File Name', 'Type', 'Size', 'Owner', 'Uploads', 'Storage', 'Status', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockFiles.map((f, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00] max-w-[180px] truncate">{f.name}</td>
                <td className="px-4 py-3"><StatusBadge status={f.type} /></td>
                <td className="px-4 py-3 font-semibold text-xs">{f.size}</td>
                <td className="px-4 py-3 text-xs">{f.owner}</td>
                <td className="px-4 py-3 text-xs">{TH.number(f.uploads)}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{f.storage}</td>
                <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">👁️</button>
                    <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">🗑️</button>
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
    <div className="space-y-5">
      <SectionHeader title="API Management" icon="🔌" actions={<><ActionBtn label="+ สร้าง API Key" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Keys" value="5" change={0} />
        <KPICard label="Total Calls (วันนี้)" value="13.4M" change={8.2} />
        <KPICard label="Avg Latency" value="42ms" change={-5} />
        <KPICard label="Error Rate" value="0.12%" change={-0.03} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['Name', 'API Key', 'Permissions', 'Rate Limit', 'Total Calls', 'Last Used', 'Status', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAPIKeys.map((k, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{k.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#8B7355]">{k.key}</td>
                <td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{k.permissions.map(p => <span key={p} className="text-xs bg-[#FFF0B3] text-[#8B6914] px-1.5 py-0.5 rounded">{p}</span>)}</div></td>
                <td className="px-4 py-3 text-xs">{k.rateLimit}</td>
                <td className="px-4 py-3 font-semibold text-xs">{TH.number(k.calls)}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{k.lastUsed}</td>
                <td className="px-4 py-3"><StatusBadge status={k.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">🔄</button>
                    <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">🗑️</button>
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
    <div className="space-y-5">
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['วันที่', 'GMV (฿)', 'Revenue (฿)', 'Commission (฿)', 'VAT (฿)', 'Cost (฿)', 'Profit (฿)'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockFinancialReports.map((r, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{r.period}</td>
                <td className="px-4 py-3 font-semibold text-xs">{TH.currency(r.gmv)}</td>
                <td className="px-4 py-3 text-xs">{TH.currency(r.revenue)}</td>
                <td className="px-4 py-3 text-[#FFB800] font-semibold">{TH.currency(r.commission)}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{TH.currency(r.vat)}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{TH.currency(r.cost)}</td>
                <td className="px-4 py-3 font-bold text-green-600 text-xs">{TH.currency(r.profit)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[#FFB800] bg-[#FFF8E7] font-bold">
              <td className="px-4 py-3 text-xs text-[#3D2C00]">รวม</td>
              <td className="px-4 py-3 text-xs text-[#3D2C00]">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.gmv, 0))}</td>
              <td className="px-4 py-3 text-xs text-[#3D2C00]">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.revenue, 0))}</td>
              <td className="px-4 py-3 text-xs text-[#FFB800]">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.commission, 0))}</td>
              <td className="px-4 py-3 text-xs text-[#3D2C00]">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.vat, 0))}</td>
              <td className="px-4 py-3 text-xs text-[#3D2C00]">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.cost, 0))}</td>
              <td className="px-4 py-3 text-green-600 text-xs">{TH.currency(mockFinancialReports.reduce((a, b) => a + b.profit, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">💵 P&L Breakdown</h3>
          <div className="space-y-5">
            {[
              { label: 'Revenue', val: 482000, color: '#FFB800' },
              { label: 'Commission', val: 96400, color: '#E5A500' },
              { label: 'VAT', val: 33600, color: '#8B6914' },
              { label: 'Operating Cost', val: 146000, color: '#EF4444' },
              { label: 'Net Profit', val: 239600, color: '#22C55E' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#8B7355]">{item.label}</span>
                  <span className="font-bold text-[#3D2C00]">{TH.currency(item.val)}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${(item.val / 500000) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#3D2C00] mb-3">📊 Cash Flow</h3>
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
                  <div className="w-full rounded-t-sm" style={{ height: `${m.in * 15}px`, background: '#22C55E' }} />
                  <div className="w-full rounded-t-sm" style={{ height: `${m.out * 15}px`, background: '#EF4444' }} />
                </div>
                <span className="text-xs text-[#8B7355] mt-1">{m.label}</span>
                <div className="flex gap-0.5 mt-0.5">
                  <div className="w-3 h-2 rounded-sm bg-green-500" />
                  <div className="w-3 h-2 rounded-sm bg-red-400" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#8B7355]">
            <span className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-green-500" /> Inflow</span>
            <span className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm bg-red-400" /> Outflow</span>
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
    <div className="space-y-5">
      <SectionHeader title="Automation" icon="⚡" actions={<><ActionBtn label="+ สร้าง Automation" variant="primary" size="sm" /><ActionBtn label="📤 Export" variant="secondary" size="sm" /></>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard label="Active Automations" value="7" change={0} />
        <KPICard label="Avg Success Rate" value="95.3%" change={0.8} />
        <KPICard label="Runs Today" value="1,847" change={12.4} />
        <KPICard label="Failed (วันนี้)" value="3" change={-2} />
      </div>
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              {['Name', 'Trigger', 'Schedule', 'Last Run', 'Success Rate', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#8B7355] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAutomations.map((a, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-semibold text-xs text-[#3D2C00]">{a.name}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355] max-w-[160px] truncate">{a.trigger}</td>
                <td className="px-4 py-3 text-xs"><StatusBadge status={a.schedule} /></td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{a.lastRun}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MiniBar value={a.successRate} max={100} color={a.successRate >= 95 ? '#22C55E' : a.successRate >= 85 ? '#FFB800' : '#EF4444'} />
                    <span className="text-xs font-bold text-[#3D2C00]">{a.successRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">✏️</button>
                    <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">▶️</button>
                    <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-semibold">⏸️</button>
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
    <div className="space-y-5">
      <SectionHeader title="Settings" icon="⚙️" actions={<><ActionBtn label="💾 Save All" variant="primary" size="sm" /><ActionBtn label="🔄 Reset" variant="secondary" size="sm" /></>} />
      <TabPills tabs={tabs} active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-5">
          <h3 className="font-bold text-[#3D2C00]">🌐 General Settings</h3>
          <div>
            <label className="block text-xs font-semibold text-[#8B7355] mb-1">Site Name</label>
            <input type="text" className="form-input" defaultValue="Beefix" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8B7355] mb-1">Site URL</label>
            <input type="text" className="form-input" defaultValue="https://beefix.co.th" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8B7355] mb-1">Support Email</label>
            <input type="text" className="form-input" defaultValue="support@beefix.co.th" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8B7355] mb-1">Default Language</label>
            <select className="form-input" defaultValue="th">
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8B7355] mb-1">Default Currency</label>
            <select className="form-input" defaultValue="THB">
              <option value="THB">THB (บาท)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8B7355] mb-1">Tax Rate (%)</label>
            <input type="number" className="form-input" defaultValue="7" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-5">
          <h3 className="font-bold text-[#3D2C00]">💳 Payment Gateway</h3>
          <div className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-semibold text-sm">Stripe</div>
                <div className="text-xs text-green-500">● Connected</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">Configure</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-semibold text-sm">PromptPay / SCB QR</div>
                <div className="text-xs text-green-500">● Connected</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">Configure</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏦</span>
              <div>
                <div className="font-semibold text-sm">Bank Transfer (Manual)</div>
                <div className="text-xs text-yellow-600">● Pending Setup</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 font-semibold">Setup</button>
          </div>
          <h3 className="font-bold text-[#3D2C00] pt-4">☁️ Cloud Storage</h3>
          <div className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-semibold text-sm">AWS S3</div>
                <div className="text-xs text-green-500">● Connected (230.5 GB used)</div>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">Settings</button>
          </div>
          <h3 className="font-bold text-[#3D2C00] pt-4">🔧 Maintenance Mode</h3>
          <div className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">
            <div>
              <div className="font-semibold text-sm">Maintenance Mode</div>
              <div className="text-xs text-red-500">ปิดปรับปรุงระบบ</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFB800]"></div>
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
    <div className="space-y-5">
      <SectionHeader title="Dashboard Widgets" icon="🧩" actions={<><ActionBtn label="🔄 Reset to Default" variant="secondary" size="sm" /><ActionBtn label="💾 Save Layout" variant="primary" size="sm" /></>} />
      <p className="text-sm text-[#8B7355]">คลิกเพื่อเปิด/ปิด widget — ลากเพื่อจัดเรียงใหม่ (drag-to-reorder)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {widgets.map(w => (
          <div
            key={w.id}
            onClick={() => toggle(w.id)}
            className={`cursor-pointer rounded-2xl p-4 border transition-all ${w.enabled ? 'bg-white border-[#F0E4C8] shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-60'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${w.enabled ? 'bg-[#FFF0B3]' : 'bg-gray-200'}`}>
                {{
                  w1: '💰', w2: '👥', w3: '📋', w4: '⚠️', w5: '🏧',
                  w6: '🔔', w7: '❌', w8: '🖥️', w9: '🤖', w10: '📊',
                  w11: '🛠️', w12: '🛒', w13: '💡'
                }[w.id] || '📊'}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${w.enabled ? 'border-[#FFB800] bg-[#FFB800]' : 'border-gray-300'}`}>
                {w.enabled && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
            <div className="text-lg font-bold text-[#3D2C00]">{w.value}</div>
            <div className="text-xs text-[#8B7355] font-semibold">{w.label}</div>
            <div className={`text-xs font-bold mt-1 ${w.trend === 'up' ? 'text-green-500' : w.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
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
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar — always visible on desktop (lg+), hidden on mobile */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-[100] bg-white border-r border-gray-100 flex-col overflow-y-auto w-[220px]">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-[#FFB800] rounded-lg flex items-center justify-center text-sm shadow-sm flex-shrink-0">🐝</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[#3D2C00] text-xs truncate">Beefix Admin</div>
            <div className="text-[10px] text-[#8B7355] truncate">Control Panel</div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navGroups.map(group => (
            <div key={group.group} className="mb-1">
              <button
                onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-[#B8A882] hover:bg-[#FFF8E7] transition-colors uppercase tracking-widest"
              >
                <span>{openGroups.has(group.group) ? '▼' : '▶'}</span>
                <span>{group.group}</span>
              </button>
              {openGroups.has(group.group) && (
                <div>
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                        activeSection === item.id
                          ? 'bg-[#FFF8E7] text-[#3D2C00] border-l-[3px] border-[#FFB800] font-bold'
                          : 'text-[#8B7355] hover:bg-[#FFF8E7]'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <span className="text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        {/* Admin profile */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFB800] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">A</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#3D2C00] truncate">Admin</div>
              <div className="text-xs text-[#8B7355] truncate">superadmin@beefix.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 lg:pl-5 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFB800] rounded-lg w-8 h-8 flex items-center justify-center text-sm">🐝</div>
            <div>
              <h1 className="font-bold text-[#3D2C00] text-sm">Beefix Admin</h1>
              <p className="text-[10px] text-[#8B7355]">Panel · {new Date().toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => addToast('🔔 3 การแจ้งเตือนใหม่', 'info')} className="relative p-2 text-[#8B7355] hover:text-[#3D2C00] hover:bg-[#FFF8E7] rounded-lg transition-colors text-sm">
              🔔<span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => addToast('⚙️ การตั้งค่าถูกบันทึกแล้ว', 'success')} className="p-2 text-[#8B7355] hover:text-[#3D2C00] hover:bg-[#FFF8E7] rounded-lg transition-colors text-sm">⚙️</button>
            <button onClick={() => addToast('ออกจากระบบสำเร็จ 👋', 'warning')} className="px-3 py-1.5 bg-[#FFF8E7] text-[#3D2C00] rounded-lg text-xs font-semibold hover:bg-[#FFF0B3] transition-colors">ออก</button>
          </div>
        </header>
        {/* Page Content */}
        <div className="lg:ml-[220px] min-h-[calc(100vh-57px)]">
          <div className="p-5 lg:p-8">
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
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
