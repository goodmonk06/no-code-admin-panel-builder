'use client'

import { FieldConfig } from '@/lib/types'
import { formatDate, formatDateTime } from '@/lib/utils'

interface FieldRendererProps {
  field: FieldConfig
  value: any
  mode: 'list' | 'detail' | 'edit'
  onChange?: (value: any) => void
}

export default function FieldRenderer({ field, value, mode, onChange }: FieldRendererProps) {
  // Display mode (list and detail)
  if (mode === 'list' || mode === 'detail') {
    return <DisplayField field={field} value={value} />
  }

  // Edit mode
  return <EditField field={field} value={value} onChange={onChange} />
}

function DisplayField({ field, value }: { field: FieldConfig; value: any }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">null</span>
  }

  switch (field.type) {
    case 'boolean':
      return (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? '✓' : '✗'}
        </span>
      )
    case 'date':
      return <span>{formatDate(value)}</span>
    case 'datetime':
      return <span>{formatDateTime(value)}</span>
    case 'json':
      return (
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-w-md">
          {JSON.stringify(value, null, 2)}
        </pre>
      )
    case 'number':
      return <span>{value.toLocaleString()}</span>
    default:
      return <span className="truncate max-w-xs block">{String(value)}</span>
  }
}

function EditField({ field, value, onChange }: { field: FieldConfig; value: any; onChange?: (value: any) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue: any = e.target.value

    switch (field.type) {
      case 'number':
        newValue = parseFloat(newValue) || 0
        break
      case 'boolean':
        newValue = (e.target as HTMLInputElement).checked
        break
    }

    onChange?.(newValue)
  }

  const baseInputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'

  switch (field.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={value || false}
          onChange={handleChange}
          disabled={!field.editable}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          disabled={!field.editable}
          required={field.required}
          className={baseInputClass}
        />
      )
    case 'date':
      return (
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={handleChange}
          disabled={!field.editable}
          required={field.required}
          className={baseInputClass}
        />
      )
    case 'datetime':
      return (
        <input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={handleChange}
          disabled={!field.editable}
          required={field.required}
          className={baseInputClass}
        />
      )
    case 'json':
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={handleChange}
          disabled={!field.editable}
          required={field.required}
          rows={5}
          className={baseInputClass}
        />
      )
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          disabled={!field.editable}
          required={field.required}
          className={baseInputClass}
        />
      )
  }
}
