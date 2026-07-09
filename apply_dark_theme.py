#!/usr/bin/env python3
import re

filepath = '/Users/adrenaline/.openclaw/workspace/beefix-web/src/app/admin/dashboard/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original = content  # keep for debugging

# ─── 1. Page background ────────────────────────────────────────────────────────
content = content.replace(
    'min-h-screen bg-[#FFF8E7]',
    'min-h-screen bg-[#1a1d2e]'
)

# ─── 2. Sidebar ────────────────────────────────────────────────────────────────
old_aside = '''<aside className="w-[220px] flex-shrink-0 bg-white border-r border-[#F0E4C8] flex flex-col overflow-y-auto hidden lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-[#F0E4C8]">
          <div className="w-8 h-8 bg-[#FFB800] rounded-lg flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            🐝
          </div>
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
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#8B7355] hover:bg-[#FFF8E7] transition-colors"
              >                <span>{openGroups.has(group.group) ? '▼' : '▶'}</span>
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
                          ? 'bg-[#FFF0B3] text-[#3D2C00] border-r-4 border-[#FFB800] font-bold'
                          : 'text-[#8B7355] hover:bg-[#FFF8E7]'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Admin profile */}
        <div className="border-t border-[#F0E4C8] p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFB800] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">A</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#3D2C00] truncate">Admin</div>
                <div className="text-xs text-[#8B7355] truncate">superadmin@beefix.com</div>
              </div>
          </div>
        </div>
      </aside>'''

new_aside = '''<aside className="w-[240px] flex-shrink-0 bg-[#15172a] border-r border-[#2a2f4a] flex flex-col overflow-y-auto">
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
</aside>'''

content = content.replace(old_aside, new_aside)

# ─── 3. Header ─────────────────────────────────────────────────────────────────
old_header = '''<header className="sticky top-0 z-40 bg-white border-b border-[#F0E4C8] px-4 py-2.5 flex items-center justify-between shadow-sm gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFB800] rounded-lg w-8 h-8 flex items-center justify-center text-sm">🐝</div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-[#3D2C00] text-sm">Beefix Admin</h1>
              <p className="text-[10px] text-[#8B7355]">Panel · {new Date().toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => addToast('🔔 3 การแจ้งเตือนใหม่', 'info')} className="relative p-2 text-[#8B7355] hover:text-[#3D2C00] hover:bg-[#FFF8E7] rounded-lg transition-colors text-sm">
              🔔<span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => addToast('⚙️ การตั้งค่าถูกบันทึกแล้ว', 'success')} className="p-2 text-[#8B7355] hover:text-[#3D2C00] hover:bg-[#FFF8E7] rounded-lg transition-colors text-sm">⚙️</button>
            <button onClick={() => addToast('ออกจากระบบสำเร็จ 👋', 'warning')} className="px-3 py-1.5 bg-[#FFF8E7] text-[#3D2C00] rounded-lg text-xs font-semibold hover:bg-[#FFF0B3] transition-colors hidden sm:block">ออก</button>
          </div>
        </header>'''

new_header = '''<header className="sticky top-0 z-40 bg-[#1a1d2e] border-b border-[#2a2f4a] px-5 py-3 flex items-center justify-between gap-3">
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
</header>'''

content = content.replace(old_header, new_header)

# ─── 4. Page content bg ────────────────────────────────────────────────────────
content = content.replace(
    '<div className="p-5 min-h-[calc(100vh-57px)]">',
    '<div className="bg-[#1a1d2e] p-5 min-h-[calc(100vh-57px)]">'
)

# ─── 5. KPICard ────────────────────────────────────────────────────────────────
old_kpi = '''function KPICard({ label, value, change, prefix = '', suffix = '', trend }: {
  label: string; value: string | number; change?: number | string; prefix?: string; suffix?: string; trend?: 'up' | 'down' | 'neutral';
}) {
  const isUp = typeof change === 'number' ? change >= 0 : trend === 'up' || trend === 'neutral';
  const color = typeof change === 'number' ? (change >= 0 ? 'text-green-600' : 'text-red-500') : 'text-gray-500';
  const arrow = typeof change === 'number' ? (change >= 0 ? '↑' : '↓') : (trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→');
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-[#F0E4C8] hover:shadow-md transition-shadow">
      <div className="text-xs text-[#8B7355] font-medium mb-1">{label}</div>
      <div className="text-xl font-bold text-[#3D2C00]">{prefix}{typeof value === 'number' ? value.toLocaleString('th-TH') : value}{suffix}</div>
      {change !== undefined && (
        <div className={`text-xs font-semibold mt-1 ${color}`}>{arrow} {typeof change === 'number' ? `${change >= 0 ? '+' : ''}${change}${typeof change === 'number' && Math.abs(change) < 100 ? '%' : ''}` : change}</div>
      )}
    </div>
  );
}'''

