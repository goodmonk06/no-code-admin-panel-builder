import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, createdResponse } from '@/lib/api-response'
import { z } from 'zod'

const CreateWebhookSchema = z.object({
  connectionId: z.string().optional(),
  name: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  active: z.boolean().optional(),
  metadata: z.any().optional(),
})

// GET /api/webhooks - List webhooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')

    const where: any = {}
    if (connectionId) where.connectionId = connectionId

    const webhooks = await prisma.webhook.findMany({
      where,
      include: {
        connection: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(webhooks)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/webhooks - Create a webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateWebhookSchema.parse(body)

    const webhook = await prisma.webhook.create({
      data: {
        connectionId: data.connectionId,
        name: data.name,
        url: data.url,
        events: JSON.stringify(data.events),
        secret: data.secret,
        active: data.active !== undefined ? data.active : true,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    return createdResponse(webhook, 'Webhook created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
