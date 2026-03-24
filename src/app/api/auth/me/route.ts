import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
        balance: user.wallet?.balance || 0
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}
