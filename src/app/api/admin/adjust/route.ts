import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adminAdjustSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const data = adminAdjustSchema.parse(body)

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { wallet: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Adjust balance
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: data.userId },
        data: { balance: { increment: data.amount } }
      }),
      prisma.transaction.create({
        data: {
          userId: data.userId,
          type: data.amount >= 0 ? 'deposit' : 'withdraw',
          amount: data.amount,
          description: data.description || `Ajuste admin por ${user.email}`
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      newBalance: (targetUser.wallet?.balance || 0) + data.amount
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
