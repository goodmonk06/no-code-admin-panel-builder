import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIntrospector } from '@/lib/introspection'
import { CreateConnectionSchema } from '@/lib/validations'
import { handleApiError, successResponse, createdResponse, ApiException } from '@/lib/api-response'

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

    return successResponse(connections)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/connections - Create a new connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateConnectionSchema.parse(body)

    // Test the connection before saving
    const introspector = createIntrospector(validatedData.type, validatedData.config)
    const isValid = await introspector.testConnection()
    await introspector.close()

    if (!isValid) {
      throw new ApiException(
        'Failed to connect to database with provided credentials',
        400,
        'CONNECTION_TEST_FAILED'
      )
    }

    // Save the connection
    const connection = await prisma.connection.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        configJson: JSON.stringify(validatedData.config),
      },
    })

    return createdResponse(connection, 'Connection created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
