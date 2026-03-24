import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Find referrer if code provided
    let referredById: string | null = null
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode }
      })
      if (referrer) {
        referredById = referrer.id
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user with wallet
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        referralCode: nanoid(8),
        referredById,
        wallet: {
          create: { balance: 0 }
        }
      },
      include: { wallet: true }
    })

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    })

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        balance: user.wallet?.balance || 0
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al registrar' },
      { status: 500 }
    )
  }
}
