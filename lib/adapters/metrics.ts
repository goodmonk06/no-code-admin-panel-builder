import type { IMetricsAdapter } from './types'

// In-memory metrics adapter
export class InMemoryMetricsAdapter implements IMetricsAdapter {
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()

  recordCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)
  }

  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels)
    this.gauges.set(key, value)
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels)
    const values = this.histograms.get(key) || []
    values.push(value)
    this.histograms.set(key, values)
  }

  async flush(): Promise<void> {
    console.log('[Metrics] Counters:', Object.fromEntries(this.counters))
    console.log('[Metrics] Gauges:', Object.fromEntries(this.gauges))
    console.log('[Metrics] Histograms:', Object.fromEntries(this.histograms))
  }

  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms),
    }
  }

  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }

  private buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',')
    return `${name}{${labelStr}}`
  }
}

// Prometheus metrics adapter (future implementation)
export class PrometheusMetricsAdapter implements IMetricsAdapter {
  constructor(private pushGatewayUrl?: string) {}

  recordCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    // TODO: Implement Prometheus counter
    console.log('[Prometheus] Counter:', name, value, labels)
  }

  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    // TODO: Implement Prometheus gauge
    console.log('[Prometheus] Gauge:', name, value, labels)
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    // TODO: Implement Prometheus histogram
    console.log('[Prometheus] Histogram:', name, value, labels)
  }

  async flush(): Promise<void> {
    // TODO: Push metrics to Prometheus push gateway
    console.log('[Prometheus] Would flush metrics')
  }
}

// Factory for creating metrics adapters
export function createMetricsAdapter(
  type: 'memory' | 'prometheus',
  config?: any
): IMetricsAdapter {
  switch (type) {
    case 'memory':
      return new InMemoryMetricsAdapter()
    case 'prometheus':
      return new PrometheusMetricsAdapter(config?.pushGatewayUrl)
    default:
      return new InMemoryMetricsAdapter()
  }
}
