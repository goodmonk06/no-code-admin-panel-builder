import { describe, it, expect } from 'vitest'
import {
  ConnectionConfigSchema,
  CreateConnectionSchema,
  UpdateEntitySchema,
  DataQuerySchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('ConnectionConfigSchema', () => {
    it('should validate a valid connection config', () => {
      const validConfig = {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        ssl: false,
      }

      const result = ConnectionConfigSchema.parse(validConfig)
      expect(result).toEqual(validConfig)
    })

    it('should reject invalid port', () => {
      const invalidConfig = {
        host: 'localhost',
        port: 99999, // Invalid port
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      expect(() => ConnectionConfigSchema.parse(invalidConfig)).toThrow()
    })

    it('should reject missing required fields', () => {
      const invalidConfig = {
        host: 'localhost',
        port: 5432,
        // missing database, user, password
      }

      expect(() => ConnectionConfigSchema.parse(invalidConfig)).toThrow()
    })

    it('should default ssl to false', () => {
      const config = {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      }

      const result = ConnectionConfigSchema.parse(config)
      expect(result.ssl).toBe(false)
    })
  })

  describe('CreateConnectionSchema', () => {
    it('should validate a valid create connection request', () => {
      const validRequest = {
        name: 'My Database',
        type: 'postgres' as const,
        config: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'admin',
          password: 'secret',
        },
      }

      const result = CreateConnectionSchema.parse(validRequest)
      expect(result.name).toBe('My Database')
      expect(result.type).toBe('postgres')
    })

    it('should reject empty connection name', () => {
      const invalidRequest = {
        name: '',
        type: 'postgres' as const,
        config: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'admin',
          password: 'secret',
        },
      }

      expect(() => CreateConnectionSchema.parse(invalidRequest)).toThrow()
    })

    it('should reject invalid database type', () => {
      const invalidRequest = {
        name: 'My Database',
        type: 'mysql', // Not supported yet
        config: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'admin',
          password: 'secret',
        },
      }

      expect(() => CreateConnectionSchema.parse(invalidRequest)).toThrow()
    })
  })

  describe('DataQuerySchema', () => {
    it('should parse and transform query parameters', () => {
      const queryParams = {
        page: '2',
        pageSize: '50',
        orderBy: 'created_at',
        orderDirection: 'DESC' as const,
      }

      const result = DataQuerySchema.parse(queryParams)
      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(50)
      expect(result.orderBy).toBe('created_at')
      expect(result.orderDirection).toBe('DESC')
    })

    it('should use defaults for missing params', () => {
      const result = DataQuerySchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
      expect(result.orderDirection).toBe('ASC')
    })

    it('should reject invalid order direction', () => {
      const invalidParams = {
        orderDirection: 'INVALID',
      }

      expect(() => DataQuerySchema.parse(invalidParams)).toThrow()
    })
  })

  describe('UpdateEntitySchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        displayName: 'Updated Name',
      }

      const result = UpdateEntitySchema.parse(partialUpdate)
      expect(result.displayName).toBe('Updated Name')
      expect(result.fieldsJson).toBeUndefined()
    })

    it('should allow all fields to be updated', () => {
      const fullUpdate = {
        displayName: 'New Name',
        fieldsJson: [{ name: 'id', type: 'number' }],
        permissionsJson: { admin: { read: true } },
      }

      const result = UpdateEntitySchema.parse(fullUpdate)
      expect(result.displayName).toBe('New Name')
      expect(result.fieldsJson).toBeDefined()
      expect(result.permissionsJson).toBeDefined()
    })
  })
})
