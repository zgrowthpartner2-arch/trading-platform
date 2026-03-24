import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Obtener moneda específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const coin = await prisma.coin.findUnique({
      where: { id }
    })

    if (!coin) {
      return NextResponse.json({ error: 'Moneda no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ coin })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// PUT - Actualizar moneda (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { symbol, name, logoUrl, price, change24h, isActive } = body

    const coin = await prisma.coin.update({
      where: { id },
      data: {
        ...(symbol && { symbol: symbol.toUpperCase() }),
        ...(name && { name }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(price !== undefined && { price }),
        ...(change24h !== undefined && { change24h }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ coin })
  } catch (error) {
    console.error('Error updating coin:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE - Eliminar moneda (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params

    // Soft delete - solo desactivar
    await prisma.coin.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coin:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
