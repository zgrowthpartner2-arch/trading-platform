'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
  user: {
    email: string
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const url = filter 
        ? `/api/admin/transactions?type=${filter}`
        : '/api/admin/transactions'
      const res = await fetch(url)
      const data = await res.json()
      setTransactions(data.transactions || [])
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
      year: 'numeric',
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
    const colors: Record<string, string> = {
      deposit: 'bg-green-500/10 text-green-400',
      withdraw: 'bg-red-500/10 text-red-400',
      transfer_in: 'bg-blue-500/10 text-blue-400',
      transfer_out: 'bg-orange-500/10 text-orange-400',
      trade_buy: 'bg-purple-500/10 text-purple-400',
      trade_sell: 'bg-pink-500/10 text-pink-400',
      commission: 'bg-yellow-500/10 text-yellow-400'
    }
    return colors[type] || 'bg-gray-500/10 text-gray-400'
  }

  const types = [
    { value: '', label: 'Todos' },
    { value: 'deposit', label: 'Depósitos' },
    { value: 'withdraw', label: 'Retiros' },
    { value: 'transfer_in', label: 'Recibidos' },
    { value: 'transfer_out', label: 'Enviados' },
    { value: 'trade_buy', label: 'Compras' },
    { value: 'trade_sell', label: 'Ventas' },
    { value: 'commission', label: 'Comisiones' },
  ]

  // Calculate totals
  const totals = transactions.reduce((acc, tx) => {
    if (tx.amount > 0) acc.positive += tx.amount
    else acc.negative += Math.abs(tx.amount)
    return acc
  }, { positive: 0, negative: 0 })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <span className="text-gray-400">{transactions.length} registros</span>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Entradas</div>
          <div className="text-xl font-bold text-green-400">
            +${totals.positive.toFixed(2)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Salidas</div>
          <div className="text-xl font-bold text-red-400">
            -${totals.negative.toFixed(2)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Balance Neto</div>
          <div className={`text-xl font-bold ${
            totals.positive - totals.negative >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${(totals.positive - totals.negative).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#2d3748] text-gray-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No hay transacciones</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {tx.user.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{tx.user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(tx.type)}`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="text-gray-400 text-sm max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </td>
                    <td className="text-gray-500 text-sm">{formatDate(tx.createdAt)}</td>
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