new_kpi = '''function KPICard({ label, value, change, sparkline, icon }: {
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
}'''

content = content.replace(old_kpi, new_kpi)

# ─── 6. StatusBadge ───────────────────────────────────────────────────────────
old_status = '''function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
    success: { label: 'Success', className: 'bg-green-100 text-green-700' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
    published: { label: 'Published', className: 'bg-green-100 text-green-700' },
    visible: { label: 'Visible', className: 'bg-green-100 text-green-700' },
    healthy: { label: 'Healthy', className: 'bg-green-100 text-green-700' },
    in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Delivered', className: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    warning: { label: 'Warning', className: 'bg-yellow-100 text-yellow-700' },
    paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600' },
    suspended: { label: 'Suspended', className: 'bg-red-100 text-red-600' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-600' },
    error: { label: 'Error', className: 'bg-red-100 text-red-600' },
    disputed: { label: 'Disputed', className: 'bg-orange-100 text-orange-700' },
    refunded: { label: 'Refunded', className: 'bg-orange-100 text-orange-700' },
    chargeback: { label: 'Chargeback', className: 'bg-red-100 text-red-600' },
    held: { label: 'Held', className: 'bg-blue-100 text-blue-700' },
    problem: { label: 'Problem', className: 'bg-red-100 text-red-600' },
    pending_release: { label: 'Pending Release', className: 'bg-yellow-100 text-yellow-700' },
    released: { label: 'Released', className: 'bg-green-100 text-green-700' },
    open: { label: 'Open', className: 'bg-red-100 text-red-600' },
    reported: { label: 'Reported', className: 'bg-orange-100 text-orange-700' },
    hidden: { label: 'Hidden', className: 'bg-gray-100 text-gray-600' },
    banned: { label: 'Banned', className: 'bg-red-100 text-red-600' },
    flagged: { label: 'Flagged', className: 'bg-orange-100 text-orange-700' },
    investigating: { label: 'Investigating', className: 'bg-yellow-100 text-yellow-700' },
    pending_review: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-700' },
    high: { label: 'High', className: 'bg-red-100 text-red-600' },
    medium: { label: 'Medium', className: 'bg-orange-100 text-orange-700' },
    low: { label: 'Low', className: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700' },
    expired: { label: 'Expired', className: 'bg-gray-100 text-gray-600' },
    super_admin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-700' },
    finance_manager: { label: 'Finance', className: 'bg-blue-100 text-blue-700' },
    support_manager: { label: 'Support', className: 'bg-green-100 text-green-700' },
    content_manager: { label: 'Content', className: 'bg-yellow-100 text-yellow-700' },
    operations: { label: 'Operations', className: 'bg-orange-100 text-orange-700' },
  };
  const cfg = map[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>;
}'''

new_status = '''function StatusBadge({ status }: { status: string }) {
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
    approved: { label: 'Approved', className: 'bg-[#00c853]/20 text-[#00c853]' },
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
}'''

content = content.replace(old_status, new_status)

# ─── 7. SectionHeader ─────────────────────────────────────────────────────────
old_sh = '''function SectionHeader({ title, icon, actions }: { title: string; icon?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-[#3D2C00] flex items-center gap-2">
        {icon && <span>{icon}</span>}{title}
      </h2>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}'''

new_sh = '''function SectionHeader({ title, icon, actions }: { title: string; icon?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {actions}
    </div>
  );
}'''

content = content.replace(old_sh, new_sh)

# ─── 8. ActionBtn ─────────────────────────────────────────────────────────────
old_ab = '''function ActionBtn({ label, variant = 'primary', size = 'sm' }: { label: string; variant?: 'primary' | 'secondary' | 'danger'; size?: 'sm' | 'md' }) {
  const base = 'rounded-lg font-semibold cursor-pointer transition-all font-Prompt';
  const sizeCls = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const variantCls = variant === 'primary' ? 'bg-[#FFB800] text-[#3D2C00] hover:bg-[#E5A500] shadow-sm' : variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm' : 'bg-white text-[#3D2C00] border border-[#F0E4C8] hover:bg-[#FFF8E7]';
  return <button className={`${base} ${sizeCls} ${variantCls}`}>{label}</button>;
}'''

