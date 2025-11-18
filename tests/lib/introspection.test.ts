import { describe, it, expect } from 'vitest'
import { generateDefaultFieldConfigs, generateDefaultPermissions } from '@/lib/introspection'

describe('Introspection Helpers', () => {
  describe('generateDefaultFieldConfigs', () => {
    it('should generate field configs from columns', () => {
      const columns = [
        {
          name: 'id',
          type: 'number',
          nullable: false,
          defaultValue: null,
          primaryKey: true,
        },
        {
          name: 'email',
          type: 'text',
          nullable: false,
          defaultValue: null,
          primaryKey: false,
        },
        {
          name: 'password',
          type: 'text',
          nullable: false,
          defaultValue: null,
          primaryKey: false,
        },
        {
          name: 'created_at',
          type: 'datetime',
          nullable: false,
          defaultValue: 'now()',
          primaryKey: false,
        },
      ]

      const fieldConfigs = generateDefaultFieldConfigs(columns)

      expect(fieldConfigs).toHaveLength(4)

      // ID field should not be editable
      const idField = fieldConfigs.find(f => f.name === 'id')
      expect(idField?.editable).toBe(false)
      expect(idField?.primaryKey).toBe(true)
      expect(idField?.visible.edit).toBe(false)

      // Password field should not be visible in list
      const passwordField = fieldConfigs.find(f => f.name === 'password')
      expect(passwordField?.visible.list).toBe(false)

      // Created_at should not be editable
      const createdAtField = fieldConfigs.find(f => f.name === 'created_at')
      expect(createdAtField?.editable).toBe(false)

      // Email should be editable and visible
      const emailField = fieldConfigs.find(f => f.name === 'email')
      expect(emailField?.editable).toBe(true)
      expect(emailField?.visible.list).toBe(true)
    })

    it('should format labels correctly', () => {
      const columns = [
        {
          name: 'first_name',
          type: 'text',
          nullable: false,
          defaultValue: null,
          primaryKey: false,
        },
        {
          name: 'totalAmount',
          type: 'number',
          nullable: true,
          defaultValue: null,
          primaryKey: false,
        },
      ]

      const fieldConfigs = generateDefaultFieldConfigs(columns)

      expect(fieldConfigs[0].label).toBe('First Name')
      expect(fieldConfigs[1].label).toBe('Total Amount')
    })

    it('should handle foreign keys', () => {
      const columns = [
        {
          name: 'user_id',
          type: 'number',
          nullable: false,
          defaultValue: null,
          primaryKey: false,
          foreignKey: {
            table: 'users',
            column: 'id',
          },
        },
      ]

      const fieldConfigs = generateDefaultFieldConfigs(columns)

      expect(fieldConfigs[0].foreignKey).toEqual({
        table: 'users',
        column: 'id',
      })
    })
  })

  describe('generateDefaultPermissions', () => {
    it('should generate default permissions for all roles', () => {
      const permissions = generateDefaultPermissions()

      expect(permissions).toHaveProperty('admin')
      expect(permissions).toHaveProperty('editor')
      expect(permissions).toHaveProperty('viewer')
    })

    it('should give admin full permissions', () => {
      const permissions = generateDefaultPermissions()

      expect(permissions.admin).toEqual({
        read: true,
        create: true,
        update: true,
        delete: true,
      })
    })

    it('should give editor limited permissions', () => {
      const permissions = generateDefaultPermissions()

      expect(permissions.editor).toEqual({
        read: true,
        create: true,
        update: true,
        delete: false,
      })
    })

    it('should give viewer read-only permissions', () => {
      const permissions = generateDefaultPermissions()

      expect(permissions.viewer).toEqual({
        read: true,
        create: false,
        update: false,
        delete: false,
      })
    })
  })
})
