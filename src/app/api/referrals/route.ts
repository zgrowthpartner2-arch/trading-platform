import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getReferralStats } from '@/lib/referrals'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const stats = await getReferralStats(user.id)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${appUrl}/register?ref=${user.referralCode}`,
      ...stats
    })
  } catch (error) {
    console.error('Referrals error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
