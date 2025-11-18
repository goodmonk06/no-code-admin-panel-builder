import { cuid } from '@paralleldrive/cuid2'
import type { AnyDomainEvent, EventHandler, EventBus } from './types'
import { logger } from '../logger'

class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()

  async publish(event: AnyDomainEvent): Promise<void> {
    // Ensure event has required fields
    if (!event.id) {
      (event as any).id = cuid()
    }
    if (!event.timestamp) {
      (event as any).timestamp = new Date()
    }

    logger.info(`[EventBus] Publishing event: ${event.type}`, {
      eventId: event.id,
      eventType: event.type,
    })

    const handlers = this.handlers.get(event.type)
    if (!handlers || handlers.size === 0) {
      logger.debug(`[EventBus] No handlers registered for: ${event.type}`)
      return
    }

    // Execute all handlers
    const promises: Promise<void>[] = []
    for (const handler of handlers) {
      promises.push(
        Promise.resolve(handler.handle(event)).catch((error) => {
          logger.error(`[EventBus] Handler error for ${event.type}`, {
            eventId: event.id,
            error: error.message,
            stack: error.stack,
          })
        })
      )
    }

    await Promise.all(promises)
  }

  subscribe<T extends AnyDomainEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }

    this.handlers.get(eventType)!.add(handler as EventHandler)

    logger.debug(`[EventBus] Subscribed handler to: ${eventType}`)

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler as EventHandler)
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
      logger.debug(`[EventBus] Unsubscribed handler from: ${eventType}`)
    }
  }

  getHandlerCount(eventType?: string): number {
    if (eventType) {
      return this.handlers.get(eventType)?.size || 0
    }
    let total = 0
    for (const handlers of this.handlers.values()) {
      total += handlers.size
    }
    return total
  }

  clear(): void {
    this.handlers.clear()
    logger.debug('[EventBus] Cleared all handlers')
  }
}

// Singleton instance
export const eventBus = new InMemoryEventBus()

// Helper to create events with proper structure
export function createEvent<T extends AnyDomainEvent>(
  type: T['type'],
  data: Omit<T, 'id' | 'type' | 'timestamp'>
): T {
  return {
    id: cuid(),
    type,
    timestamp: new Date(),
    ...data,
  } as T
}
