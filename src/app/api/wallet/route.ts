import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { depositWithdrawSchema } from '@/lib/validations'

// GET: Get wallet info
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      balance: user.wallet?.balance || 0,
      transactions
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// POST: Deposit or Withdraw
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body
    const data = depositWithdrawSchema.parse(body)

    if (action === 'withdraw') {
      const currentBalance = user.wallet?.balance || 0
      if (currentBalance < data.amount) {
        return NextResponse.json(
          { error: 'Saldo insuficiente' },
          { status: 400 }
        )
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: data.amount } }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'withdraw',
            amount: -data.amount,
            description: 'Retiro de fondos'
          }
        })
      ])

      return NextResponse.json({ success: true, type: 'withdraw' })
    }

    // Deposit
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: data.amount } }
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'deposit',
          amount: data.amount,
          description: 'Depósito de fondos'
        }
      })
    ])

    return NextResponse.json({ success: true, type: 'deposit' })
  } catch (error) {
    console.error('Wallet error:', error)
    return NextResponse.json({ error: 'Error en operación' }, { status: 500 })
  }
}
