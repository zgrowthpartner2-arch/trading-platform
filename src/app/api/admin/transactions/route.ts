import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const type = searchParams.get('type')

    const where = type ? { type } : {}

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({ transactions })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
