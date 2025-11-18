'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Edit } from 'lucide-react'
import Button from '@/components/ui/Button'
import FieldRenderer from '@/components/FieldRenderer'
import type { FieldConfig, DetailLayoutConfig } from '@/lib/types'

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

export default function EntityDetailPage() {
  const params = useParams()
  const entityId = params.entityId as string
  const rowId = params.rowId as string

  const [entity, setEntity] = useState<EntityConfig | null>(null)
  const [row, setRow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntity()
  }, [entityId])

  useEffect(() => {
    if (entity) {
      fetchRow()
    }
  }, [entity, rowId])

  const fetchEntity = async () => {
    try {
      const res = await fetch(`/api/entities/${entityId}`)
      const data = await res.json()
      setEntity(data)
    } catch (error) {
      console.error('Failed to fetch entity:', error)
    }
  }

  const fetchRow = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/entities/${entityId}/data/${rowId}`)
      const data = await res.json()
      setRow(data)
    } catch (error) {
      console.error('Failed to fetch row:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!entity || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!row) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Record not found</div>
      </div>
    )
  }

  const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
  const detailView = entity.views.find(v => v.type === 'detail')
  const layout = detailView ? JSON.parse(detailView.layoutJson) as DetailLayoutConfig : null
  const displayFields = layout?.fields.map(col => fields.find(f => f.name === col)).filter(Boolean) || fields

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/admin/${entityId}/list`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {entity.displayName} Details
            </h1>
          </div>
          <Link href={`/admin/${entityId}/edit/${rowId}`}>
            <Button>
              <Edit className="h-5 w-5 mr-2" />
              Edit
            </Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayFields.map((field) => (
                <div key={field!.name} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {field!.label}
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    <FieldRenderer
                      field={field!}
                      value={row[field!.name]}
                      mode="detail"
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