new_ab = '''function ActionBtn({ label, variant = 'secondary', size = 'md', onClick }: {
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
}'''

content = content.replace(old_ab, new_ab)

# ─── 9. TabPills ──────────────────────────────────────────────────────────────
old_tp = '''function TabPills({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 mb-4 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${active === tab ? 'bg-[#FFB800] text-[#3D2C00]' : 'bg-white text-[#8B7355] border border-[#F0E4C8] hover:bg-[#FFF8E7]'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}'''

new_tp = '''function TabPills({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
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
}'''

content = content.replace(old_tp, new_tp)

# ─── 10. DateRangePicker ───────────────────────────────────────────────────────
old_drp = '''function DateRangePicker() {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#F0E4C8] rounded-lg px-3 py-2">
      <span className="text-sm">📅</span>
      <span className="text-xs text-[#8B7355]">09 ก.ค. 2026 – 09 ก.ค. 2026</span>
      <span className="text-xs text-[#FFB800] font-semibold cursor-pointer ml-1">เปลี่ยน</span>
    </div>
  );
}'''

new_drp = '''function DateRangePicker() {
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252a40] border border-[#2a2f4a] rounded-lg text-xs text-[#8a8fa3] hover:bg-[#2a2f4a] hover:text-white transition-colors">
      📅 1 – 31 ก.ค. 2569
    </button>
  );
}'''

content = content.replace(old_drp, new_drp)

# ─── 11. DataTable ────────────────────────────────────────────────────────────
# Update the table header row from bg-[#FFF8E7] to bg-[#1e2235]
content = content.replace(
    '<tr className="bg-[#FFF8E7]">',
    '<tr className="bg-[#1e2235]">'
)
# Update alternating rows
content = content.replace(
    '${ri % 2 === 0 ? \'bg-white\' : \'bg-[#FFFDF5]\'}',
    '${ri % 2 === 0 ? \'bg-[#1e2235]\' : \'bg-[#252a40]\'}'
)
# Update row hover
content = content.replace(
    'hover:bg-[#FFF8E7]/60',
    'hover:bg-[#2a2f4a]'
)
# Update cell text colors in DataTable
content = content.replace(
    '<td className="px-4 py-3 text-sm text-[#3D2C00]">',
    '<td className="px-4 py-3 text-sm text-white">'
)

# ─── 12. Global replacements: bg-white → bg-[#252a40] in section cards ────────
# These are the card-level bg-white replacements
# Replace specific bg-white rounded patterns in section components
content = content.replace(
    'bg-white rounded-2xl shadow-sm border border-[#F0E4C8] overflow-hidden',
    'bg-[#252a40] rounded-2xl border border-[#2a2f4a] overflow-hidden'
)
content = content.replace(
    'bg-white rounded-xl p-3 shadow-sm border border-[#F0E4C8]',
    'bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a]'
)
content = content.replace(
    'bg-white rounded-xl shadow-sm border border-[#F0E4C8]',
    'bg-[#252a40] rounded-xl border border-[#2a2f4a]'
)
content = content.replace(
    'bg-white rounded-2xl shadow-sm border border-[#F0E4C8]',
    'bg-[#252a40] rounded-2xl border border-[#2a2f4a]'
)
content = content.replace(
    'bg-white rounded-xl p-3 shadow-sm border border-[#F0E4C8] space-y-3',
    'bg-[#252a40] rounded-xl p-3 border border-[#2a2f4a] space-y-3'
)

# ─── 13. Text color replacements ─────────────────────────────────────────────
# Primary text: #3D2C00 → white
content = content.replace('text-[#3D2C00]', 'text-white')
# Secondary text: #8B7355 → #8a8fa3
content = content.replace('text-[#8B7355]', 'text-[#8a8fa3]')
# Border colors
content = content.replace('border-[#F0E4C8]', 'border-[#2a2f4a]')
# Alternating row bg-[#FFFDF5]
content = content.replace("'bg-[#FFFDF5]'", "'bg-[#1e2235]'")
# Input backgrounds in form elements
content = content.replace(
    'form-input',
    'bg-[#1e2235] border border-[#2a2f4a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63]'
)

