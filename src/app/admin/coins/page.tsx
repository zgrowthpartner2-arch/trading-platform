'use client'

import { useState, useEffect } from 'react'

interface Coin {
  id: string
  symbol: string
  name: string
  logoUrl: string | null
  price: number
  change24h: number
  isActive: boolean
}

export default function AdminCoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoin, setEditingCoin] = useState<Coin | null>(null)
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    logoUrl: '',
    price: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchCoins()
  }, [])

  const fetchCoins = async () => {
    try {
      const res = await fetch('/api/admin/coins')
      const data = await res.json()
      setCoins(data.coins || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (coin?: Coin) => {
    if (coin) {
      setEditingCoin(coin)
      setFormData({
        symbol: coin.symbol,
        name: coin.name,
        logoUrl: coin.logoUrl || '',
        price: coin.price.toString()
      })
    } else {
      setEditingCoin(null)
      setFormData({ symbol: '', name: '', logoUrl: '', price: '' })
    }
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCoin(null)
    setFormData({ symbol: '', name: '', logoUrl: '', price: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const url = editingCoin 
        ? `/api/coins/${editingCoin.id}`
        : '/api/coins'
      
      const res = await fetch(url, {
        method: editingCoin ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: formData.symbol,
          name: formData.name,
          logoUrl: formData.logoUrl || null,
          price: parseFloat(formData.price) || 0
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error')
      }

      setMessage({ type: 'success', text: editingCoin ? 'Moneda actualizada' : 'Moneda creada' })
      fetchCoins()
      setTimeout(closeModal, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (coin: Coin) => {
    if (!confirm(`¿Eliminar ${coin.symbol}?`)) return

    try {
      await fetch(`/api/coins/${coin.id}`, { method: 'DELETE' })
      fetchCoins()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const updatePrice = async (coin: Coin, newPrice: string) => {
    try {
      await fetch(`/api/coins/${coin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) || 0 })
      })
      fetchCoins()
    } catch (error) {
      console.error('Error:', error)
    }
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
        <h1 className="text-2xl font-bold">Gestión de Monedas</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-400 transition-colors"
        >
          + Nueva Moneda
        </button>
      </div>

      {/* Coins Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coins.map((coin) => (
          <div key={coin.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {coin.logoUrl ? (
                  <img
                    src={coin.logoUrl}
                    alt={coin.symbol}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {coin.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{coin.symbol}</h3>
                  <p className="text-sm text-gray-400">{coin.name}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                coin.isActive 
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {coin.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1">Precio USD</label>
              <input
                type="number"
                defaultValue={coin.price}
                onBlur={(e) => updatePrice(coin, e.target.value)}
                className="input text-lg font-bold"
                step="0.000001"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal(coin)}
                className="flex-1 py-2 bg-[#2d3748] text-white rounded-lg hover:bg-[#3d4758] transition-colors text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(coin)}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {coins.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No hay monedas creadas</p>
          <p className="text-sm mt-2">Crea tu primera moneda para comenzar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingCoin ? 'Editar Moneda' : 'Nueva Moneda'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg mb-4 ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Símbolo *</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="BTC"
                  required
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Bitcoin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">URL del Logo</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="input"
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes usar logos de CoinGecko, CoinMarketCap, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Precio USD</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  placeholder="67500.00"
                  step="0.000001"
                />
              </div>

              {formData.logoUrl && (
                <div className="flex items-center gap-3 p-3 bg-[#0a0e17] rounded-lg">
                  <img
                    src={formData.logoUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ''
                    }}
                  />
                  <span className="text-sm text-gray-400">Vista previa del logo</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-[#2d3748] text-white rounded-lg hover:bg-[#3d4758] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-green-500 text-black rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : (editingCoin ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
