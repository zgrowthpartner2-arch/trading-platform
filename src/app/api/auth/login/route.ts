import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { wallet: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

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
        isAdmin: user.isAdmin,
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
