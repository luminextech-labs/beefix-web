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
}

// Wallets
export const walletsApi = {
  get: () => api.get<{ success: boolean; wallet: any; transactions: any[] }>('/api/wallets'),
  topup: (amount: number) => api.post<{ success: boolean }>('/api/wallets', { amount }),
}
