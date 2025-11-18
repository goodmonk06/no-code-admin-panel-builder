// Base adapter interface types for extensibility

export interface INotificationAdapter {
  send(notification: Notification): Promise<void>
  sendBatch(notifications: Notification[]): Promise<void>
}

export interface Notification {
  to: string | string[]
  subject?: string
  message: string
  priority?: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

export interface IStorageAdapter {
  upload(file: File): Promise<string>
  download(url: string): Promise<Blob>
  delete(url: string): Promise<void>
  getSignedUrl(url: string, expiresIn?: number): Promise<string>
}

export interface File {
  name: string
  mimeType: string
  buffer: Buffer
  metadata?: Record<string, any>
}

export interface IAuthAdapter {
  validateToken(token: string): Promise<AuthUser | null>
  generateToken(user: AuthUser): Promise<string>
  refreshToken(token: string): Promise<string>
  revokeToken(token: string): Promise<void>
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
  metadata?: Record<string, any>
}

export interface ICacheAdapter {
  get<T = any>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(pattern?: string): Promise<void>
  has(key: string): Promise<boolean>
}

export interface IMetricsAdapter {
  recordCounter(name: string, value?: number, labels?: Record<string, string>): void
  recordGauge(name: string, value: number, labels?: Record<string, string>): void
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void
  flush(): Promise<void>
}

export interface IQueueAdapter {
  enqueue(queue: string, job: QueueJob): Promise<string>
  dequeue(queue: string): Promise<QueueJob | null>
  getStatus(jobId: string): Promise<QueueJobStatus>
  cancel(jobId: string): Promise<void>
}

export interface QueueJob {
  id?: string
  type: string
  payload: any
  priority?: number
  delay?: number
  attempts?: number
  metadata?: Record<string, any>
}

export interface QueueJobStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  attempts: number
  error?: string
  result?: any
  createdAt: Date
  completedAt?: Date
}
