// Structured logging utility

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  child(defaultContext: LogContext): Logger
}

class ConsoleLogger implements Logger {
  constructor(private defaultContext: LogContext = {}) {}

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  child(defaultContext: LogContext): Logger {
    return new ConsoleLogger({ ...this.defaultContext, ...defaultContext })
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const mergedContext = { ...this.defaultContext, ...context }

    const logEntry = {
      timestamp,
      level,
      message,
      ...mergedContext,
    }

    // In development, use console methods with colors
    if (process.env.NODE_ENV === 'development') {
      const contextStr = Object.keys(mergedContext).length > 0
        ? JSON.stringify(mergedContext, null, 2)
        : ''

      switch (level) {
        case 'debug':
          console.debug(`🔍 [${timestamp}] ${message}`, contextStr ? `\n${contextStr}` : '')
          break
        case 'info':
          console.info(`ℹ️  [${timestamp}] ${message}`, contextStr ? `\n${contextStr}` : '')
          break
        case 'warn':
          console.warn(`⚠️  [${timestamp}] ${message}`, contextStr ? `\n${contextStr}` : '')
          break
        case 'error':
          console.error(`❌ [${timestamp}] ${message}`, contextStr ? `\n${contextStr}` : '')
          break
      }
    } else {
      // In production, output JSON for log aggregation
      console.log(JSON.stringify(logEntry))
    }
  }
}

// Singleton logger instance
export const logger = new ConsoleLogger()

// Helper to create request-scoped loggers
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({
    requestId,
    userId,
  })
}

// Helper to create correlation ID
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
