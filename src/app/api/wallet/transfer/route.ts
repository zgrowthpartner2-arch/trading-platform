import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transferSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const data = transferSchema.parse(body)

    // Can't transfer to yourself
    if (data.toEmail === user.email) {
      return NextResponse.json(
        { error: 'No puedes transferirte a ti mismo' },
        { status: 400 }
      )
    }

    // Find recipient
    const recipient = await prisma.user.findUnique({
      where: { email: data.toEmail }
    })

    if (!recipient) {
      return NextResponse.json(
        { error: 'Usuario destinatario no encontrado' },
        { status: 404 }
      )
    }

    // Check balance
    const currentBalance = user.wallet?.balance || 0
    if (currentBalance < data.amount) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      )
    }

    // Execute transfer in transaction
    await prisma.$transaction([
      // Deduct from sender
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: data.amount } }
      }),
      // Add to recipient
      prisma.wallet.update({
        where: { userId: recipient.id },
        data: { balance: { increment: data.amount } }
      }),
      // Record sender transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'transfer_out',
          amount: -data.amount,
          description: `Transferencia a ${recipient.email}`,
          relatedId: recipient.id
        }
      }),
      // Record recipient transaction
      prisma.transaction.create({
        data: {
          userId: recipient.id,
          type: 'transfer_in',
          amount: data.amount,
          description: `Transferencia de ${user.email}`,
          relatedId: user.id
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      message: `Transferido ${data.amount} USDT a ${data.toEmail}`
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Error en transferencia' }, { status: 500 })
  }
}
