import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryCacheAdapter } from '@/lib/adapters/cache'
import { InMemoryMetricsAdapter } from '@/lib/adapters/metrics'
import { InMemoryNotificationAdapter } from '@/lib/adapters/notification'

describe('Cache Adapter', () => {
  let cache: InMemoryCacheAdapter

  beforeEach(() => {
    cache = new InMemoryCacheAdapter()
  })

  it('should store and retrieve values', async () => {
    await cache.set('key1', 'value1')
    const value = await cache.get('key1')
    expect(value).toBe('value1')
  })

  it('should return null for missing keys', async () => {
    const value = await cache.get('nonexistent')
    expect(value).toBeNull()
  })

  it('should respect TTL', async () => {
    await cache.set('key1', 'value1', 1) // 1 second TTL
    expect(await cache.get('key1')).toBe('value1')

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100))
    expect(await cache.get('key1')).toBeNull()
  })

  it('should delete keys', async () => {
    await cache.set('key1', 'value1')
    await cache.delete('key1')
    expect(await cache.get('key1')).toBeNull()
  })

  it('should check if key exists', async () => {
    await cache.set('key1', 'value1')
    expect(await cache.has('key1')).toBe(true)
    expect(await cache.has('key2')).toBe(false)
  })

  it('should clear all keys', async () => {
    await cache.set('key1', 'value1')
    await cache.set('key2', 'value2')
    await cache.clear()
    expect(await cache.get('key1')).toBeNull()
    expect(await cache.get('key2')).toBeNull()
  })

  it('should clear keys by pattern', async () => {
    await cache.set('user:1', 'data1')
    await cache.set('user:2', 'data2')
    await cache.set('post:1', 'data3')

    await cache.clear('user:')
    expect(await cache.get('user:1')).toBeNull()
    expect(await cache.get('user:2')).toBeNull()
    expect(await cache.get('post:1')).toBe('data3')
  })
})

describe('Metrics Adapter', () => {
  let metrics: InMemoryMetricsAdapter

  beforeEach(() => {
    metrics = new InMemoryMetricsAdapter()
  })

  it('should record counters', () => {
    metrics.recordCounter('requests', 1)
    metrics.recordCounter('requests', 2)

    const data = metrics.getMetrics()
    expect(data.counters['requests']).toBe(3)
  })

  it('should record gauges', () => {
    metrics.recordGauge('memory', 100)
    metrics.recordGauge('memory', 150)

    const data = metrics.getMetrics()
    expect(data.gauges['memory']).toBe(150)
  })

  it('should record histograms', () => {
    metrics.recordHistogram('latency', 10)
    metrics.recordHistogram('latency', 20)
    metrics.recordHistogram('latency', 30)

    const data = metrics.getMetrics()
    expect(data.histograms['latency']).toEqual([10, 20, 30])
  })

  it('should support labels', () => {
    metrics.recordCounter('requests', 1, { method: 'GET', status: '200' })
    metrics.recordCounter('requests', 1, { method: 'POST', status: '201' })

    const data = metrics.getMetrics()
    expect(data.counters['requests{method=GET,status=200}']).toBe(1)
    expect(data.counters['requests{method=POST,status=201}']).toBe(1)
  })

  it('should reset all metrics', () => {
    metrics.recordCounter('requests', 5)
    metrics.recordGauge('memory', 100)
    metrics.reset()

    const data = metrics.getMetrics()
    expect(Object.keys(data.counters)).toHaveLength(0)
    expect(Object.keys(data.gauges)).toHaveLength(0)
  })
})

describe('Notification Adapter', () => {
  let adapter: InMemoryNotificationAdapter

  beforeEach(() => {
    adapter = new InMemoryNotificationAdapter()
  })

  it('should send notifications', async () => {
    await adapter.send({
      to: 'user@example.com',
      message: 'Test message',
    })

    const notifications = adapter.getNotifications()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].to).toBe('user@example.com')
    expect(notifications[0].message).toBe('Test message')
  })

  it('should send batch notifications', async () => {
    await adapter.sendBatch([
      { to: 'user1@example.com', message: 'Message 1' },
      { to: 'user2@example.com', message: 'Message 2' },
    ])

    const notifications = adapter.getNotifications()
    expect(notifications).toHaveLength(2)
  })

  it('should clear notifications', async () => {
    await adapter.send({ to: 'user@example.com', message: 'Test' })
    adapter.clear()
    expect(adapter.getNotifications()).toHaveLength(0)
  })
})
