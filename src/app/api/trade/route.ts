import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { distributeCommissions } from '@/lib/referrals'

export const dynamic = 'force-dynamic'

const MOCK_BTC_PRICE = 67500

export async function GET() {
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
    const { type, amountUSDT } = body

    if (!type || !amountUSDT || amountUSDT <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const currentBalance = user.wallet?.balance || 0
    const btcAmount = amountUSDT / MOCK_BTC_PRICE

    if (type === 'buy') {
      if (currentBalance < amountUSDT) {
        return NextResponse.json({ error: 'Saldo USDT insuficiente' }, { status: 400 })
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: amountUSDT } }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'trade_buy',
            amount: -amountUSDT,
            description: `Compra ${btcAmount.toFixed(8)} BTC @ $${MOCK_BTC_PRICE}`
          }
        })
      ])

      await distributeCommissions(user.id, amountUSDT, 'trade_buy')

      return NextResponse.json({
        success: true,
        trade: {
          type: 'buy',
          usdtAmount: amountUSDT,
          btcAmount,
          price: MOCK_BTC_PRICE
        }
      })
    }

    if (type === 'sell') {
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: amountUSDT } }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'trade_sell',
            amount: amountUSDT,
            description: `Venta ${btcAmount.toFixed(8)} BTC @ $${MOCK_BTC_PRICE}`
          }
        })
      ])

      await distributeCommissions(user.id, amountUSDT, 'trade_sell')

      return NextResponse.json({
        success: true,
        trade: {
          type: 'sell',
          usdtAmount: amountUSDT,
          btcAmount,
          price: MOCK_BTC_PRICE
        }
      })
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  } catch (error) {
    console.error('Trade error:', error)
    return NextResponse.json({ error: 'Error en operación' }, { status: 500 })
  }
}