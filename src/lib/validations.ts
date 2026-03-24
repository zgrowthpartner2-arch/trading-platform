import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  referralCode: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const transferSchema = z.object({
  toEmail: z.string().email('Email inválido'),
  amount: z.number().positive('Monto debe ser positivo'),
})

export const tradeSchema = z.object({
  type: z.enum(['buy', 'sell']),
  amount: z.number().positive('Monto debe ser positivo'),
})

export const depositWithdrawSchema = z.object({
  amount: z.number().positive('Monto debe ser positivo'),
})

export const adminAdjustSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  description: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TransferInput = z.infer<typeof transferSchema>
export type TradeInput = z.infer<typeof tradeSchema>
export type DepositWithdrawInput = z.infer<typeof depositWithdrawSchema>
export type AdminAdjustInput = z.infer<typeof adminAdjustSchema>
