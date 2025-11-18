# Integration Recipes

This document provides practical recipes for integrating the No-Code Admin Panel Builder with common services and systems in a larger ecosystem.

## Table of Contents

- [Authentication Integration](#authentication-integration)
- [Notification Services](#notification-services)
- [Caching Layer](#caching-layer)
- [Metrics & Monitoring](#metrics--monitoring)
- [Webhook Integration](#webhook-integration)
- [Multi-Service Architecture](#multi-service-architecture)

---

## Authentication Integration

### JWT-Based Authentication

Integrate with a centralized authentication service using JWT tokens.

**Step 1: Create Auth Adapter**

```typescript
// lib/adapters/auth-jwt.ts
import type { IAuthAdapter, AuthUser } from './types'
import jwt from 'jsonwebtoken'

export class JWTAuthAdapter implements IAuthAdapter {
  constructor(
    private secret: string,
    private expiresIn: string = '24h'
  ) {}

  async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, this.secret) as any
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      }
    } catch {
      return null
    }
  }

  async generateToken(user: AuthUser): Promise<string> {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      this.secret,
      { expiresIn: this.expiresIn }
    )
  }

  async refreshToken(token: string): Promise<string> {
    const user = await this.validateToken(token)
    if (!user) throw new Error('Invalid token')
    return this.generateToken(user)
  }

  async revokeToken(token: string): Promise<void> {
    // Store in blacklist (Redis recommended)
  }
}
```

**Step 2: Middleware Integration**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adapters } from './lib/adapters'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const authAdapter = adapters.getAuthAdapter()
  const user = await authAdapter.validateToken(token)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add user to request headers for API routes
  const response = NextResponse.next()
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-role', user.role)

  return response
}
```

### OAuth Integration

Connect with OAuth providers (Google, GitHub, etc.).

```typescript
// Example OAuth flow
import { OAuthProvider } from '@auth/core/providers/oauth'

export const authConfig = {
  providers: [
    OAuthProvider({
      id: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Create or update user in admin panel
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: {
          email: user.email,
          name: user.name,
          role: 'viewer', // Default role
        },
      })
      return true
    },
  },
}
```

---

## Notification Services

### Email Integration (SendGrid)

```typescript
// lib/adapters/notification-sendgrid.ts
import sgMail from '@sendgrid/mail'
import type { INotificationAdapter, Notification } from './types'

export class SendGridNotificationAdapter implements INotificationAdapter {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey)
  }

  async send(notification: Notification): Promise<void> {
    await sgMail.send({
      to: notification.to,
      from: process.env.FROM_EMAIL!,
      subject: notification.subject || 'Notification',
      text: notification.message,
      html: `<p>${notification.message}</p>`,
    })
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    const messages = notifications.map(n => ({
      to: n.to,
      from: process.env.FROM_EMAIL!,
      subject: n.subject || 'Notification',
      text: n.message,
    }))
    await sgMail.send(messages)
  }
}
```

### Slack Integration

```typescript
// lib/adapters/notification-slack.ts
export class SlackNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(notification: Notification): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: notification.message,
        channel: notification.metadata?.channel,
        username: 'Admin Panel Bot',
        icon_emoji: ':robot_face:',
      }),
    })
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    for (const notification of notifications) {
      await this.send(notification)
    }
  }
}
```

---

## Caching Layer

### Redis Integration

```typescript
// lib/adapters/cache-redis.ts
import { Redis } from 'ioredis'
import type { ICacheAdapter } from './types'

export class RedisCacheAdapter implements ICacheAdapter {
  private client: Redis

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl)
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await this.client.setex(key, ttl, serialized)
    } else {
      await this.client.set(key, serialized)
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key)
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
    } else {
      await this.client.flushdb()
    }
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(key)
    return exists === 1
  }
}
```

**Usage Pattern:**

```typescript
// Cache entity configs
const entityId = 'abc123'
const cacheKey = `entity:${entityId}`

let entity = await cache.get(cacheKey)
if (!entity) {
  entity = await prisma.entityConfig.findUnique({
    where: { id: entityId },
  })
  await cache.set(cacheKey, entity, 3600) // Cache for 1 hour
}
```

---

## Metrics & Monitoring

### Prometheus Integration

```typescript
// lib/adapters/metrics-prometheus.ts
import promClient from 'prom-client'
import type { IMetricsAdapter } from './types'

export class PrometheusMetricsAdapter implements IMetricsAdapter {
  private counters: Map<string, promClient.Counter> = new Map()
  private gauges: Map<string, promClient.Gauge> = new Map()
  private histograms: Map<string, promClient.Histogram> = new Map()

  constructor() {
    // Enable default metrics
    promClient.collectDefaultMetrics()
  }

  recordCounter(
    name: string,
    value: number = 1,
    labels?: Record<string, string>
  ): void {
    let counter = this.counters.get(name)
    if (!counter) {
      counter = new promClient.Counter({
        name,
        help: `Counter for ${name}`,
        labelNames: labels ? Object.keys(labels) : [],
      })
      this.counters.set(name, counter)
    }
    counter.inc(labels || {}, value)
  }

