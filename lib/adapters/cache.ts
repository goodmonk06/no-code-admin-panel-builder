import type { ICacheAdapter } from './types'

// In-memory cache adapter
export class InMemoryCacheAdapter implements ICacheAdapter {
  private cache: Map<string, { value: any; expiresAt?: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined
    this.cache.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Redis cache adapter (future implementation)
export class RedisCacheAdapter implements ICacheAdapter {
  constructor(private redisUrl: string) {}

  async get<T = any>(key: string): Promise<T | null> {
    // TODO: Implement Redis get
    console.log('[Redis] Would get:', key)
    return null
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // TODO: Implement Redis set
    console.log('[Redis] Would set:', key, 'with TTL:', ttl)
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement Redis delete
    console.log('[Redis] Would delete:', key)
  }

  async clear(pattern?: string): Promise<void> {
    // TODO: Implement Redis clear with pattern
    console.log('[Redis] Would clear:', pattern || 'all')
  }

  async has(key: string): Promise<boolean> {
    // TODO: Implement Redis exists
    console.log('[Redis] Would check exists:', key)
    return false
  }
}

// Factory for creating cache adapters
export function createCacheAdapter(
  type: 'memory' | 'redis',
  config?: any
): ICacheAdapter {
  switch (type) {
    case 'memory':
      return new InMemoryCacheAdapter()
    case 'redis':
      return new RedisCacheAdapter(config.url)
    default:
      return new InMemoryCacheAdapter()
  }
}
