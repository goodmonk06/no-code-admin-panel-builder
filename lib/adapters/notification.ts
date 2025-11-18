import type { INotificationAdapter, Notification } from './types'

// In-memory notification adapter (stub implementation)
export class InMemoryNotificationAdapter implements INotificationAdapter {
  private notifications: Notification[] = []

  async send(notification: Notification): Promise<void> {
    console.log('[Notification]', notification)
    this.notifications.push(notification)
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    console.log('[Notifications Batch]', notifications.length, 'notifications')
    this.notifications.push(...notifications)
  }

  getNotifications(): Notification[] {
    return this.notifications
  }

  clear(): void {
    this.notifications = []
  }
}

// Email notification adapter (future implementation)
export class EmailNotificationAdapter implements INotificationAdapter {
  constructor(
    private config: {
      host: string
      port: number
      user: string
      password: string
      from: string
    }
  ) {}

  async send(notification: Notification): Promise<void> {
    // TODO: Implement actual email sending (nodemailer, sendgrid, etc.)
    console.log('[Email] Would send:', notification)
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    // TODO: Implement batch email sending
    console.log('[Email Batch] Would send:', notifications.length, 'emails')
  }
}

// Slack notification adapter (future implementation)
export class SlackNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(notification: Notification): Promise<void> {
    // TODO: Implement Slack webhook
    console.log('[Slack] Would send:', notification)
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    for (const notification of notifications) {
      await this.send(notification)
    }
  }
}

// Factory for creating notification adapters
export function createNotificationAdapter(
  type: 'memory' | 'email' | 'slack',
  config?: any
): INotificationAdapter {
  switch (type) {
    case 'memory':
      return new InMemoryNotificationAdapter()
    case 'email':
      return new EmailNotificationAdapter(config)
    case 'slack':
      return new SlackNotificationAdapter(config.webhookUrl)
    default:
      return new InMemoryNotificationAdapter()
  }
}
