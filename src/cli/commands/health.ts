import { prisma } from '../../../lib/prisma'
import { logger } from '../../../lib/logger'

export async function healthCommand() {
  try {
    logger.info('🏥 Checking system health...')

    // Check database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`
      logger.info('✅ Database: Connected')
    } catch (error) {
      logger.error('❌ Database: Connection failed', {
        error: (error as Error).message,
      })
    }

    // Check record counts
    const [
      connectionCount,
      entityCount,
      userCount,
      auditLogCount,
    ] = await Promise.all([
      prisma.connection.count(),
      prisma.entityConfig.count(),
      prisma.user.count(),
      prisma.auditLog.count(),
    ])

    logger.info('📊 Database Statistics:', {
      connections: connectionCount,
      entities: entityCount,
      users: userCount,
      auditLogs: auditLogCount,
    })

    // Check for archived records
    const archivedConnections = await prisma.connection.count({
      where: { archivedAt: { not: null } },
    })

    const archivedEntities = await prisma.entityConfig.count({
      where: { archivedAt: { not: null } },
    })

    if (archivedConnections > 0 || archivedEntities > 0) {
      logger.info('🗄️  Archived Records:', {
        connections: archivedConnections,
        entities: archivedEntities,
      })
    }

    logger.info('✅ Health check complete!')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Health check failed:', {
      error: (error as Error).message,
    })
    process.exit(1)
  }
}