# ─── 14. MiniBar bg-gray-100 → bg-[#1e2235] ──────────────────────────────────
content = content.replace(
    "w-full bg-gray-100 rounded-full h-2",
    "w-full bg-[#1e2235] rounded-full h-2"
)
content = content.replace(
    'bg-gray-100 rounded-full h-3',
    'bg-[#1e2235] rounded-full h-3'
)
content = content.replace(
    'bg-gray-100 rounded-full h-5',
    'bg-[#1e2235] rounded-full h-5'
)
content = content.replace(
    'bg-gray-100 rounded-full h-2',
    'bg-[#1e2235] rounded-full h-2'
)
# Funnel bg-gray-100
content = content.replace(
    '<div className="flex-1 bg-gray-100 rounded-full h-5">',
    '<div className="flex-1 bg-[#1e2235] rounded-full h-5">'
)
# P&L bg-gray-100
content = content.replace(
    '<div className="bg-gray-100 rounded-full h-3">',
    '<div className="bg-[#1e2235] rounded-full h-3">'
)
content = content.replace(
    '<div className="bg-gray-100 rounded-full h-2">',
    '<div className="bg-[#1e2235] rounded-full h-2">'
)

# ─── 15. Chart colors in Executive Dashboard ──────────────────────────────────
# Revenue bar chart
content = content.replace(
    "background: i === 6 ? '#FFB800' : '#FFE066'",
    "background: i === 6 ? '#e91e63' : '#ff8c00'"
)
# GMV bar chart
content = content.replace(
    "background: i === 6 ? '#FFB800' : '#FFF0B3'",
    "background: i === 6 ? '#e91e63' : '#ff8c00'"
)

# ─── 16. Button colors (blue-50, yellow-50, etc.) ────────────────────────────
# Replace small action buttons
content = content.replace('bg-blue-50 text-blue-600', 'bg-[#2196f3]/20 text-[#2196f3]')
content = content.replace('bg-yellow-50 text-yellow-600', 'bg-[#ffc107]/20 text-[#ffc107]')
content = content.replace('bg-red-50 text-red-600', 'bg-[#ff5252]/20 text-[#ff5252]')
content = content.replace('bg-green-50 text-green-600', 'bg-[#00c853]/20 text-[#00c853]')
content = content.replace('bg-gray-100 text-gray-600', 'bg-[#2a2f4a] text-[#8a8fa3]')
content = content.replace('bg-gray-100 text-gray-200', 'bg-[#2a2f4a] text-[#8a8fa3]')
content = content.replace('bg-gray-200', 'bg-[#2a2f4a]')
content = content.replace('text-gray-300', 'text-[#5a6078]')
content = content.replace('text-gray-400', 'text-[#5a6078]')
content = content.replace('text-gray-500', 'text-[#8a8fa3]')
content = content.replace('text-green-500', 'text-[#00c853]')
content = content.replace('text-green-600', 'text-[#00c853]')
content = content.replace('text-red-500', 'text-[#ff5252]')
content = content.replace('text-yellow-500', 'text-[#ffc107]')
content = content.replace('text-yellow-400', 'text-[#ffc107]')
content = content.replace('text-orange-700', 'text-[#ffc107]')
content = content.replace('text-purple-700', 'text-[#e91e63]')
content = content.replace('text-blue-600', 'text-[#2196f3]')
content = content.replace('text-blue-700', 'text-[#2196f3]')

# Star rating color
content = content.replace('text-yellow-400', 'text-[#ffc107]')

# Badge backgrounds
content = content.replace('bg-green-100', 'bg-[#00c853]/20')
content = content.replace('bg-red-100', 'bg-[#ff5252]/20')
content = content.replace('bg-yellow-100', 'bg-[#ffc107]/20')
content = content.replace('bg-orange-100', 'bg-[#ffc107]/20')
content = content.replace('bg-purple-100', 'bg-[#e91e63]/20')
content = content.replace('bg-blue-100', 'bg-[#2196f3]/20')
content = content.replace('bg-gray-100', 'bg-[#2a2f4a]')

