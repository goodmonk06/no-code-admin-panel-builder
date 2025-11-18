// Export all adapter types and implementations
export * from './types'
export * from './notification'
export * from './cache'
export * from './metrics'

// Adapter registry for dependency injection
import type {
  INotificationAdapter,
  ICacheAdapter,
  IMetricsAdapter,
} from './types'

class AdapterRegistry {
  private notification: INotificationAdapter | null = null
  private cache: ICacheAdapter | null = null
  private metrics: IMetricsAdapter | null = null

  setNotificationAdapter(adapter: INotificationAdapter): void {
    this.notification = adapter
  }

  getNotificationAdapter(): INotificationAdapter {
    if (!this.notification) {
      throw new Error('Notification adapter not initialized')
    }
    return this.notification
  }

  setCacheAdapter(adapter: ICacheAdapter): void {
    this.cache = adapter
  }

  getCacheAdapter(): ICacheAdapter {
    if (!this.cache) {
      throw new Error('Cache adapter not initialized')
    }
    return this.cache
  }

  setMetricsAdapter(adapter: IMetricsAdapter): void {
    this.metrics = adapter
  }

  getMetricsAdapter(): IMetricsAdapter {
    if (!this.metrics) {
      throw new Error('Metrics adapter not initialized')
    }
    return this.metrics
  }
}

export const adapters = new AdapterRegistry()
