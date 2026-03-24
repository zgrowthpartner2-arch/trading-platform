'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  referralCode: string
  isAdmin: boolean
  balance: number
  referralsCount: number
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustDescription, setAdjustDescription] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) return
    setAdjustLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(adjustAmount),
          description: adjustDescription || undefined
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: `Balance ajustado. Nuevo balance: $${data.newBalance.toFixed(2)}` })
      setAdjustAmount('')
      setAdjustDescription('')
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setAdjustLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <span className="text-gray-400">{users.length} usuarios</span>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="card">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          placeholder="Buscar por email o código de referido..."
        />
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Código Referido</th>
                <th>Balance</th>
                <th>Referidos</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        user.isAdmin 
                          ? 'bg-gradient-to-br from-red-400 to-orange-600'
                          : 'bg-gradient-to-br from-green-400 to-emerald-600'
                      }`}>
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="block">{user.email}</span>
                        {user.isAdmin && (
                          <span className="text-xs text-orange-400">Admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="bg-[#0a0e17] px-2 py-1 rounded text-sm">
                      {user.referralCode}
                    </code>
                  </td>
                  <td className="font-semibold text-green-400">
                    ${user.balance.toFixed(2)}
                  </td>
                  <td>{user.referralsCount}</td>
                  <td className="text-gray-400">{formatDate(user.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded hover:bg-orange-500/20 transition-colors text-sm"
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ajustar Balance</h2>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setAdjustAmount('')
                  setAdjustDescription('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Usuario</div>
                <div className="font-medium">{selectedUser.email}</div>
                <div className="text-sm text-gray-400 mt-2">Balance Actual</div>
                <div className="text-xl font-bold text-green-400">
                  ${selectedUser.balance.toFixed(2)} USDT
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Monto a ajustar (positivo para sumar, negativo para restar)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="input"
                  placeholder="100 o -50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="input"
                  placeholder="Ej: Bonus promocional"
                />
              </div>

              {adjustAmount && (
                <div className="bg-[#0a0e17] rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Nuevo Balance</div>
                  <div className={`text-xl font-bold ${
                    selectedUser.balance + parseFloat(adjustAmount || '0') >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    ${(selectedUser.balance + parseFloat(adjustAmount || '0')).toFixed(2)} USDT
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setAdjustAmount('')
                    setAdjustDescription('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdjustBalance}
                  disabled={adjustLoading || !adjustAmount}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {adjustLoading ? 'Procesando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
