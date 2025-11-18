import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/entities - List all entity configs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')

    const where = connectionId ? { connectionId } : {}

    const entities = await prisma.entityConfig.findMany({
      where,
      include: {
        connection: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        views: true,
      },
      orderBy: { displayName: 'asc' },
    })

    return NextResponse.json(entities)
  } catch (error) {
    console.error('Failed to fetch entities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    )
  }
}
