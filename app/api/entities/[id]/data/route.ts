import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIntrospector } from '@/lib/introspection'
import type { ConnectionConfig } from '@/lib/types'

// GET /api/entities/:id/data - Query data from the target database
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const orderBy = searchParams.get('orderBy') || undefined
    const orderDirection = (searchParams.get('orderDirection') || 'ASC') as 'ASC' | 'DESC'

    const entity = await prisma.entityConfig.findUnique({
      where: { id: params.id },
      include: { connection: true },
    })

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const offset = (page - 1) * pageSize
    const data = await introspector.queryData(entity.tableName, {
      limit: pageSize,
      offset,
      orderBy,
      orderDirection,
    })

    const total = await introspector.countRows(entity.tableName)
    await introspector.close()

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/entities/:id/data - Create a new row
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const entity = await prisma.entityConfig.findUnique({
      where: { id: params.id },
      include: { connection: true },
    })

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const newRow = await introspector.insertRow(entity.tableName, body)
    await introspector.close()

    return NextResponse.json(newRow, { status: 201 })
  } catch (error) {
    console.error('Failed to create row:', error)
    return NextResponse.json(
      { error: 'Failed to create row', details: (error as Error).message },
      { status: 500 }
    )
  }
}
