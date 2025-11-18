import type { EventHandler, AnyDomainEvent } from '../types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Audit log handler - records all events to the audit log
 */
export class AuditLogHandler implements EventHandler<AnyDomainEvent> {
  async handle(event: AnyDomainEvent): Promise<void> {
    try {
      const auditData: any = {
        action: event.type,
        entityType: this.getEntityType(event.type),
        metadata: JSON.stringify(event.metadata || {}),
        userId: event.userId,
        createdAt: event.timestamp,
      }

      // Extract specific fields based on event type
      if ('connectionId' in event) {
        auditData.connectionId = event.connectionId
      }
      if ('entityId' in event) {
        auditData.entityId = event.entityId
      }
      if ('rowId' in event) {
        auditData.recordId = event.rowId
      }
      if ('changes' in event) {
        auditData.changes = JSON.stringify(event.changes)
      }

      await prisma.auditLog.create({ data: auditData })

      logger.debug(`[AuditLog] Recorded event: ${event.type}`, {
        eventId: event.id,
      })
    } catch (error) {
      logger.error('[AuditLog] Failed to record event', {
        eventType: event.type,
        eventId: event.id,
        error: (error as Error).message,
      })
    }
  }

  private getEntityType(eventType: string): string {
    if (eventType.startsWith('connection.')) return 'connection'
    if (eventType.startsWith('entity.')) return 'entity'
    if (eventType.startsWith('data.row.')) return 'data_row'
    if (eventType.startsWith('webhook.')) return 'webhook'
    return 'unknown'
  }
}
