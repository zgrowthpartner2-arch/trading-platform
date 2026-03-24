'use client'

import { useState, useEffect } from 'react'

interface ReferralUser {
  id: string
  email: string
  createdAt: string
}

interface ReferralStats {
  referralCode: string
  referralLink: string
  totalReferrals: number
  totalCommissions: number
  rates: {
    level1: number
    level2: number
    level3: number
  }
  level1: { count: number; users: ReferralUser[] }
  level2: { count: number; users: ReferralUser[] }
  level3: { count: number; users: ReferralUser[] }
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeLevel, setActiveLevel] = useState(1)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/referrals')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getCurrentLevelUsers = () => {
    if (!stats) return []
    switch (activeLevel) {
      case 1: return stats.level1.users
      case 2: return stats.level2.users
      case 3: return stats.level3.users
      default: return []
    }
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
      <h1 className="text-2xl font-bold">Red de Referidos</h1>

      {/* Referral Link */}
      <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Tu Link de Referido</h2>
            <p className="text-sm text-gray-400">
              Comparte este link y gana comisiones de 3 niveles
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Tu código</div>
            <div className="text-xl font-bold gradient-text">{stats?.referralCode}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={stats?.referralLink || ''}
            className="input flex-1 text-sm bg-[#0a0e17]"
          />
          <button 
            onClick={copyLink}
            className={`btn-primary whitespace-nowrap ${copied ? 'bg-green-600' : ''}`}
          >
            {copied ? '¡Copiado!' : 'Copiar Link'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold gradient-text mb-1">
            {stats?.totalReferrals || 0}
          </div>
          <div className="text-sm text-gray-400">Total Referidos</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">
            ${stats?.totalCommissions.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-400">Comisiones Ganadas</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold mb-1">
            {stats?.level1.count || 0}
          </div>
          <div className="text-sm text-gray-400">Nivel 1 ({stats?.rates.level1}%)</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-400 mb-1">
            {(stats?.level2.count || 0) + (stats?.level3.count || 0)}
          </div>
          <div className="text-sm text-gray-400">Niveles 2+3</div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Estructura de Comisiones</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#0a0e17] rounded-lg p-4 text-center border border-green-500/30">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats?.rates.level1}%</div>
            <div className="text-sm text-gray-400">Nivel 1</div>
            <div className="text-xs text-gray-500 mt-1">Referidos directos</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-4 text-center border border-green-500/20">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats?.rates.level2}%</div>
            <div className="text-sm text-gray-400">Nivel 2</div>
            <div className="text-xs text-gray-500 mt-1">Referidos de tus referidos</div>
          </div>
          <div className="bg-[#0a0e17] rounded-lg p-4 text-center border border-green-500/10">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats?.rates.level3}%</div>
            <div className="text-sm text-gray-400">Nivel 3</div>
            <div className="text-xs text-gray-500 mt-1">Tercer nivel de profundidad</div>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Tu Red</h2>
        
        {/* Level Tabs */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((level) => {
            const count = level === 1 ? stats?.level1.count : level === 2 ? stats?.level2.count : stats?.level3.count
            return (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeLevel === level
                    ? 'bg-green-500 text-black'
                    : 'bg-[#2d3748] text-gray-400 hover:text-white'
                }`}
              >
                Nivel {level} ({count || 0})
              </button>
            )
          })}
        </div>

        {/* Users List */}
        {getCurrentLevelUsers().length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No hay referidos en el nivel {activeLevel}</p>
            <p className="text-sm mt-2">¡Comparte tu link para empezar a construir tu red!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentLevelUsers().map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {user.email[0].toUpperCase()}
                        </div>
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="text-gray-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card bg-[#111827]">
        <h2 className="text-lg font-semibold mb-4">💡 Consejos para crecer tu red</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="flex gap-3">
            <span className="text-green-400">1.</span>
            <p>Comparte tu link en redes sociales y grupos de trading</p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">2.</span>
            <p>Ayuda a tus referidos a entender la plataforma</p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">3.</span>
            <p>Motiva a tu red a invitar más personas</p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">4.</span>
            <p>Ganas comisiones cada vez que tu red hace trading</p>
          </div>
        </div>
      </div>
    </div>
  )
}
