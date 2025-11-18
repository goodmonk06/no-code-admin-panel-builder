// Type definitions for the admin panel

export type DbType = 'postgres' // extendable to mysql, etc.

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface ConnectionConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
}

export interface FieldConfig {
  name: string
  type: string // text, number, boolean, date, etc.
  label: string
  required: boolean
  primaryKey: boolean
  foreignKey?: {
    table: string
    column: string
  }
  visible: {
    list: boolean
    detail: boolean
    edit: boolean
  }
  editable: boolean
}

export interface PermissionsConfig {
  admin: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  editor: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  viewer: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
}

export interface ListLayoutConfig {
  columns: string[] // field names to show
  defaultSort?: {
    field: string
    order: 'asc' | 'desc'
  }
  filters?: Array<{
    field: string
    type: 'text' | 'select' | 'date'
  }>
  pageSize: number
}

export interface DetailLayoutConfig {
  fields: string[] // field names to show
  sections?: Array<{
    title: string
    fields: string[]
  }>
}

export interface EditLayoutConfig {
  fields: string[] // field names to show
  sections?: Array<{
    title: string
    fields: string[]
  }>
}

export type LayoutConfig = ListLayoutConfig | DetailLayoutConfig | EditLayoutConfig

export interface IntrospectedTable {
  tableName: string
  columns: IntrospectedColumn[]
}

export interface IntrospectedColumn {
  name: string
  type: string
  nullable: boolean
  defaultValue: any
  primaryKey: boolean
  foreignKey?: {
    table: string
    column: string
  }
}
