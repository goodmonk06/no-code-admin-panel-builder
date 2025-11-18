import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIntrospector } from '@/lib/introspection'
import type { ConnectionConfig } from '@/lib/types'

// GET /api/connections - List all connections
export async function GET() {
  try {
    const connections = await prisma.connection.findMany({
      include: {
        entities: {
          select: {
            id: true,
            tableName: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(connections)
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

// POST /api/connections - Create a new connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, config } = body

    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, config' },
        { status: 400 }
      )
    }

    // Test the connection before saving
    const introspector = createIntrospector(type, config as ConnectionConfig)
    const isValid = await introspector.testConnection()
    await introspector.close()

    if (!isValid) {
      return NextResponse.json(
        { error: 'Failed to connect to database with provided credentials' },
        { status: 400 }
      )
    }

    // Save the connection
    const connection = await prisma.connection.create({
      data: {
        name,
        type,
        configJson: JSON.stringify(config),
      },
    })

    return NextResponse.json(connection, { status: 201 })
  } catch (error) {
    console.error('Failed to create connection:', error)
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    )
  }
}
