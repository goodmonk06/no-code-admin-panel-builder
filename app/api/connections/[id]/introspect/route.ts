import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIntrospector, generateDefaultFieldConfigs, generateDefaultPermissions } from '@/lib/introspection'
import type { ConnectionConfig } from '@/lib/types'

// POST /api/connections/:id/introspect - Introspect database and create EntityConfigs
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await prisma.connection.findUnique({
      where: { id: params.id },
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    const config = JSON.parse(connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(connection.type as any, config)

    // Introspect all tables
    const tables = await introspector.introspectTables()
    await introspector.close()

    // Create EntityConfig for each table
    const entities = []
    for (const table of tables) {
      const fieldConfigs = generateDefaultFieldConfigs(table.columns)
      const permissions = generateDefaultPermissions()

      // Check if entity already exists
      const existing = await prisma.entityConfig.findUnique({
        where: {
          connectionId_tableName: {
            connectionId: connection.id,
            tableName: table.tableName,
          },
        },
      })

      if (existing) {
        // Update existing
        const updated = await prisma.entityConfig.update({
          where: { id: existing.id },
          data: {
            fieldsJson: JSON.stringify(fieldConfigs),
            permissionsJson: JSON.stringify(permissions),
          },
        })
        entities.push(updated)
      } else {
        // Create new
        const entity = await prisma.entityConfig.create({
          data: {
            connectionId: connection.id,
            tableName: table.tableName,
            displayName: formatDisplayName(table.tableName),
            fieldsJson: JSON.stringify(fieldConfigs),
            permissionsJson: JSON.stringify(permissions),
          },
        })

        // Create default view configs
        await createDefaultViews(entity.id, fieldConfigs)

        entities.push(entity)
      }
    }

    return NextResponse.json({
      success: true,
      tablesFound: tables.length,
      entities,
    })
  } catch (error) {
    console.error('Failed to introspect database:', error)
    return NextResponse.json(
      { error: 'Failed to introspect database', details: (error as Error).message },
      { status: 500 }
    )
  }
}

async function createDefaultViews(entityId: string, fields: any[]) {
  const listColumns = fields
    .filter(f => f.visible.list)
    .map(f => f.name)
    .slice(0, 5) // Show first 5 columns in list view

  const primaryKey = fields.find(f => f.primaryKey)

  // List view
  await prisma.viewConfig.create({
    data: {
      entityId,
      type: 'list',
      layoutJson: JSON.stringify({
        columns: listColumns,
        defaultSort: primaryKey ? {
          field: primaryKey.name,
          order: 'asc',
        } : undefined,
        pageSize: 20,
      }),
    },
  })

  // Detail view
  await prisma.viewConfig.create({
    data: {
      entityId,
      type: 'detail',
      layoutJson: JSON.stringify({
        fields: fields.filter(f => f.visible.detail).map(f => f.name),
      }),
    },
  })

  // Edit view
  await prisma.viewConfig.create({
    data: {
      entityId,
      type: 'edit',
      layoutJson: JSON.stringify({
        fields: fields.filter(f => f.visible.edit).map(f => f.name),
      }),
    },
  })
}

function formatDisplayName(tableName: string): string {
  return tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}
