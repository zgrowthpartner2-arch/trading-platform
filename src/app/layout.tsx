import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradePro | Plataforma de Trading USDT',
  description: 'Plataforma de trading con sistema de referidos multinivel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0a0e17]">
        {children}
      </body>
    </html>
  )
}
