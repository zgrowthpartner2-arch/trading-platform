import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const coins = await prisma.coin.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ coins })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
