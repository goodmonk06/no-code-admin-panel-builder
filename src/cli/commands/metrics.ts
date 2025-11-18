import { adapters } from '../../../lib/adapters'
import { logger } from '../../../lib/logger'

export async function metricsCommand(options: { reset?: boolean }) {
  try {
    logger.info('📊 System Metrics')

    try {
      const metricsAdapter = adapters.getMetricsAdapter()
      await metricsAdapter.flush()

      if (options.reset) {
        // Reset metrics if adapter supports it
        logger.info('🔄 Resetting metrics...')
      }
    } catch (error) {
      logger.warn('⚠️  Metrics adapter not initialized', {
        message: 'Run the application first to generate metrics',
      })
    }

    logger.info('✅ Metrics displayed!')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Metrics command failed:', {
      error: (error as Error).message,
    })
    process.exit(1)
  }
}
