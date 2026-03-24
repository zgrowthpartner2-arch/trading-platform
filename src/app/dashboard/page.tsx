'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  balance: number
  referralCode: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

interface ReferralStats {
  referralLink: string
  totalReferrals: number
  totalCommissions: number
  level1: { count: number }
  level2: { count: number }
  level3: { count: number }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, walletRes, refRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/wallet'),
        fetch('/api/referrals')
      ])

      const userData = await userRes.json()
      const walletData = await walletRes.json()
      const refData = await refRes.json()

      setUser(userData.user)
      setTransactions(walletData.transactions?.slice(0, 5) || [])
      setReferralStats(refData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (referralStats?.referralLink) {
      navigator.clipboard.writeText(referralStats.referralLink)
      alert('¡Link copiado!')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Depósito',
      withdraw: 'Retiro',
      transfer_in: 'Recibido',
      transfer_out: 'Enviado',
      trade_buy: 'Compra',
      trade_sell: 'Venta',
      commission: 'Comisión'
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    if (['deposit', 'transfer_in', 'trade_sell', 'commission'].includes(type)) {
      return 'text-green-400'
    }
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Balance USDT</div>
          <div className="text-2xl font-bold gradient-text">
            ${user?.balance.toFixed(2)}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Referidos</div>
          <div className="text-2xl font-bold">
            {referralStats?.totalReferrals || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Comisiones Ganadas</div>
          <div className="text-2xl font-bold text-green-400">
            ${referralStats?.totalCommissions.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Red Multinivel</div>
          <div className="text-lg">
            <span className="text-white">{referralStats?.level1.count || 0}</span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-400">{referralStats?.level2.count || 0}</span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-500">{referralStats?.level3.count || 0}</span>
          </div>
          <div className="text-xs text-gray-500">Nivel 1 / 2 / 3</div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Tu Link de Referido</h2>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralStats?.referralLink || ''}
            className="input flex-1 text-sm"
          />
          <button onClick={copyReferralLink} className="btn-primary whitespace-nowrap">
            Copiar Link
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          Comparte tu link y gana comisiones de 3 niveles: 10% / 5% / 2%
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/wallet" className="card hover:border-green-500/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Wallet</h3>
              <p className="text-sm text-gray-400">Depositar, retirar, transferir</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/trade" className="card hover:border-green-500/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Trading</h3>
              <p className="text-sm text-gray-400">Comprar y vender</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/referrals" className="card hover:border-green-500/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Referidos</h3>
              <p className="text-sm text-gray-400">Ver tu red multinivel</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Últimas Transacciones</h2>
          <Link href="/dashboard/wallet" className="text-green-400 text-sm hover:underline">
            Ver todas
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay transacciones aún
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-2 border-b border-[#2d3748] last:border-0">
                <div>
                  <span className={`font-medium ${getTypeColor(tx.type)}`}>
                    {getTypeLabel(tx.type)}
                  </span>
                  <p className="text-sm text-gray-400">{tx.description}</p>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} USDT
                  </span>
                  <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
