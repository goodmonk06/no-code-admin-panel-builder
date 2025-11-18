import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse } from '@/lib/api-response'
import { z } from 'zod'

const AuditQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  pageSize: z.string().optional().transform(val => parseInt(val || '50', 10)),
  userId: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  from: z.string().optional().transform(val => val ? new Date(val) : undefined),
  to: z.string().optional().transform(val => val ? new Date(val) : undefined),
})

// GET /api/audit-logs - List audit logs with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const query = AuditQuerySchema.parse(queryParams)

    const where: any = {}

    if (query.userId) where.userId = query.userId
    if (query.entityId) where.entityId = query.entityId
    if (query.action) where.action = query.action
    if (query.entityType) where.entityType = query.entityType

    if (query.from || query.to) {
      where.createdAt = {}
      if (query.from) where.createdAt.gte = query.from
      if (query.to) where.createdAt.lte = query.to
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
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
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ])

    return successResponse({
      data: logs,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
