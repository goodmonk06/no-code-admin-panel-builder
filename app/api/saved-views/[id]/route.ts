import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, noContentResponse, ApiException } from '@/lib/api-response'
import { z } from 'zod'

const UpdateSavedViewSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  filtersJson: z.any().optional(),
  sortJson: z.any().optional(),
  columnsJson: z.any().optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

// GET /api/saved-views/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const view = await prisma.savedView.findUnique({
      where: { id: params.id },
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

    if (!view) {
      throw new ApiException('Saved view not found', 404, 'SAVED_VIEW_NOT_FOUND')
    }

    return successResponse(view)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/saved-views/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = UpdateSavedViewSchema.parse(body)

    const existing = await prisma.savedView.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      throw new ApiException('Saved view not found', 404, 'SAVED_VIEW_NOT_FOUND')
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.savedView.updateMany({
        where: {
          userId: existing.userId,
          entityId: existing.entityId,
          isDefault: true,
          id: { not: params.id },
        },
        data: {
          isDefault: false,
        },
      })
    }

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.filtersJson) updateData.filtersJson = JSON.stringify(data.filtersJson)
    if (data.sortJson) updateData.sortJson = JSON.stringify(data.sortJson)
    if (data.columnsJson) updateData.columnsJson = JSON.stringify(data.columnsJson)
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic

    const view = await prisma.savedView.update({
      where: { id: params.id },
      data: updateData,
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

    return successResponse(view)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/saved-views/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.savedView.delete({
      where: { id: params.id },
    })

    return noContentResponse()
  } catch (error) {
    return handleApiError(error)
  }
}
