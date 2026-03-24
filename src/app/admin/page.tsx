'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalBalance: number
  totalTransactions: number
  recentUsers: Array<{
    id: string
    email: string
    balance: number
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, txRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions?limit=10')
      ])

      const usersData = await usersRes.json()
      const txData = await txRes.json()

      const users = usersData.users || []
      const totalBalance = users.reduce((sum: number, u: { balance: number }) => sum + u.balance, 0)

      setStats({
        totalUsers: users.length,
        totalBalance,
        totalTransactions: txData.transactions?.length || 0,
        recentUsers: users.slice(0, 5)
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium">
          Admin
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card border-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-gray-400">Usuarios Totales</div>
            </div>
          </div>
        </div>

        <div className="card border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                ${stats?.totalBalance.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">Balance Total USDT</div>
            </div>
          </div>
        </div>

        <div className="card border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
              <div className="text-sm text-gray-400">Transacciones Recientes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="card hover:border-orange-500/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Gestionar Usuarios</h3>
              <p className="text-sm text-gray-400">Ver, editar y ajustar balances</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/transactions" className="card hover:border-orange-500/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Ver Transacciones</h3>
              <p className="text-sm text-gray-400">Historial completo del sistema</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Users */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Usuarios Recientes</h2>
          <Link href="/admin/users" className="text-orange-400 text-sm hover:underline">
            Ver todos
          </Link>
        </div>

        {stats?.recentUsers.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay usuarios</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Balance</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.email[0].toUpperCase()}
                        </div>
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-green-400">
                      ${user.balance.toFixed(2)}
                    </td>
                    <td className="text-gray-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
