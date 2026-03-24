import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e17] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#2d3748]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold gradient-text">TradePro</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="btn-secondary">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">Trading activo 24/7</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Trading de <span className="gradient-text">USDT</span> con
              <br />
              <span className="gradient-text">Ganancias Multinivel</span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Opera, refiere y gana. Nuestra plataforma te permite hacer trading 
              simulado y ganar comisiones por tu red de referidos en 3 niveles.
            </p>

            <div className="flex gap-4 justify-center mb-16">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Comenzar Ahora
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                Ya tengo cuenta
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="card text-center">
                <div className="text-3xl font-bold gradient-text mb-2">10%</div>
                <div className="text-gray-400">Comisión Nivel 1</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold gradient-text mb-2">5%</div>
                <div className="text-gray-400">Comisión Nivel 2</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold gradient-text mb-2">2%</div>
                <div className="text-gray-400">Comisión Nivel 3</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <div className="card group hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Wallet USDT</h3>
              <p className="text-gray-400">
                Deposita, retira y transfiere USDT de forma segura entre usuarios de la plataforma.
              </p>
            </div>

            <div className="card group hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Trading Simulado</h3>
              <p className="text-gray-400">
                Practica trading con precios simulados. Compra y vende sin riesgo real.
              </p>
            </div>

            <div className="card group hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Red de Referidos</h3>
              <p className="text-gray-400">
                Gana comisiones de 3 niveles por las operaciones de tu red de referidos.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#2d3748]/50 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500">
            <p>© 2024 TradePro. Plataforma de trading simulado con fines educativos.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
