const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      if (typeof window !== 'undefined') localStorage.setItem('token', token)
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem('token')
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
      return this.token
    }
    return null
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Request failed')
    return data
  }

  get<T>(path: string) { return this.request<T>(path) }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }
  delete<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }) }
}

export const api = new ApiClient()

// Auth
export const authApi = {
  register: (data: { email: string; phone: string; password: string; fullName: string; role?: string }) =>
    api.post<{ success: boolean; user: any; token: string }>('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; user: any; token: string }>('/api/auth/login', data),
  me: () => api.get<{ success: boolean; user: any }>('/api/auth/me'),
}

// Categories
export const categoriesApi = {
  getAll: () => api.get<{ success: boolean; categories: any[] }>('/api/categories'),
}

// Technicians
export const techniciansApi = {
  getAll: (params?: { subCategoryId?: string; page?: number }) => {
    const query = new URLSearchParams()
    if (params?.subCategoryId) query.set('subCategoryId', params.subCategoryId)
    if (params?.page) query.set('page', String(params.page))
    return api.get<{ success: boolean; technicians: any[]; pagination: any }>(`/api/technicians?${query}`)
  },
}

// Orders
export const ordersApi = {
  getAll: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    return api.get<{ success: boolean; orders: any[]; pagination: any }>(`/api/orders?${query}`)
  },
  getOne: (id: string) => api.get<{ success: boolean; order: any }>(`/api/orders/${id}`),
  create: (data: any) => api.post<{ success: boolean; order: any }>('/api/orders', data),
  update: (id: string, data: any) => api.patch<{ success: boolean; order?: any }>(`/api/orders/${id}`, data),
}

// Addresses
export const addressesApi = {
  getAll: () => api.get<{ success: boolean; addresses: any[] }>('/api/addresses'),
  create: (data: any) => api.post<{ success: boolean; address: any }>('/api/addresses', data),
  update: (id: string, data: any) => api.patch<{ success: boolean; address: any }>(`/api/addresses`, { id, ...data }),
  delete: (id: string) => api.delete<{ success: boolean }>(`/api/addresses?id=${id}`),
}

// Payment Methods
export const paymentMethodsApi = {
  getAll: () => api.get<{ success: boolean; methods: any[] }>('/api/payment-methods'),
  create: (data: any) => api.post<{ success: boolean; method: any }>('/api/payment-methods', data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/api/payment-methods?id=${id}`),
}

// Wallets
export const walletsApi = {
  get: () => api.get<{ success: boolean; wallet: any; transactions: any[] }>('/api/wallets'),
  topup: (amount: number) => api.post<{ success: boolean }>('/api/wallets', { amount }),
}

// Chat
export const chatApi = {
  getRooms: () => api.get<{ success: boolean; rooms: any[] }>('/api/chat/rooms'),
  createRoom: (orderId: string) => api.post<{ success: boolean; room: any }>('/api/chat/rooms', { orderId }),
  getMessages: (roomId: string, page = 1) =>
    api.get<{ success: boolean; messages: any[]; pagination: any }>(`/api/chat/rooms/${roomId}/messages?page=${page}`),
  sendMessage: (roomId: string, message: string, messageType = 'text') =>
    api.post<{ success: boolean; message: any }>(`/api/chat/rooms/${roomId}/messages`, { message, messageType }),
}

// Notifications
export const notificationsApi = {
  get: () => api.get<{ success: boolean; notifications: any[]; unreadCount: number }>('/api/notifications'),
  markRead: (id: string) => api.patch<{ success: boolean }>('/api/notifications', { id }),
  markAllRead: () => api.patch<{ success: boolean }>('/api/notifications', { markAllRead: true }),
}

// Upload (multipart/form-data, no JSON)
export const uploadApi = {
  upload: async (file: File, folder = 'chat'): Promise<{ success: boolean; url: string }> => {
    const token = api.getToken()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    })
    return res.json()
  },
}

// Order Revisions
export const revisionsApi = {
  create: (orderId: string, data: {
    title?: string; description?: string; jobDate?: string; jobTime?: string;
    laborCost?: number; travelCost?: number; materialCost?: number;
  }) => api.post<{ success: boolean; revision: any }>(`/api/orders/${orderId}/revision`, data),
  list: (orderId: string) =>
    api.get<{ success: boolean; revisions: any[] }>(`/api/orders/${orderId}/revision`),
  approve: (orderId: string, revId: string, note?: string) =>
    api.patch<{ success: boolean }>(`/api/orders/${orderId}/revision/${revId}`, { action: 'approve', note }),
  reject: (orderId: string, revId: string, note?: string) =>
    api.patch<{ success: boolean }>(`/api/orders/${orderId}/revision/${revId}`, { action: 'reject', note }),
}

// Disputes
export const disputesApi = {
  open: (orderId: string, data: { reason: string; description?: string }) =>
    api.post<{ success: boolean; dispute: any }>(`/api/orders/${orderId}/dispute`, data),
  get: (orderId: string) =>
    api.get<{ success: boolean; dispute: any }>(`/api/orders/${orderId}/dispute`),
}

// Reviews
export const reviewsApi = {
  create: (data: { orderId: string; rating: number; comment?: string; tags?: string[] }) =>
    api.post<{ success: boolean; review: any }>('/api/reviews', data),
  getByOrder: (orderId: string) =>
    api.get<{ success: boolean; reviews: any[] }>(`/api/reviews?orderId=${orderId}`),
}

// Profile
export const profileApi = {
  update: (data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    api.patch<{ success: boolean; user: any }>('/api/profile', data),
}
