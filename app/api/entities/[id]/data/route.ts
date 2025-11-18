import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIntrospector } from '@/lib/introspection'
import { DataQuerySchema } from '@/lib/validations'
import { handleApiError, successResponse, createdResponse, ApiException } from '@/lib/api-response'
import type { ConnectionConfig } from '@/lib/types'

// GET /api/entities/:id/data - Query data from the target database
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = DataQuerySchema.parse(queryParams)

    const entity = await prisma.entityConfig.findUnique({
      where: { id: params.id },
      include: { connection: true },
    })

    if (!entity) {
      throw new ApiException('Entity not found', 404, 'ENTITY_NOT_FOUND')
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const offset = (validatedQuery.page - 1) * validatedQuery.pageSize
    const data = await introspector.queryData(entity.tableName, {
      limit: validatedQuery.pageSize,
      offset,
      orderBy: validatedQuery.orderBy,
      orderDirection: validatedQuery.orderDirection,
    })

    const total = await introspector.countRows(entity.tableName)
    await introspector.close()

    return successResponse({
      data,
      pagination: {
        page: validatedQuery.page,
        pageSize: validatedQuery.pageSize,
        total,
        totalPages: Math.ceil(total / validatedQuery.pageSize),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/entities/:id/data - Create a new row
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    if (!body || Object.keys(body).length === 0) {
      throw new ApiException('Request body cannot be empty', 400, 'EMPTY_BODY')
    }

    const entity = await prisma.entityConfig.findUnique({
      where: { id: params.id },
      include: { connection: true },
    })

    if (!entity) {
      throw new ApiException('Entity not found', 404, 'ENTITY_NOT_FOUND')
    }

    const config = JSON.parse(entity.connection.configJson) as ConnectionConfig
    const introspector = createIntrospector(entity.connection.type as any, config)

    const newRow = await introspector.insertRow(entity.tableName, body)
    await introspector.close()

    return createdResponse(newRow, 'Row created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
