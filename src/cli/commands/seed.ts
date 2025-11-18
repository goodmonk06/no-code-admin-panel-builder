import { prisma } from '../../../lib/prisma'
import { logger } from '../../../lib/logger'

export async function seedCommand(options: { clear?: boolean }) {
  try {
    logger.info('🌱 Starting database seed...')

    if (options.clear) {
      logger.warn('⚠️  Clearing existing data...')
      // Clear in correct order due to foreign keys
      await prisma.webhookDelivery.deleteMany()
      await prisma.webhook.deleteMany()
      await prisma.comment.deleteMany()
      await prisma.entityTag.deleteMany()
      await prisma.tag.deleteMany()
      await prisma.savedView.deleteMany()
      await prisma.dataTemplate.deleteMany()
      await prisma.auditLog.deleteMany()
      await prisma.viewConfig.deleteMany()
      await prisma.entityConfig.deleteMany()
      await prisma.connection.deleteMany()
      await prisma.apiKey.deleteMany()
      await prisma.user.deleteMany()
      logger.info('✓ Cleared existing data')
    }

    // Import and run the seed script
    const { main } = await import('../../../prisma/seed')
    await main()

    logger.info('✅ Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Seed failed:', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    })
    process.exit(1)
  }
}
