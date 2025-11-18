import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, createdResponse, ApiException } from '@/lib/api-response'
import { z } from 'zod'

const CreateSavedViewSchema = z.object({
  userId: z.string(),
  entityId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  filtersJson: z.any(),
  sortJson: z.any().optional(),
  columnsJson: z.any().optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

// GET /api/saved-views - List saved views
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const entityId = searchParams.get('entityId')

    const where: any = {}
    if (userId) where.userId = userId
    if (entityId) where.entityId = entityId

    const views = await prisma.savedView.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        entity: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return successResponse(views)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/saved-views - Create a saved view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateSavedViewSchema.parse(body)

    // If setting as default, unset other defaults for this user/entity
    if (data.isDefault) {
      await prisma.savedView.updateMany({
        where: {
          userId: data.userId,
          entityId: data.entityId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const view = await prisma.savedView.create({
      data: {
        userId: data.userId,
        entityId: data.entityId,
        name: data.name,
        description: data.description,
        filtersJson: JSON.stringify(data.filtersJson),
        sortJson: data.sortJson ? JSON.stringify(data.sortJson) : null,
        columnsJson: data.columnsJson ? JSON.stringify(data.columnsJson) : null,
        isDefault: data.isDefault || false,
        isPublic: data.isPublic || false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        entity: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    })

    return createdResponse(view, 'Saved view created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
