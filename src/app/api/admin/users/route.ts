import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface UserWithRelations {
  id: string
  email: string
  referralCode: string
  isAdmin: boolean
  createdAt: Date
  wallet: { balance: number } | null
  _count: { referrals: number }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        wallet: true,
        _count: {
          select: { referrals: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      users: users.map((u: UserWithRelations) => ({
        id: u.id,
        email: u.email,
        referralCode: u.referralCode,
        isAdmin: u.isAdmin,
        balance: u.wallet?.balance || 0,
        referralsCount: u._count.referrals,
        createdAt: u.createdAt
      }))
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
