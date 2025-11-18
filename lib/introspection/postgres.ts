import { Pool } from 'pg'
import type { ConnectionConfig, IntrospectedTable, IntrospectedColumn } from '@/lib/types'

export class PostgresIntrospector {
  private pool: Pool

  constructor(config: ConnectionConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 1, // Only need one connection for introspection
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect()
      await client.query('SELECT 1')
      client.release()
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  async introspectTables(): Promise<IntrospectedTable[]> {
    const client = await this.pool.connect()
    try {
      // Get all tables in public schema
      const tablesQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `
      const tablesResult = await client.query(tablesQuery)

      const tables: IntrospectedTable[] = []

      for (const row of tablesResult.rows) {
        const tableName = row.table_name
        const columns = await this.introspectColumns(client, tableName)
        tables.push({ tableName, columns })
      }

      return tables
    } finally {
      client.release()
    }
  }

  private async introspectColumns(client: any, tableName: string): Promise<IntrospectedColumn[]> {
    // Get column information
    const columnsQuery = `
      SELECT
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.udt_name,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
          AND tc.table_schema = ku.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = $1
          AND tc.table_schema = 'public'
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position
    `
    const columnsResult = await client.query(columnsQuery, [tableName])

    // Get foreign key information
    const fkQuery = `
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
    `
    const fkResult = await client.query(fkQuery, [tableName])

    const foreignKeys = new Map<string, { table: string; column: string }>()
    for (const fkRow of fkResult.rows) {
      foreignKeys.set(fkRow.column_name, {
        table: fkRow.foreign_table_name,
        column: fkRow.foreign_column_name,
      })
    }

    return columnsResult.rows.map(row => ({
      name: row.column_name,
      type: this.mapPostgresType(row.data_type, row.udt_name),
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
      primaryKey: row.is_primary_key,
      foreignKey: foreignKeys.get(row.column_name),
    }))
  }

  private mapPostgresType(dataType: string, udtName: string): string {
    // Map PostgreSQL types to our generic types
    const typeMap: Record<string, string> = {
      'character varying': 'text',
      'varchar': 'text',
      'text': 'text',
      'char': 'text',
      'character': 'text',
      'integer': 'number',
      'int': 'number',
      'int4': 'number',
      'bigint': 'number',
      'int8': 'number',
      'smallint': 'number',
      'int2': 'number',
      'decimal': 'number',
      'numeric': 'number',
      'real': 'number',
      'double precision': 'number',
      'float4': 'number',
      'float8': 'number',
      'boolean': 'boolean',
      'bool': 'boolean',
      'date': 'date',
      'timestamp': 'datetime',
      'timestamp without time zone': 'datetime',
      'timestamp with time zone': 'datetime',
      'timestamptz': 'datetime',
      'time': 'time',
      'json': 'json',
      'jsonb': 'json',
      'uuid': 'uuid',
    }

    return typeMap[dataType] || typeMap[udtName] || 'text'
  }

  async queryData(tableName: string, options: {
    limit?: number
    offset?: number
    orderBy?: string
    orderDirection?: 'ASC' | 'DESC'
    where?: Record<string, any>
  } = {}): Promise<any[]> {
    const client = await this.pool.connect()
    try {
      let query = `SELECT * FROM "${tableName}"`
      const params: any[] = []
      let paramIndex = 1

      // Add WHERE clause
      if (options.where && Object.keys(options.where).length > 0) {
        const conditions = Object.entries(options.where)
          .map(([key, value]) => {
            params.push(value)
            return `"${key}" = $${paramIndex++}`
          })
        query += ` WHERE ${conditions.join(' AND ')}`
      }

      // Add ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY "${options.orderBy}" ${options.orderDirection || 'ASC'}`
      }

      // Add LIMIT and OFFSET
      if (options.limit) {
        query += ` LIMIT $${paramIndex++}`
        params.push(options.limit)
      }
      if (options.offset) {
        query += ` OFFSET $${paramIndex++}`
        params.push(options.offset)
      }

      const result = await client.query(query, params)
      return result.rows
    } finally {
      client.release()
    }
  }

  async getRowById(tableName: string, idColumn: string, id: any): Promise<any | null> {
    const client = await this.pool.connect()
    try {
      const query = `SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1 LIMIT 1`
      const result = await client.query(query, [id])
      return result.rows[0] || null
    } finally {
      client.release()
    }
  }

  async insertRow(tableName: string, data: Record<string, any>): Promise<any> {
    const client = await this.pool.connect()
    try {
      const columns = Object.keys(data)
      const values = Object.values(data)
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

      const query = `
        INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `

      const result = await client.query(query, values)
      return result.rows[0]
    } finally {
      client.release()
    }
  }

  async updateRow(tableName: string, idColumn: string, id: any, data: Record<string, any>): Promise<any> {
    const client = await this.pool.connect()
    try {
      const entries = Object.entries(data)
      const setClause = entries.map(([key], i) => `"${key}" = $${i + 1}`).join(', ')
      const values = [...entries.map(([, value]) => value), id]

      const query = `
        UPDATE "${tableName}"
        SET ${setClause}
        WHERE "${idColumn}" = $${entries.length + 1}
        RETURNING *
      `

      const result = await client.query(query, values)
      return result.rows[0]
    } finally {
      client.release()
    }
  }

  async deleteRow(tableName: string, idColumn: string, id: any): Promise<boolean> {
    const client = await this.pool.connect()
    try {
      const query = `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1`
      const result = await client.query(query, [id])
      return result.rowCount !== null && result.rowCount > 0
    } finally {
      client.release()
    }
  }

  async countRows(tableName: string, where?: Record<string, any>): Promise<number> {
    const client = await this.pool.connect()
    try {
      let query = `SELECT COUNT(*) as count FROM "${tableName}"`
      const params: any[] = []

      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where)
          .map(([key, value], i) => {
            params.push(value)
            return `"${key}" = $${i + 1}`
          })
        query += ` WHERE ${conditions.join(' AND ')}`
      }

      const result = await client.query(query, params)
      return parseInt(result.rows[0].count, 10)
    } finally {
      client.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
