import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../../../lib/logger'

const execAsync = promisify(exec)

export async function migrateCommand(options: { reset?: boolean }) {
  try {
    logger.info('🔄 Running database migrations...')

    if (options.reset) {
      logger.warn('⚠️  Resetting database...')
      await execAsync('npx prisma migrate reset --force')
      logger.info('✓ Database reset complete')
    } else {
      await execAsync('npx prisma migrate deploy')
      logger.info('✓ Migrations applied')
    }

    // Generate Prisma Client
    await execAsync('npx prisma generate')
    logger.info('✓ Prisma Client generated')

    logger.info('✅ Migration complete!')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Migration failed:', {
      error: (error as Error).message,
    })
    process.exit(1)
  }
}
