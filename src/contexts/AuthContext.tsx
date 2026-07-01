'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, authApi } from '@/lib/api'

interface User {
  id: string
  email: string
  phone: string
  fullName: string
  role: 'customer' | 'technician' | 'admin'
  avatarUrl: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; phone: string; password: string; fullName: string; role?: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (token) {
      authApi.me()
        .then(res => { if (res.success) setUser(res.user) })
        .catch(() => { api.setToken(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    if (!res.success) throw new Error(res.user as any || 'Login failed')
    api.setToken(res.token)
    setUser(res.user)
  }

  const register = async (data: { email: string; phone: string; password: string; fullName: string; role?: string }) => {
    const res = await authApi.register(data)
    if (!res.success) throw new Error('Registration failed')
    api.setToken(res.token)
    setUser(res.user)
  }

  const logout = () => {
    api.setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await authApi.me()
      if (res.success) setUser(res.user)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, token: api.getToken(), loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
