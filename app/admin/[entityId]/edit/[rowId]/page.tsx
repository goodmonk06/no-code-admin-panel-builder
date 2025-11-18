'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Button from '@/components/ui/Button'
import FieldRenderer from '@/components/FieldRenderer'
import type { FieldConfig, EditLayoutConfig } from '@/lib/types'

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

export default function EntityEditPage() {
  const params = useParams()
  const router = useRouter()
  const entityId = params.entityId as string
  const rowId = params.rowId as string
  const isNew = rowId === 'new'

  const [entity, setEntity] = useState<EntityConfig | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEntity()
  }, [entityId])

  useEffect(() => {
    if (entity && !isNew) {
      fetchRow()
    } else if (entity && isNew) {
      // Initialize form with empty values
      const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
      const initialData: any = {}
      fields.forEach(field => {
        if (field.editable) {
          initialData[field.name] = field.type === 'boolean' ? false : ''
        }
      })
      setFormData(initialData)
      setLoading(false)
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
      setFormData(data)
    } catch (error) {
      console.error('Failed to fetch row:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = isNew
        ? `/api/entities/${entityId}/data`
        : `/api/entities/${entityId}/data/${rowId}`

      const method = isNew ? 'POST' : 'PATCH'

      // Only send editable fields
      const fields = JSON.parse(entity!.fieldsJson) as FieldConfig[]
      const editableData: any = {}
      fields.forEach(field => {
        if (field.editable && formData[field.name] !== undefined) {
          editableData[field.name] = formData[field.name]
        }
      })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableData),
      })

      if (res.ok) {
        router.push(`/admin/${entityId}/list`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch (err) {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }))
  }

  if (!entity || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  const fields = JSON.parse(entity.fieldsJson) as FieldConfig[]
  const editView = entity.views.find(v => v.type === 'edit')
  const layout = editView ? JSON.parse(editView.layoutJson) as EditLayoutConfig : null
  const editableFields = (layout?.fields.map(col => fields.find(f => f.name === col)).filter(Boolean) || fields).filter(f => f.editable)

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

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {isNew ? `Add New ${entity.displayName}` : `Edit ${entity.displayName}`}
          </h1>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {editableFields.map((field) => (
                <div key={field!.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field!.label}
                    {field!.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <FieldRenderer
                    field={field!}
                    value={formData[field!.name]}
                    mode="edit"
                    onChange={(value) => handleFieldChange(field!.name, value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Link href={`/admin/${entityId}/list`} className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
