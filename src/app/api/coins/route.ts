import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar todas las monedas (público)
export async function GET() {
  try {
    const coins = await prisma.coin.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' }
    })

    return NextResponse.json({ coins })
  } catch (error) {
    console.error('Error fetching coins:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// POST - Crear nueva moneda (solo admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { symbol, name, logoUrl, price } = body

    if (!symbol || !name) {
      return NextResponse.json(
        { error: 'Símbolo y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que no exista
    const existing = await prisma.coin.findUnique({
      where: { symbol: symbol.toUpperCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una moneda con ese símbolo' },
        { status: 400 }
      )
    }

    const coin = await prisma.coin.create({
      data: {
        symbol: symbol.toUpperCase(),
        name,
        logoUrl: logoUrl || null,
        price: price || 0,
        change24h: 0,
        isActive: true
      }
    })

    return NextResponse.json({ coin })
  } catch (error) {
    console.error('Error creating coin:', error)
    return NextResponse.json({ error: 'Error al crear moneda' }, { status: 500 })
  }
}
