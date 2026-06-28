import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// =============================================
// TYPES
// =============================================

export interface JwtPayload {
  userId: string
  role: 'customer' | 'technician' | 'admin'
}

export interface AuthResult {
  success: boolean
  message?: string
  user?: {
    id: string
    email: string
    phone: string
    role: string
    fullName: string
    avatarUrl: string | null
  }
  token?: string
}

// =============================================
// PASSWORD HASHING
// =============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// =============================================
// JWT
// =============================================

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// =============================================
// VALIDATION SCHEMAS
// =============================================

export const registerSchema = z.object({
  email: z.string().email('Email ไม่ถูกต้อง'),
  phone: z.string().min(10, 'เบอร์ต้องมีอย่างน้อย 10 หลัก').max(15),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  fullName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  role: z.enum(['customer', 'technician']).default('customer'),
})

export const loginSchema = z.object({
  email: z.string().email('Email ไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณาใส่รหัสผ่าน'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

// =============================================
// REGISTER
// =============================================

export async function register(data: RegisterInput): Promise<AuthResult> {
  const { email, phone, password, fullName, role } = data

  // Check existing user
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  })

  if (existing) {
    if (existing.email === email) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' }
    }
    return { success: false, message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' }
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      fullName,
      role: role as 'customer' | 'technician',
    },
  })

  // Create wallet for new user
  await prisma.wallet.create({
    data: { userId: user.id },
  })

  // If technician, create technician profile
  if (role === 'technician') {
    await prisma.technician.create({
      data: { userId: user.id },
    })
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    role: user.role as 'customer' | 'technician',
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    },
    token,
  }
}

// =============================================
// LOGIN
// =============================================

export async function login(data: LoginInput): Promise<AuthResult> {
  const { email, password } = data

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  }

  if (!user.isActive) {
    return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน' }
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  }

  const token = generateToken({
    userId: user.id,
    role: user.role as 'customer' | 'technician',
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    },
    token,
  }
}

// =============================================
// GET ME (from token)
// =============================================

export async function getMe(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      fullName: true,
      avatarUrl: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      technician: {
        select: {
          id: true,
          isAvailable: true,
          ratingAvg: true,
        },
      },
    },
  })

  return user
}
