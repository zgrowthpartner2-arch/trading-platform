'use client'

import { useState, useEffect } from 'react'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  high24h: number
  low24h: number
}

export default function TradePage() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tradeLoading, setTradeLoading] = useState(false)
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
    // Simulate price updates
    const interval = setInterval(() => {
      setPriceData(prev => prev ? {
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 100,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.1
      } : null)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [tradeRes, walletRes] = await Promise.all([
        fetch('/api/trade'),
        fetch('/api/wallet')
      ])
      
      const tradeData = await tradeRes.json()
      const walletData = await walletRes.json()
      
      setPriceData(tradeData)
      setBalance(walletData.balance)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setTradeLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tradeType, amount: parseFloat(amount) })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const btcAmount = tradeType === 'buy' 
        ? (parseFloat(amount) / (priceData?.price || 67500)).toFixed(8)
        : (parseFloat(amount) / (priceData?.price || 67500)).toFixed(8)

      setMessage({
        type: 'success',
        text: tradeType === 'buy'
          ? `Compra exitosa: ${btcAmount} BTC por $${amount} USDT`
          : `Venta exitosa: ${btcAmount} BTC por $${amount} USDT`
      })
      setAmount('')
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setTradeLoading(false)
    }
  }

  const calculateBTC = () => {
    if (!amount || !priceData) return '0.00000000'
    return (parseFloat(amount) / priceData.price).toFixed(8)
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
      <h1 className="text-2xl font-bold">Trading</h1>

      {/* Price Display */}
      <div className="card bg-gradient-to-br from-[#1a2332] to-[#111827]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{priceData?.symbol}</h2>
              <p className="text-sm text-gray-400">Bitcoin / Tether</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            (priceData?.change24h || 0) >= 0 
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {(priceData?.change24h || 0) >= 0 ? '+' : ''}{priceData?.change24h.toFixed(2)}%
          </div>
        </div>

        <div className="text-4xl font-bold mb-4">
          ${priceData?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">24h High: </span>
            <span className="text-green-400">${priceData?.high24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">24h Low: </span>
            <span className="text-red-400">${priceData?.low24h.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Trading Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trade Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Operar</h3>
          
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                tradeType === 'buy'
                  ? 'bg-green-500 text-black'
                  : 'bg-[#2d3748] text-gray-400 hover:text-white'
              }`}
            >
              Comprar
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                tradeType === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#2d3748] text-gray-400 hover:text-white'
              }`}
            >
              Vender
            </button>
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

          {/* Amount Input */}
          <div className="mb-4">
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

          {/* BTC Preview */}
          <div className="bg-[#0a0e17] rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-400 mb-1">Recibirás aproximadamente</div>
            <div className="text-xl font-bold">
              {calculateBTC()} <span className="text-gray-400">BTC</span>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mb-4">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount((balance * pct / 100).toFixed(2))}
                className="flex-1 py-2 bg-[#2d3748] rounded text-sm hover:bg-[#3d4758] transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          <button
            onClick={handleTrade}
            disabled={tradeLoading || !amount || parseFloat(amount) <= 0}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              tradeType === 'buy'
                ? 'bg-green-500 text-black hover:bg-green-400 disabled:bg-green-500/50'
                : 'bg-red-500 text-white hover:bg-red-400 disabled:bg-red-500/50'
            } disabled:cursor-not-allowed`}
          >
            {tradeLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </span>
            ) : (
              tradeType === 'buy' ? 'Comprar BTC' : 'Vender BTC'
            )}
          </button>
        </div>

        {/* Account Info */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Tu Balance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">USDT Disponible</span>
                <span className="font-bold text-xl">${balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Información</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Este es un entorno de trading simulado</p>
              <p>• Los precios son ficticios y se actualizan automáticamente</p>
              <p>• Las operaciones generan comisiones para tu red de referidos</p>
              <p>• Nivel 1: 10% | Nivel 2: 5% | Nivel 3: 2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