# Chart bar colors (inline)
content = content.replace(
    "color={b.trustScore >= 90 ? '#22C55E' : b.trustScore >= 70 ? '#FFB800' : '#EF4444'}",
    "color={b.trustScore >= 90 ? '#00c853' : b.trustScore >= 70 ? '#ffc107' : '#ff5252'}"
)
content = content.replace(
    "color={s.responseRate >= 95 ? '#22C55E' : '#FFB800'}",
    "color={s.responseRate >= 95 ? '#00c853' : '#ffc107'}"
)
content = content.replace(
    "color={s.completionRate >= 90 ? '#22C55E' : '#FFB800'}",
    "color={s.completionRate >= 90 ? '#00c853' : '#ffc107'}"
)
content = content.replace(
    "color={s.onTime >= 90 ? '#22C55E' : '#FFB800'}",
    "color={s.onTime >= 90 ? '#00c853' : '#ffc107'}"
)
content = content.replace(
    "color={r.fakeScore > 0.7 ? '#EF4444' : r.fakeScore > 0.3 ? '#FFB800' : '#22C55E'}",
    "color={r.fakeScore > 0.7 ? '#ff5252' : r.fakeScore > 0.3 ? '#ffc107' : '#00c853'}"
)
content = content.replace(
    "color={k.ctr >= 60 ? '#22C55E' : '#FFB800'}",
    "color={k.ctr >= 60 ? '#00c853' : '#ffc107'}"
)
content = content.replace(
    "color={s.usage >= 80 ? '#EF4444' : s.usage >= 60 ? '#FFB800' : '#22C55E'}",
    "color={s.usage >= 80 ? '#ff5252' : s.usage >= 60 ? '#ffc107' : '#00c853'}"
)
content = content.replace(
    "color={a.successRate >= 95 ? '#22C55E' : a.successRate >= 85 ? '#FFB800' : '#EF4444'}",
    "color={a.successRate >= 95 ? '#00c853' : a.successRate >= 85 ? '#ffc107' : '#ff5252'}"
)

# ─── 17. Chart colors in section charts ───────────────────────────────────────
# Revenue Mix chart
content = content.replace(
    "{ label: 'GMV', val: 48200000, color: '#FFB800' }, { label: 'Revenue', val: 4820000, color: '#E5A500' }, { label: 'Commission', val: 964000, color: '#8B6914' }, { label: 'Profit', val: 3200000, color: '#22C55E' }",
    "{ label: 'GMV', val: 48200000, color: '#e91e63' }, { label: 'Revenue', val: 4820000, color: '#ff8c00' }, { label: 'Commission', val: 964000, color: '#ffc107' }, { label: 'Profit', val: 3200000, color: '#00c853' }"
)
# Funnel chart
content = content.replace(
    "[['เข้าชม', 12400, '#FFB800'], ['สนใจ', 8200, '#FFE066'], ['ติดต่อ', 3400, '#F0C040'], ['จ้างงาน', 1240, '#22C55E']]",
    "[['เข้าชม', 12400, '#e91e63'], ['สนใจ', 8200, '#ff8c00'], ['ติดต่อ', 3400, '#ffc107'], ['จ้างงาน', 1240, '#00c853']]"
)
# Storage breakdown
content = content.replace(
    "[{ label: 'Images', val: 42, color: '#FFB800' }, { label: 'Videos', val: 28, color: '#E5A500' }, { label: 'Documents', val: 18, color: '#8B6914' }, { label: 'Others', val: 12, color: '#F0E4C8' }]",
    "[{ label: 'Images', val: 42, color: '#e91e63' }, { label: 'Videos', val: 28, color: '#ff8c00' }, { label: 'Documents', val: 18, color: '#ffc107' }, { label: 'Others', val: 12, color: '#5a6078' }]"
)
# P&L breakdown
content = content.replace(
    "[{ label: 'Revenue', val: 482000, color: '#FFB800' }, { label: 'Commission', val: 96400, color: '#E5A500' }, { label: 'VAT', val: 33600, color: '#8B6914' }, { label: 'Operating Cost', val: 146000, color: '#EF4444' }, { label: 'Net Profit', val: 239600, color: '#22C55E' }]",
    "[{ label: 'Revenue', val: 482000, color: '#e91e63' }, { label: 'Commission', val: 96400, color: '#ff8c00' }, { label: 'VAT', val: 33600, color: '#ffc107' }, { label: 'Operating Cost', val: 146000, color: '#ff5252' }, { label: 'Net Profit', val: 239600, color: '#00c853' }]"
)
# Cash flow
content = content.replace(
    "{ label: 'ต.ค.', in: 4.2, out: 2.1 }, { label: 'พ.ย.', in: 3.8, out: 1.9 }, { label: 'ธ.ค.', in: 5.1, out: 2.5 }, { label: 'ม.ค.', in: 4.5, out: 2.2 }, { label: 'ก.พ.', in: 4.8, out: 2.3 }, { label: 'มี.ค.', in: 5.3, out: 2.6 }",
    "{ label: 'ต.ค.', in: 4.2, out: 2.1 }, { label: 'พ.ย.', in: 3.8, out: 1.9 }, { label: 'ธ.ค.', in: 5.1, out: 2.5 }, { label: 'ม.ค.', in: 4.5, out: 2.2 }, { label: 'ก.พ.', in: 4.8, out: 2.3 }, { label: 'มี.ค.', in: 5.3, out: 2.6 }"
)
# Cash flow colors
content = content.replace(
    "background: '#22C55E' }} />\n                  <div className=\"w-full rounded-t-sm\" style={{ height: `${m.out * 15}px`, background: '#EF4444' }}",
    "background: '#00c853' }} />\n                  <div className=\"w-full rounded-t-sm\" style={{ height: `${m.out * 15}px`, background: '#ff5252' }"
)
content = content.replace(
    "<div className=\"w-3 h-2 rounded-sm bg-green-500\" />\n                  <div className=\"w-3 h-2 rounded-sm bg-red-400\" />",
    "<div className=\"w-3 h-2 rounded-sm bg-[#00c853]\" />\n                  <div className=\"w-3 h-2 rounded-sm bg-[#ff5252]\" />"
)
content = content.replace(
    "<div className=\"w-3 h-2 rounded-sm bg-green-500\" /> Inflow",
    "<div className=\"w-3 h-2 rounded-sm bg-[#00c853]\" /> Inflow"
)
content = content.replace(
    "<div className=\"w-3 h-2 rounded-sm bg-red-400\" /> Outflow",
    "<div className=\"w-3 h-2 rounded-sm bg-[#ff5252]\" /> Outflow"
)

