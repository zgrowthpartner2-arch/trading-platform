import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { distributeCommissions } from '@/lib/referrals'

export const dynamic = 'force-dynamic'

// GET - Obtener monedas disponibles y balances del usuario
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    const coins = await prisma.coin.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' }
    })

    let userBalances: Record<string, number> = {}
    
    if (user) {
      const balances = await prisma.cryptoBalance.findMany({
        where: { userId: user.id },
        include: { coin: true }
      })
      
      balances.forEach(b => {
        userBalances[b.coinId] = b.amount
      })
    }

    return NextResponse.json({ 
      coins,
      userBalances,
      usdtBalance: user?.wallet?.balance || 0
    })
  } catch (error) {
    console.error('Trade GET error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// POST - Ejecutar trade (compra/venta)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, coinId, amount } = body

    if (!type || !coinId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const coin = await prisma.coin.findUnique({
      where: { id: coinId }
    })

    if (!coin || !coin.isActive) {
      return NextResponse.json({ error: 'Moneda no disponible' }, { status: 400 })
    }

    const usdtBalance = user.wallet?.balance || 0

    if (type === 'buy') {
      const usdtNeeded = amount * coin.price
      
      if (usdtBalance < usdtNeeded) {
        return NextResponse.json({ error: 'Saldo USDT insuficiente' }, { status: 400 })
      }

      const existingBalance = await prisma.cryptoBalance.findUnique({
        where: {
          userId_coinId: {
            userId: user.id,
            coinId: coin.id
          }
        }
      })

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: usdtNeeded } }
        }),
        existingBalance
          ? prisma.cryptoBalance.update({
              where: { id: existingBalance.id },
              data: { amount: { increment: amount } }
            })
          : prisma.cryptoBalance.create({
              data: {
                userId: user.id,
                coinId: coin.id,
                amount: amount
              }
            }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'trade_buy',
            amount: -usdtNeeded,
            description: `Compra ${amount} ${coin.symbol} @ $${coin.price}`,
            coinId: coin.id
          }
        })
      ])

      await distributeCommissions(user.id, usdtNeeded, 'trade_buy')

      return NextResponse.json({
        success: true,
        trade: {
          type: 'buy',
          coin: coin.symbol,
          amount,
          price: coin.price,
          total: usdtNeeded
        }
      })
    }

    if (type === 'sell') {
      const cryptoBalance = await prisma.cryptoBalance.findUnique({
        where: {
          userId_coinId: {
            userId: user.id,
            coinId: coin.id
          }
        }
      })

      if (!cryptoBalance || cryptoBalance.amount < amount) {
        return NextResponse.json(
          { error: `Saldo ${coin.symbol} insuficiente` },
          { status: 400 }
        )
      }

      const usdtToReceive = amount * coin.price

      await prisma.$transaction([
        prisma.cryptoBalance.update({
          where: { id: cryptoBalance.id },
          data: { amount: { decrement: amount } }
        }),
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: usdtToReceive } }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'trade_sell',
            amount: usdtToReceive,
            description: `Venta ${amount} ${coin.symbol} @ $${coin.price}`,
            coinId: coin.id
          }
        })
      ])

      await distributeCommissions(user.id, usdtToReceive, 'trade_sell')

      return NextResponse.json({
        success: true,
        trade: {
          type: 'sell',
          coin: coin.symbol,
          amount,
          price: coin.price,
          total: usdtToReceive
        }
      })
    }

    return NextResponse.json({ error: 'Tipo de operación inválido' }, { status: 400 })
  } catch (error) {
    console.error('Trade error:', error)
    return NextResponse.json({ error: 'Error en operación' }, { status: 500 })
  }
}