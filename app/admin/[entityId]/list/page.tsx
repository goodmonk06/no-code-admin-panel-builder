'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import FieldRenderer from '@/components/FieldRenderer'
import type { FieldConfig, ListLayoutConfig } from '@/lib/types'

interface EntityConfig {
  id: string
  tableName: string
  displayName: string
  fieldsJson: string
  connection: {
    id: string
    name: string
  }
  views: Array<{
    id: string
    type: string
    layoutJson: string
  }>
}

export default function EntityListPage() {
  const params = useParams()
  const entityId = params.entityId as string

  const [entity, setEntity] = useState<EntityConfig | null>(null)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchEntity()
  }, [entityId])

  useEffect(() => {
    if (entity) {
      fetchData()
    }
  }, [entity, page])

  const fetchEntity = async () => {
    try {
      const res = await fetch(`/api/entities/${entityId}`)
      const data = await res.json()
      setEntity(data)
    } catch (error) {
      console.error('Failed to fetch entity:', error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const listView = entity?.views.find(v => v.type === 'list')
      const layout = listView ? JSON.parse(listView.layoutJson) as ListLayoutConfig : null

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: layout?.pageSize?.toString() || '20',
      })

      if (layout?.defaultSort) {
        params.append('orderBy', layout.defaultSort.field)
        params.append('orderDirection', layout.defaultSort.order.toUpperCase())
      }

      const res = await fetch(`/api/entities/${entityId}/data?${params}`)
      const result = await res.json()
      setData(result.data)
      setPagination(result.pagination)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (rowId: any) => {
    if (!confirm('Are you sure you want to delete this row?')) {
      return
    }

    try {
      const res = await fetch(`/api/entities/${entityId}/data/${rowId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      } else {
        alert('Failed to delete row')
      }
    } catch (error) {
      console.error('Failed to delete row:', error)
      alert('Failed to delete row')
    }
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
  const listView = entity.views.find(v => v.type === 'list')
  const layout = listView ? JSON.parse(listView.layoutJson) as ListLayoutConfig : null
  const displayFields = layout?.columns.map(col => fields.find(f => f.name === col)).filter(Boolean) || []
  const primaryKey = fields.find(f => f.primaryKey)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Link href="/connections" className="hover:text-indigo-600">
                Connections
              </Link>
              <span>/</span>
              <span>{entity.connection.name}</span>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{entity.displayName}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {entity.displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {pagination?.total || 0} records
            </p>
          </div>
          <Link href={`/admin/${entityId}/edit/new`}>
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              Add New
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No records found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding your first record
            </p>
            <Link href={`/admin/${entityId}/edit/new`}>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add New
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {displayFields.map((field) => (
                        <th
                          key={field!.name}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {field!.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row) => {
                      const rowId = primaryKey ? row[primaryKey.name] : null
                      return (
                        <tr key={rowId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          {displayFields.map((field) => (
                            <td key={field!.name} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <FieldRenderer
                                field={field!}
                                value={row[field!.name]}
                                mode="list"
                              />
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                            <Link href={`/admin/${entityId}/detail/${rowId}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/${entityId}/edit/${rowId}`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(rowId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