# ─── 18. Tag badges ──────────────────────────────────────────────────────────
content = content.replace(
    'text-xs bg-[#FFF0B3] text-[#8B6914] px-2 py-0.5 rounded-full',
    'text-xs bg-[#ffc107]/20 text-[#ffc107] px-2 py-0.5 rounded-full'
)
content = content.replace(
    'text-xs bg-[#FFF0B3] text-[#8B6914] px-1.5 py-0.5 rounded',
    'text-xs bg-[#ffc107]/20 text-[#ffc107] px-1.5 py-0.5 rounded'
)

# ─── 19. Notification history items ──────────────────────────────────────────
content = content.replace(
    '<div key={i} className="flex items-center justify-between p-3 bg-[#FFF8E7] rounded-xl">',
    '<div key={i} className="flex items-center justify-between p-3 bg-[#1e2235] rounded-xl">'
)
content = content.replace(
    '<div className="font-semibold text-sm text-[#3D2C00]">{n.title}</div>',
    '<div className="font-semibold text-sm text-white">{n.title}</div>'
)

# ─── 20. Session card bg ──────────────────────────────────────────────────────
content = content.replace(
    '<div key={i} className="p-3 bg-[#FFF8E7] rounded-xl">',
    '<div key={i} className="p-3 bg-[#1e2235] rounded-xl">'
)

# ─── 21. Toggle switch ────────────────────────────────────────────────────────
content = content.replace(
    'peer-checked:bg-[#FFB800]',
    'peer-checked:bg-[#e91e63]'
)
content = content.replace(
    'w-11 h-6 bg-gray-200',
    'w-11 h-6 bg-[#2a2f4a]'
)
content = content.replace(
    'after:bg-white after:border-gray-300',
    'after:bg-white after:border-[#2a2f4a]'
)

# ─── 22. Toast notifications ─────────────────────────────────────────────────
content = content.replace(
    "toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :\n              toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :\n              toast.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :\n              'bg-blue-50 text-blue-700 border-blue-200'",
    "toast.type === 'success' ? 'bg-[#00c853]/20 text-[#00c853] border-[#00c853]/30' :\n              toast.type === 'error' ? 'bg-[#ff5252]/20 text-[#ff5252] border-[#ff5252]/30' :\n              toast.type === 'warning' ? 'bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]/30' :\n              'bg-[#2196f3]/20 text-[#2196f3] border-[#2196f3]/30'"
)

