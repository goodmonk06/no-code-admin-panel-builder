// Domain event types

export interface DomainEvent {
  id: string
  type: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

// Connection events
export interface ConnectionCreatedEvent extends DomainEvent {
  type: 'connection.created'
  connectionId: string
  connectionName: string
}

export interface ConnectionUpdatedEvent extends DomainEvent {
  type: 'connection.updated'
  connectionId: string
  changes: Record<string, any>
}

export interface ConnectionDeletedEvent extends DomainEvent {
  type: 'connection.deleted'
  connectionId: string
}

export interface ConnectionIntrospectedEvent extends DomainEvent {
  type: 'connection.introspected'
  connectionId: string
  tablesFound: number
}

// Entity events
export interface EntityCreatedEvent extends DomainEvent {
  type: 'entity.created'
  entityId: string
  tableName: string
}

export interface EntityUpdatedEvent extends DomainEvent {
  type: 'entity.updated'
  entityId: string
  changes: Record<string, any>
}

export interface EntityDeletedEvent extends DomainEvent {
  type: 'entity.deleted'
  entityId: string
}

// Data events
export interface DataRowCreatedEvent extends DomainEvent {
  type: 'data.row.created'
  entityId: string
  rowId: string
  data: Record<string, any>
}

export interface DataRowUpdatedEvent extends DomainEvent {
  type: 'data.row.updated'
  entityId: string
  rowId: string
  changes: Record<string, any>
}

export interface DataRowDeletedEvent extends DomainEvent {
  type: 'data.row.deleted'
  entityId: string
  rowId: string
}

// Webhook events
export interface WebhookTriggeredEvent extends DomainEvent {
  type: 'webhook.triggered'
  webhookId: string
  eventType: string
  payload: any
}

// Union type of all events
export type AnyDomainEvent =
  | ConnectionCreatedEvent
  | ConnectionUpdatedEvent
  | ConnectionDeletedEvent
  | ConnectionIntrospectedEvent
  | EntityCreatedEvent
  | EntityUpdatedEvent
  | EntityDeletedEvent
  | DataRowCreatedEvent
  | DataRowUpdatedEvent
  | DataRowDeletedEvent
  | WebhookTriggeredEvent

// Event handler interface
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void> | void
}

// Event bus interface
export interface EventBus {
  publish(event: AnyDomainEvent): Promise<void>
  subscribe<T extends AnyDomainEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): () => void
  unsubscribe(eventType: string, handler: EventHandler): void
}
