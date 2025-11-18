import type { ConnectionConfig, DbType, IntrospectedTable, FieldConfig, PermissionsConfig } from '@/lib/types'
import { PostgresIntrospector } from './postgres'

export function createIntrospector(type: DbType, config: ConnectionConfig) {
  switch (type) {
    case 'postgres':
      return new PostgresIntrospector(config)
    default:
      throw new Error(`Unsupported database type: ${type}`)
  }
}

export function generateDefaultFieldConfigs(columns: any[]): FieldConfig[] {
  return columns.map(col => ({
    name: col.name,
    type: col.type,
    label: formatLabel(col.name),
    required: !col.nullable && !col.defaultValue,
    primaryKey: col.primaryKey,
    foreignKey: col.foreignKey,
    visible: {
      list: col.primaryKey || !col.name.includes('password'),
      detail: true,
      edit: !col.primaryKey, // Don't show PK in edit form (usually auto-generated)
    },
    editable: !col.primaryKey && !col.name.includes('created_at') && !col.name.includes('updated_at'),
  }))
}

export function generateDefaultPermissions(): PermissionsConfig {
  return {
    admin: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
    editor: {
      read: true,
      create: true,
      update: true,
      delete: false,
    },
    viewer: {
      read: true,
      create: false,
      update: false,
      delete: false,
    },
  }
}

function formatLabel(fieldName: string): string {
  // Convert snake_case or camelCase to Title Case
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