# ─── 23. Widget card ──────────────────────────────────────────────────────────
content = content.replace(
    "cursor-pointer rounded-2xl p-4 border transition-all ${w.enabled ? 'bg-white border-[#F0E4C8] shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-60'}",
    "cursor-pointer rounded-2xl p-4 border transition-all ${w.enabled ? 'bg-[#252a40] border-[#2a2f4a] hover:border-[#3a3f5a]' : 'bg-[#1e2235] border-[#2a2f4a] opacity-60'}"
)
content = content.replace(
    "w.enabled ? 'bg-[#FFF0B3]' : 'bg-gray-200'",
    "w.enabled ? 'bg-[#ffc107]/20' : 'bg-[#2a2f4a]'"
)
content = content.replace(
    "w.enabled ? 'border-[#FFB800] bg-[#FFB800]' : 'border-gray-300'",
    "w.enabled ? 'border-[#e91e63] bg-[#e91e63]' : 'border-[#2a2f4a]'"
)
content = content.replace(
    "<div className=\"text-lg font-bold text-[#3D2C00]\">{w.value}</div>",
    "<div className=\"text-lg font-bold text-white\">{w.value}</div>"
)

# ─── 24. Specific chart title text colors ────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">💰 Revenue Overview (7 วันล่าสุด)</h3>',
    '<h3 className="font-bold text-white mb-3">💰 Revenue Overview (7 วันล่าสุด)</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">📈 GMV Trend (7 วันล่าสุด)</h3>',
    '<h3 className="font-bold text-white mb-3">📈 GMV Trend (7 วันล่าสุด)</h3>'
)

# ─── 25. Section 16 Analytics chart titles ────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">👥 User Growth</h3>',
    '<h3 className="font-bold text-white mb-3">👥 User Growth</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">💰 Revenue Mix</h3>',
    '<h3 className="font-bold text-white mb-3">💰 Revenue Mix</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">🔄 Conversion Funnel</h3>',
    '<h3 className="font-bold text-white mb-3">🔄 Conversion Funnel</h3>'
)

# ─── 26. Section 18 AI chart titles ──────────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">🎯 Matching Accuracy Trend (7 วัน)</h3>',
    '<h3 className="font-bold text-white mb-3">🎯 Matching Accuracy Trend (7 วัน)</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">💬 Chat Usage (7 วัน)</h3>',
    '<h3 className="font-bold text-white mb-3">💬 Chat Usage (7 วัน)</h3>'
)
content = content.replace(
    'text-[#FFB800]">94.2%</span> ↑ +0.8%',
    'text-[#ffc107]">94.2%</span> ↑ +0.8%'
)
content = content.replace(
    'text-[#FFB800]">48,200</span> ↑ +15.3%',
    'text-[#ffc107]">48,200</span> ↑ +15.3%'
)

# ─── 27. Server Monitor chart titles ─────────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">⚡ API Latency (ms)</h3>',
    '<h3 className="font-bold text-white mb-3">⚡ API Latency (ms)</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">💾 Memory Usage</h3>',
    '<h3 className="font-bold text-white mb-3">💾 Memory Usage</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">📊 Storage Breakdown</h3>',
    '<h3 className="font-bold text-white mb-3">📊 Storage Breakdown</h3>'
)

# ─── 28. Section 26 Financial chart titles ───────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">💵 P&L Breakdown</h3>',
    '<h3 className="font-bold text-white mb-3">💵 P&L Breakdown</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">📊 Cash Flow</h3>',
    '<h3 className="font-bold text-white mb-3">📊 Cash Flow</h3>'
)

# ─── 29. Settings section ─────────────────────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00]">🌐 General Settings</h3>',
    '<h3 className="font-bold text-white">🌐 General Settings</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00]">💳 Payment Gateway</h3>',
    '<h3 className="font-bold text-white">💳 Payment Gateway</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] pt-4">☁️ Cloud Storage</h3>',
    '<h3 className="font-bold text-white pt-4">☁️ Cloud Storage</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] pt-4">🔧 Maintenance Mode</h3>',
    '<h3 className="font-bold text-white pt-4">🔧 Maintenance Mode</h3>'
)

# ─── 30. Notification send section ────────────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">📤 ส่งการแจ้งเตือน</h3>',
    '<h3 className="font-bold text-white mb-3">📤 ส่งการแจ้งเตือน</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">📋 ประวัติการส่งล่าสุด</h3>',
    '<h3 className="font-bold text-white mb-3">📋 ประวัติการส่งล่าสุด</h3>'
)