  recordGauge(
    name: string,
    value: number,
    labels?: Record<string, string>
  ): void {
    let gauge = this.gauges.get(name)
    if (!gauge) {
      gauge = new promClient.Gauge({
        name,
        help: `Gauge for ${name}`,
        labelNames: labels ? Object.keys(labels) : [],
      })
      this.gauges.set(name, gauge)
    }
    gauge.set(labels || {}, value)
  }

  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>
  ): void {
    let histogram = this.histograms.get(name)
    if (!histogram) {
      histogram = new promClient.Histogram({
        name,
        help: `Histogram for ${name}`,
        labelNames: labels ? Object.keys(labels) : [],
      })
      this.histograms.set(name, histogram)
    }
    histogram.observe(labels || {}, value)
  }

  async flush(): Promise<void> {
    // Metrics are automatically exposed via /metrics endpoint
  }

  getRegistry(): promClient.Registry {
    return promClient.register
  }
}
```

**Metrics Endpoint:**

```typescript
// app/api/metrics/route.ts
import { adapters } from '@/lib/adapters'

export async function GET() {
  const metricsAdapter = adapters.getMetricsAdapter() as PrometheusMetricsAdapter
  const metrics = await metricsAdapter.getRegistry().metrics()

  return new Response(metrics, {
    headers: {
      'Content-Type': metricsAdapter.getRegistry().contentType,
    },
  })
}
```

---

## Webhook Integration

### Receiving Webhooks from External Services

```typescript
// app/api/webhooks/external/route.ts
import { NextRequest } from 'next/server'
import { eventBus, createEvent } from '@/lib/events'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-webhook-signature')
  const body = await request.json()

  // Verify signature
  if (!verifySignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Transform external event to internal event
  const event = createEvent('data.row.created', {
    entityId: body.entity_id,
    rowId: body.id,
    data: body.data,
  })

  await eventBus.publish(event)

  return new Response('OK')
}
```

### Sending Webhooks to External Services

```typescript
// lib/services/webhook-delivery.ts
import crypto from 'crypto'

export async function deliverWebhook(
  webhook: Webhook,
  event: DomainEvent
): Promise<void> {
  const payload = JSON.stringify({
    event: event.type,
    timestamp: event.timestamp.toISOString(),
    data: event,
  })

  const signature = webhook.secret
    ? crypto.createHmac('sha256', webhook.secret).update(payload).digest('hex')
    : undefined

  const response = await fetch(webhook.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(signature ? { 'X-Webhook-Signature': signature } : {}),
    },
    body: payload,
  })

  // Record delivery
  await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      eventType: event.type,
      payload,
      statusCode: response.status,
      response: await response.text(),
      deliveredAt: new Date(),
    },
  })
}
```

---

## Multi-Service Architecture

### Service-to-Service Communication

When the admin panel is part of a larger microservices ecosystem:

**Scenario: User Service Updates**

```typescript
// Listen to user update events from user service
eventBus.subscribe('user.updated', async (event) => {
  // Update local user cache
  await prisma.user.update({
    where: { id: event.userId },
    data: { name: event.data.name },
  })
})
```

**Scenario: Broadcasting Admin Panel Events**

```typescript
// When data changes in admin panel, notify other services
eventBus.subscribe('data.row.updated', async (event) => {
  // Send to message queue (RabbitMQ, Kafka, etc.)
  await messageQueue.publish('admin-panel.events', {
    type: event.type,
    entityId: event.entityId,
    rowId: event.rowId,
    changes: event.changes,
  })
})
```

### Shared Database Access

Multiple services accessing the same target database:

```typescript
// Use advisory locks to prevent conflicts
import { Pool } from 'pg'

async function withAdvisoryLock<T>(
  pool: Pool,
  lockId: number,
  fn: () => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('SELECT pg_advisory_lock($1)', [lockId])
    return await fn()
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [lockId])
    client.release()
  }
}

// Usage
await withAdvisoryLock(pool, 123, async () => {
  // Perform sensitive operation
  await updateCriticalData()
})
```

---

## Complete Integration Example

Putting it all together:

```typescript
// lib/initialize-adapters.ts
import { adapters } from './adapters'
import { JWTAuthAdapter } from './adapters/auth-jwt'
import { RedisCacheAdapter } from './adapters/cache-redis'
import { PrometheusMetricsAdapter } from './adapters/metrics-prometheus'
import { SendGridNotificationAdapter } from './adapters/notification-sendgrid'

export function initializeAdapters() {
  // Auth
  adapters.setAuthAdapter(
    new JWTAuthAdapter(process.env.JWT_SECRET!)
  )

  // Cache
  adapters.setCacheAdapter(
    new RedisCacheAdapter(process.env.REDIS_URL!)
  )

  // Metrics
  adapters.setMetricsAdapter(
    new PrometheusMetricsAdapter()
  )

  // Notifications
  adapters.setNotificationAdapter(
    new SendGridNotificationAdapter(process.env.SENDGRID_API_KEY!)
  )
}

// Call in app initialization
initializeAdapters()
```

---

## Best Practices

1. **Adapter Pattern**: Always use adapters for external services to maintain flexibility
2. **Event-Driven**: Use the event bus for cross-service communication
3. **Caching**: Cache frequently accessed data (entity configs, view configs)
4. **Monitoring**: Instrument all critical operations with metrics
5. **Error Handling**: Always handle errors gracefully in event handlers
6. **Idempotency**: Make webhook handlers idempotent
7. **Validation**: Validate all external inputs
8. **Rate Limiting**: Protect your APIs from abuse
9. **Logging**: Use structured logging with correlation IDs
10. **Testing**: Test integrations with mocks and stubs

---

## Further Reading

- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [Microservices Communication Patterns](https://microservices.io/patterns/communication-style/messaging.html)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
