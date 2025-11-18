export * from './types'
export * from './event-bus'
export * from './handlers/audit-log-handler'
export * from './handlers/webhook-handler'

// Auto-register default handlers
import { eventBus } from './event-bus'
import { AuditLogHandler } from './handlers/audit-log-handler'
import { WebhookHandler } from './handlers/webhook-handler'

// Register audit log handler for all events
const auditHandler = new AuditLogHandler()
eventBus.subscribe('connection.created', auditHandler)
eventBus.subscribe('connection.updated', auditHandler)
eventBus.subscribe('connection.deleted', auditHandler)
eventBus.subscribe('connection.introspected', auditHandler)
eventBus.subscribe('entity.created', auditHandler)
eventBus.subscribe('entity.updated', auditHandler)
eventBus.subscribe('entity.deleted', auditHandler)
eventBus.subscribe('data.row.created', auditHandler)
eventBus.subscribe('data.row.updated', auditHandler)
eventBus.subscribe('data.row.deleted', auditHandler)

// Register webhook handler for all events
const webhookHandler = new WebhookHandler()
eventBus.subscribe('connection.created', webhookHandler)
eventBus.subscribe('connection.updated', webhookHandler)
eventBus.subscribe('entity.created', webhookHandler)
eventBus.subscribe('data.row.created', webhookHandler)
eventBus.subscribe('data.row.updated', webhookHandler)
eventBus.subscribe('data.row.deleted', webhookHandler)
