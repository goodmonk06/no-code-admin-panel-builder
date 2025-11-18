import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIntrospector } from '@/lib/introspection'
import type { ConnectionConfig, FieldConfig } from '@/lib/types'

// GET /api/entities/:id/data/:rowId - Get a single row
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; rowId: string } }
) {
  try {
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

    const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
    const primaryKey = fields.find(f => f.primaryKey)

    if (!primaryKey) {
      return NextResponse.json(
        { error: 'No primary key found for this entity' },
        { status: 400 }
      )
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const row = await introspector.getRowById(entity.tableName, primaryKey.name, params.rowId)
    await introspector.close()

    if (!row) {
      return NextResponse.json(
        { error: 'Row not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(row)
  } catch (error) {
    console.error('Failed to fetch row:', error)
    return NextResponse.json(
      { error: 'Failed to fetch row', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH /api/entities/:id/data/:rowId - Update a row
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; rowId: string } }
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

    const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
    const primaryKey = fields.find(f => f.primaryKey)

    if (!primaryKey) {
      return NextResponse.json(
        { error: 'No primary key found for this entity' },
        { status: 400 }
      )
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const updatedRow = await introspector.updateRow(
      entity.tableName,
      primaryKey.name,
      params.rowId,
      body
    )
    await introspector.close()

    return NextResponse.json(updatedRow)
  } catch (error) {
    console.error('Failed to update row:', error)
    return NextResponse.json(
      { error: 'Failed to update row', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE /api/entities/:id/data/:rowId - Delete a row
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; rowId: string } }
) {
  try {
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

    const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
    const primaryKey = fields.find(f => f.primaryKey)

    if (!primaryKey) {
      return NextResponse.json(
        { error: 'No primary key found for this entity' },
        { status: 400 }
      )
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const success = await introspector.deleteRow(
      entity.tableName,
      primaryKey.name,
      params.rowId
    )
    await introspector.close()

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete row' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete row:', error)
    return NextResponse.json(
      { error: 'Failed to delete row', details: (error as Error).message },
      { status: 500 }
    )
  }
}
