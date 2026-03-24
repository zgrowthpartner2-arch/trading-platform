'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Form states
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit')
  const [amount, setAmount] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet')
      const data = await res.json()
      setBalance(data.balance)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', amount: parseFloat(amount) })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setMessage({ type: 'success', text: `Depósito de $${amount} USDT realizado` })
      setAmount('')
      fetchWallet()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw', amount: parseFloat(amount) })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setMessage({ type: 'success', text: `Retiro de $${amount} USDT realizado` })
      setAmount('')
      fetchWallet()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0 || !toEmail) return
    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, amount: parseFloat(amount) })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ type: 'success', text: data.message })
      setAmount('')
      setToEmail('')
      fetchWallet()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setActionLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Wallet</h1>

      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-[#1a2332] to-[#111827]">
        <div className="text-sm text-gray-400 mb-2">Balance Disponible</div>
        <div className="text-4xl font-bold gradient-text mb-4">
          ${balance.toFixed(2)} <span className="text-xl text-gray-400">USDT</span>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['deposit', 'withdraw', 'transfer'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setMessage({ type: '', text: '' })
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-green-500 text-black'
                  : 'bg-[#2d3748] text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'deposit' ? 'Depositar' : tab === 'withdraw' ? 'Retirar' : 'Transferir'}
            </button>
          ))}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {activeTab === 'transfer' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email del destinatario</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="input"
                placeholder="usuario@email.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Monto (USDT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <button
            onClick={
              activeTab === 'deposit' ? handleDeposit :
              activeTab === 'withdraw' ? handleWithdraw :
              handleTransfer
            }
            disabled={actionLoading || !amount}
            className="btn-primary w-full"
          >
            {actionLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </span>
            ) : (
              activeTab === 'deposit' ? 'Depositar' :
              activeTab === 'withdraw' ? 'Retirar' :
              'Transferir'
            )}
          </button>

          {activeTab !== 'deposit' && (
            <p className="text-xs text-gray-500 text-center">
              {activeTab === 'withdraw' 
                ? 'Los retiros son simulados en esta demo'
                : 'Las transferencias son instantáneas entre usuarios'}
            </p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Historial de Transacciones</h2>
        
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay transacciones</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
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
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        tx.amount >= 0 
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="text-gray-400">{tx.description}</td>
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
