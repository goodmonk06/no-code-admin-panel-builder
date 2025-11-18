import { z } from 'zod'

// Connection validation schemas
export const ConnectionConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1, 'Database name is required'),
  user: z.string().min(1, 'User is required'),
  password: z.string().min(1, 'Password is required'),
  ssl: z.boolean().optional().default(false),
})

export const CreateConnectionSchema = z.object({
  name: z.string().min(1, 'Connection name is required').max(255),
  type: z.enum(['postgres']),
  config: ConnectionConfigSchema,
})

// Entity validation schemas
export const UpdateEntitySchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  fieldsJson: z.any().optional(), // Will be validated as JSON array
  permissionsJson: z.any().optional(), // Will be validated as JSON object
})

// Data query validation
export const DataQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  pageSize: z.string().optional().transform(val => parseInt(val || '20', 10)),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['ASC', 'DESC']).optional().default('ASC'),
})

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>
export type CreateConnectionInput = z.infer<typeof CreateConnectionSchema>
export type UpdateEntityInput = z.infer<typeof UpdateEntitySchema>
export type DataQueryInput = z.infer<typeof DataQuerySchema>
