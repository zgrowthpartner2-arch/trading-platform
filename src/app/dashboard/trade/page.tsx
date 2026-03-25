'use client'

import { useState, useEffect } from 'react'

interface Coin {
  id: string
  symbol: string
  name: string
  logoUrl: string | null
  price: number
  change24h: number
}

export default function TradePage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [userBalances, setUserBalances] = useState<Record<string, number>>({})
  const [usdtBalance, setUsdtBalance] = useState(0)
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [loading, setLoading] = useState(true)
  const [tradeLoading, setTradeLoading] = useState(false)
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [inputMode, setInputMode] = useState<'crypto' | 'usdt'>('usdt')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/trade')
      const data = await res.json()
      setCoins(data.coins || [])
      setUserBalances(data.userBalances || {})
      setUsdtBalance(data.usdtBalance || 0)
      if (data.coins?.length > 0 && !selectedCoin) {
        setSelectedCoin(data.coins[0])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCryptoAmount = () => {
    if (!amount || !selectedCoin) return 0
    if (inputMode === 'crypto') return parseFloat(amount)
    return parseFloat(amount) / selectedCoin.price
  }

  const getUsdtAmount = () => {
    if (!amount || !selectedCoin) return 0
    if (inputMode === 'usdt') return parseFloat(amount)
    return parseFloat(amount) * selectedCoin.price
  }

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedCoin) return
    setTradeLoading(true)
    setMessage({ type: '', text: '' })

    const cryptoAmount = getCryptoAmount()

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tradeType,
          coinId: selectedCoin.id,
          amount: cryptoAmount
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({
        type: 'success',
        text: tradeType === 'buy'
          ? `✅ Compraste ${cryptoAmount.toFixed(8)} ${selectedCoin.symbol} por $${data.trade.total.toFixed(2)} USDT`
          : `✅ Vendiste ${cryptoAmount.toFixed(8)} ${selectedCoin.symbol} por $${data.trade.total.toFixed(2)} USDT`
      })
      setAmount('')
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' })
    } finally {
      setTradeLoading(false)
    }
  }

  const getCryptoBalance = (coinId: string) => {
    return userBalances[coinId] || 0
  }

  const setPercentage = (pct: number) => {
    if (!selectedCoin) return
    
    if (tradeType === 'buy') {
      const maxUsdt = usdtBalance * pct / 100
      if (inputMode === 'usdt') {
        setAmount(maxUsdt.toFixed(2))
      } else {
        setAmount((maxUsdt / selectedCoin.price).toFixed(8))
      }
    } else {
      const balance = getCryptoBalance(selectedCoin.id)
      const maxCrypto = balance * pct / 100
      if (inputMode === 'crypto') {
        setAmount(maxCrypto.toFixed(8))
      } else {
        setAmount((maxCrypto * selectedCoin.price).toFixed(2))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (coins.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🪙</div>
        <h2 className="text-xl font-bold mb-2">No hay monedas disponibles</h2>
        <p className="text-gray-400">El administrador debe crear monedas para poder tradear</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Trading</h1>

      {/* Balances */}
      <div className="card bg-gradient-to-br from-[#1a2332] to-[#111827]">
        <h2 className="text-lg font-semibold mb-4">Tus Balances</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0a0e17] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">$</div>
              <span className="text-gray-400">USDT</span>
            </div>
            <div className="text-xl font-bold text-green-400">${usdtBalance.toFixed(2)}</div>
          </div>

          {coins.map((coin) => {
            const balance = getCryptoBalance(coin.id)
            if (balance === 0) return null
            return (
              <div key={coin.id} className="bg-[#0a0e17] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {coin.logoUrl ? (
                    <img src={coin.logoUrl} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {coin.symbol.slice(0, 2)}
                    </div>
                  )}
                  <span className="text-gray-400">{coin.symbol}</span>
                </div>
                <div className="text-xl font-bold">{balance.toFixed(8)}</div>
                <div className="text-sm text-gray-500">≈ ${(balance * coin.price).toFixed(2)}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coin Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Seleccionar Moneda</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {coins.map((coin) => (
              <button
                key={coin.id}
                onClick={() => {
                  setSelectedCoin(coin)
                  setAmount('')
                  setMessage({ type: '', text: '' })
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedCoin?.id === coin.id
                    ? 'bg-green-500/10 border border-green-500/50'
                    : 'bg-[#0a0e17] hover:bg-[#1a2332]'
                }`}
              >
                {coin.logoUrl ? (
                  <img src={coin.logoUrl} alt={coin.symbol} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {coin.symbol.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="font-semibold">{coin.symbol}</div>
                  <div className="text-sm text-gray-400">{coin.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${coin.price.toLocaleString()}</div>
                  <div className={`text-sm ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Form */}
        <div className="card md:col-span-2">
          {selectedCoin && (
            <>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#2d3748]">
                {selectedCoin.logoUrl ? (
                  <img src={selectedCoin.logoUrl} alt={selectedCoin.symbol} className="w-14 h-14 rounded-full" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedCoin.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedCoin.symbol}/USDT</h2>
                  <p className="text-gray-400">{selectedCoin.name}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-bold">${selectedCoin.price.toLocaleString()}</div>
                  <div className={`text-sm ${selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setTradeType('buy'); setAmount(''); setInputMode('usdt'); }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    tradeType === 'buy' ? 'bg-green-500 text-black' : 'bg-[#2d3748] text-gray-400 hover:text-white'
                  }`}
                >
                  Comprar
                </button>
                <button
                  onClick={() => { setTradeType('sell'); setAmount(''); setInputMode('crypto'); }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    tradeType === 'sell' ? 'bg-red-500 text-white' : 'bg-[#2d3748] text-gray-400 hover:text-white'
                  }`}
                >
                  Vender
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

              {/* Input Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInputMode('usdt')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'usdt' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-[#2d3748] text-gray-400'
                  }`}
                >
                  Ingresar en USDT
                </button>
                <button
                  onClick={() => setInputMode('crypto')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'crypto' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-[#2d3748] text-gray-400'
                  }`}
                >
                  Ingresar en {selectedCoin.symbol}
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">
                    {tradeType === 'buy' ? 'Pagas' : 'Vendes'} ({inputMode === 'usdt' ? 'USDT' : selectedCoin.symbol})
                  </label>
                  <span className="text-sm text-gray-400">
                    Disponible: {tradeType === 'buy' 
                      ? `$${usdtBalance.toFixed(2)} USDT`
                      : `${getCryptoBalance(selectedCoin.id).toFixed(8)} ${selectedCoin.symbol}`
                    }
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input text-lg pr-20"
                    placeholder="0.00"
                    min="0"
                    step={inputMode === 'usdt' ? '0.01' : '0.00000001'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {inputMode === 'usdt' ? 'USDT' : selectedCoin.symbol}
                  </span>
                </div>
              </div>

              {/* Quick percentages */}
              <div className="flex gap-2 mb-4">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setPercentage(pct)}
                    className="flex-1 py-2 bg-[#2d3748] rounded text-sm hover:bg-[#3d4758] transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="bg-[#0a0e17] rounded-lg p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {tradeType === 'buy' ? 'Pagas' : 'Vendes'}
                  </span>
                  <span className="text-xl font-bold">
                    {tradeType === 'buy' 
                      ? `$${getUsdtAmount().toFixed(2)} USDT`
                      : `${getCryptoAmount().toFixed(8)} ${selectedCoin.symbol}`
                    }
                  </span>
                </div>
                <div className="border-t border-[#2d3748]"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {tradeType === 'buy' ? 'Recibes' : 'Recibes'}
                  </span>
                  <span className="text-xl font-bold text-green-400">
                    {tradeType === 'buy'
                      ? `${getCryptoAmount().toFixed(8)} ${selectedCoin.symbol}`
                      : `$${getUsdtAmount().toFixed(2)} USDT`
                    }
                  </span>
                </div>
              </div>

              <button
                onClick={handleTrade}
                disabled={tradeLoading || !amount || parseFloat(amount) <= 0}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                  tradeType === 'buy'
                    ? 'bg-green-500 text-black hover:bg-green-400 disabled:bg-green-500/50'
                    : 'bg-red-500 text-white hover:bg-red-400 disabled:bg-red-500/50'
                } disabled:cursor-not-allowed`}
              >
                {tradeLoading ? 'Procesando...' : tradeType === 'buy' ? `Comprar ${selectedCoin.symbol}` : `Vender ${selectedCoin.symbol}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}