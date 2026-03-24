import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tradeSchema } from '@/lib/validations'
import { distributeCommissions } from '@/lib/referrals'

// Mock price (in production, this would come from an API)
const MOCK_BTC_PRICE = 67500

export async function GET() {
  // Return current mock price
  return NextResponse.json({
    symbol: 'BTC/USDT',
    price: MOCK_BTC_PRICE,
    change24h: 2.34,
    high24h: MOCK_BTC_PRICE * 1.03,
    low24h: MOCK_BTC_PRICE * 0.97
  })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const data = tradeSchema.parse(body)
    const currentBalance = user.wallet?.balance || 0

    if (data.type === 'buy') {
      // Buying: need enough USDT
      if (currentBalance < data.amount) {
        return NextResponse.json(
          { error: 'Saldo USDT insuficiente' },
          { status: 400 }
        )
      }

      const btcAmount = data.amount / MOCK_BTC_PRICE

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: data.amount } }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'trade_buy',
            amount: -data.amount,
            description: `Compra ${btcAmount.toFixed(8)} BTC @ $${MOCK_BTC_PRICE}`
          }
        })
      ])

      // Distribute commissions to upline
      await distributeCommissions(user.id, data.amount, 'trade_buy')

      return NextResponse.json({
        success: true,
        trade: {
          type: 'buy',
          usdtAmount: data.amount,
          btcAmount,
          price: MOCK_BTC_PRICE
        }
      })
    }

    // Selling: simulated - just adds USDT back
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: data.amount } }
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'trade_sell',
          amount: data.amount,
          description: `Venta BTC por ${data.amount} USDT @ $${MOCK_BTC_PRICE}`
        }
      })
    ])

    // Distribute commissions to upline
    await distributeCommissions(user.id, data.amount, 'trade_sell')

    return NextResponse.json({
      success: true,
      trade: {
        type: 'sell',
        usdtAmount: data.amount,
        price: MOCK_BTC_PRICE
      }
    })
  } catch (error) {
    console.error('Trade error:', error)
    return NextResponse.json({ error: 'Error en operación' }, { status: 500 })
  }
}