# ─── 31. Security section ──────────────────────────────────────────────────────
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">👥 Active Admin Sessions</h3>',
    '<h3 className="font-bold text-white mb-3">👥 Active Admin Sessions</h3>'
)
content = content.replace(
    '<h3 className="font-bold text-[#3D2C00] mb-3">🔑 API Key Management</h3>',
    '<h3 className="font-bold text-white mb-3">🔑 API Key Management</h3>'
)

# ─── 32. Commission text color ─────────────────────────────────────────────────
content = content.replace(
    "text-[#FFB800] font-semibold",
    "text-[#ffc107] font-semibold"
)
content = content.replace(
    "text-[#FFB800]",
    "text-[#ffc107]"
)

# ─── 33. Green text for profit ────────────────────────────────────────────────
content = content.replace(
    "text-green-600 text-xs",
    "text-[#00c853] text-xs"
)
content = content.replace(
    "text-green-600 font-bold",
    "text-[#00c853] font-bold"
)
content = content.replace(
    "text-green-600",
    "text-[#00c853]"
)

# ─── 34. Fix green-500 (lighter green for trends) ─────────────────────────────
content = content.replace(
    "text-green-500 font-bold",
    "text-[#00c853] font-bold"
)

# ─── 35. API key permission badge ─────────────────────────────────────────────
content = content.replace(
    'text-xs bg-[#FFF0B3] text-[#8B6914] px-1.5 py-0.5 rounded',
    'text-xs bg-[#ffc107]/20 text-[#ffc107] px-1.5 py-0.5 rounded'
)

# ─── 36. Trend arrow colors in search section ─────────────────────────────────
content = content.replace(
    '<span className="text-green-500 font-bold">↑</span>',
    '<span className="text-[#00c853] font-bold">↑</span>'
)
content = content.replace(
    '<span className="text-red-500 font-bold">↓</span>',
    '<span className="text-[#ff5252] font-bold">↓</span>'
)

# ─── 37. Trend in widgets ─────────────────────────────────────────────────────
content = content.replace(
    "w.trend === 'up' ? 'text-green-500' : w.trend === 'down' ? 'text-red-500' : 'text-gray-400'",
    "w.trend === 'up' ? 'text-[#00c853]' : w.trend === 'down' ? 'text-[#ff5252]' : 'text-[#5a6078]'"
)

# ─── 38. Severity badges in fraud ─────────────────────────────────────────────
content = content.replace(
    "const severityColor: Record<string, string> = { high: 'bg-red-100 text-red-600', medium: 'bg-orange-100 text-orange-600', low: 'bg-yellow-100 text-yellow-700' };",
    "const severityColor: Record<string, string> = { high: 'bg-[#ff5252]/20 text-[#ff5252]', medium: 'bg-[#ffc107]/20 text-[#ffc107]', low: 'bg-[#ffc107]/20 text-[#ffc107]' };"
)

# ─── 39. Row border colors ────────────────────────────────────────────────────
content = content.replace(
    'border-t border-[#F0E4C8]',
    'border-t border-[#2a2f4a]'
)
content = content.replace(
    'border-b border-[#F0E4C8]',
    'border-b border-[#2a2f4a]'
)
content = content.replace(
    'border-t-2 border-[#FFB800]',
    'border-t-2 border-[#e91e63]'
)

# ─── 40. Table header bg ──────────────────────────────────────────────────────
content = content.replace(
    "bg-[#FFF8E7]",
    "bg-[#1e2235]"
)

# ─── 41. Checkbox accent ──────────────────────────────────────────────────────
content = content.replace(
    'className="accent-[#FFB800]"',
    'className="accent-[#e91e63]"'
)

# ─── 42. btn-primary (used in notifications) ──────────────────────────────────
content = content.replace(
    'btn-primary w-auto px-6',
    'bg-[#e91e63] text-white hover:bg-[#c1175a] px-6 py-2 rounded-lg font-semibold transition-colors w-auto'
)

# ─── 43. Fix trend up arrow ───────────────────────────────────────────────────
content = content.replace(
    "text-[#00c853] text-xs font-bold",
    "text-[#00c853] text-xs font-bold"
)

# ─── 44. MiniBar bg-gray-100 inside table rows ────────────────────────────────
# Fix remaining bg-gray-100 occurrences
content = content.replace('bg-gray-100', 'bg-[#1e2235]')

# ─── Write result ──────────────────────────────────────────────────────────────
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Done. Original size: {len(original)}, New size: {len(content)}")
print(f"Changes applied: {len(original) - len(content)} chars diff (some additions, some removals)")
