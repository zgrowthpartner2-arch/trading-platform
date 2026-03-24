import { prisma } from './prisma'

// Commission rates by level (from env or defaults)
const COMMISSION_RATES = {
  level1: parseFloat(process.env.COMMISSION_LEVEL_1 || '10') / 100,
  level2: parseFloat(process.env.COMMISSION_LEVEL_2 || '5') / 100,
  level3: parseFloat(process.env.COMMISSION_LEVEL_3 || '2') / 100,
}

interface ReferralChain {
  level: number
  userId: string
  rate: number
}

// Get the upline chain (up to 3 levels)
export async function getReferralChain(userId: string): Promise<ReferralChain[]> {
  const chain: ReferralChain[] = []
  let currentUserId: string | null = userId
  let level = 0

  while (level < 3 && currentUserId) {
    const foundUser: { referredById: string | null } | null = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { referredById: true }
    })

    if (!foundUser?.referredById) break

    level++
    const rate = level === 1 
      ? COMMISSION_RATES.level1 
      : level === 2 
        ? COMMISSION_RATES.level2 
        : COMMISSION_RATES.level3

    chain.push({
      level,
      userId: foundUser.referredById,
      rate
    })

    currentUserId = foundUser.referredById
  }

  return chain
}

// Distribute commissions to upline
export async function distributeCommissions(
  userId: string,
  operationAmount: number,
  operationType: string
): Promise<void> {
  const chain = await getReferralChain(userId)

  for (const { userId: referrerId, rate, level } of chain) {
    const commission = operationAmount * rate

    if (commission <= 0) continue

    // Update referrer's wallet
    await prisma.wallet.update({
      where: { userId: referrerId },
      data: { balance: { increment: commission } }
    })

    // Record commission transaction
    await prisma.transaction.create({
      data: {
        userId: referrerId,
        type: 'commission',
        amount: commission,
        description: `Level ${level} commission from ${operationType}`,
        relatedId: userId
      }
    })
  }
}

// Get referral stats for a user
export async function getReferralStats(userId: string) {
  type ReferralUser = { id: string; email: string; createdAt: Date }

  // Direct referrals (Level 1)
  const level1: ReferralUser[] = await prisma.user.findMany({
    where: { referredById: userId },
    select: { id: true, email: true, createdAt: true }
  })

  // Level 2 referrals
  const level1Ids = level1.map((u: ReferralUser) => u.id)
  const level2: ReferralUser[] = level1Ids.length > 0 
    ? await prisma.user.findMany({
        where: { referredById: { in: level1Ids } },
        select: { id: true, email: true, createdAt: true }
      })
    : []

  // Level 3 referrals
  const level2Ids = level2.map((u: ReferralUser) => u.id)
  const level3: ReferralUser[] = level2Ids.length > 0
    ? await prisma.user.findMany({
        where: { referredById: { in: level2Ids } },
        select: { id: true, email: true, createdAt: true }
      })
    : []

  // Total commissions earned
  const commissions = await prisma.transaction.aggregate({
    where: { userId, type: 'commission' },
    _sum: { amount: true }
  })

  return {
    level1: { count: level1.length, users: level1 },
    level2: { count: level2.length, users: level2 },
    level3: { count: level3.length, users: level3 },
    totalReferrals: level1.length + level2.length + level3.length,
    totalCommissions: commissions._sum.amount || 0,
    rates: {
      level1: COMMISSION_RATES.level1 * 100,
      level2: COMMISSION_RATES.level2 * 100,
      level3: COMMISSION_RATES.level3 * 100,
    }
  }
}
