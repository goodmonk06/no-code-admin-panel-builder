import type { EventHandler, AnyDomainEvent } from '../types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * Webhook handler - triggers webhooks when relevant events occur
 */
export class WebhookHandler implements EventHandler<AnyDomainEvent> {
  async handle(event: AnyDomainEvent): Promise<void> {
    try {
      // Find active webhooks that listen to this event type
      const webhooks = await prisma.webhook.findMany({
        where: {
          active: true,
          // Check if event type is in the webhook's events array
          // This is a simplified check - in production, parse JSON properly
        },
      })

      if (webhooks.length === 0) {
        return
      }

      // Trigger each webhook
      for (const webhook of webhooks) {
        const events = JSON.parse(webhook.events) as string[]
        if (events.includes(event.type) || events.includes('*')) {
          await this.triggerWebhook(webhook, event)
        }
      }
    } catch (error) {
      logger.error('[WebhookHandler] Failed to process webhooks', {
        eventType: event.type,
        error: (error as Error).message,
      })
    }
  }

  private async triggerWebhook(webhook: any, event: AnyDomainEvent): Promise<void> {
    try {
      const payload = {
        event: event.type,
        timestamp: event.timestamp.toISOString(),
        data: event,
      }

      // TODO: Implement actual HTTP request with retry logic
      logger.info(`[WebhookHandler] Would trigger webhook: ${webhook.name}`, {
        url: webhook.url,
        eventType: event.type,
      })

      // Record delivery attempt
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          eventType: event.type,
          payload: JSON.stringify(payload),
          attemptCount: 1,
          deliveredAt: new Date(),
        },
      })

      // Update last triggered timestamp
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { lastTriggeredAt: new Date() },
      })
    } catch (error) {
      logger.error('[WebhookHandler] Failed to trigger webhook', {
        webhookId: webhook.id,
        error: (error as Error).message,
      })

      // Record failed delivery
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          eventType: event.type,
          payload: JSON.stringify({ event }),
          error: (error as Error).message,
          attemptCount: 1,
        },
      })
    }
  }
}
