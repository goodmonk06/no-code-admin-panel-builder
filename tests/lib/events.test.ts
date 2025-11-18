import { describe, it, expect, beforeEach } from 'vitest'
import { eventBus, createEvent } from '@/lib/events/event-bus'
import type { EventHandler, ConnectionCreatedEvent } from '@/lib/events/types'

describe('Event Bus', () => {
  beforeEach(() => {
    eventBus.clear()
  })

  it('should publish and handle events', async () => {
    let handledEvent: ConnectionCreatedEvent | null = null

    const handler: EventHandler<ConnectionCreatedEvent> = {
      handle: async (event) => {
        handledEvent = event
      },
    }

    eventBus.subscribe('connection.created', handler)

    const event = createEvent<ConnectionCreatedEvent>('connection.created', {
      connectionId: '123',
      connectionName: 'Test Connection',
    })

    await eventBus.publish(event)

    expect(handledEvent).not.toBeNull()
    expect(handledEvent?.connectionId).toBe('123')
    expect(handledEvent?.type).toBe('connection.created')
  })

  it('should support multiple handlers for the same event', async () => {
    let handler1Called = false
    let handler2Called = false

    const handler1: EventHandler = {
      handle: async () => {
        handler1Called = true
      },
    }

    const handler2: EventHandler = {
      handle: async () => {
        handler2Called = true
      },
    }

    eventBus.subscribe('connection.created', handler1)
    eventBus.subscribe('connection.created', handler2)

    const event = createEvent<ConnectionCreatedEvent>('connection.created', {
      connectionId: '123',
      connectionName: 'Test',
    })

    await eventBus.publish(event)

    expect(handler1Called).toBe(true)
    expect(handler2Called).toBe(true)
  })

  it('should allow unsubscribing handlers', async () => {
    let handlerCalled = false

    const handler: EventHandler = {
      handle: async () => {
        handlerCalled = true
      },
    }

    const unsubscribe = eventBus.subscribe('connection.created', handler)
    unsubscribe()

    const event = createEvent<ConnectionCreatedEvent>('connection.created', {
      connectionId: '123',
      connectionName: 'Test',
    })

    await eventBus.publish(event)

    expect(handlerCalled).toBe(false)
  })

  it('should handle errors in event handlers gracefully', async () => {
    const errorHandler: EventHandler = {
      handle: async () => {
        throw new Error('Handler error')
      },
    }

    let successHandlerCalled = false
    const successHandler: EventHandler = {
      handle: async () => {
        successHandlerCalled = true
      },
    }

    eventBus.subscribe('connection.created', errorHandler)
    eventBus.subscribe('connection.created', successHandler)

    const event = createEvent<ConnectionCreatedEvent>('connection.created', {
      connectionId: '123',
      connectionName: 'Test',
    })

    // Should not throw
    await expect(eventBus.publish(event)).resolves.not.toThrow()

    // Success handler should still be called
    expect(successHandlerCalled).toBe(true)
  })

  it('should auto-generate event ID and timestamp', () => {
    const event = createEvent<ConnectionCreatedEvent>('connection.created', {
      connectionId: '123',
      connectionName: 'Test',
    })

    expect(event.id).toBeDefined()
    expect(event.timestamp).toBeInstanceOf(Date)
  })
})
