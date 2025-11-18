'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function NewConnectionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgres',
    host: 'localhost',
    port: '5432',
    database: '',
    user: '',
    password: '',
    ssl: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          config: {
            host: formData.host,
            port: parseInt(formData.port, 10),
            database: formData.database,
            user: formData.user,
            password: formData.password,
            ssl: formData.ssl,
          },
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/connections')
      } else {
        setError(data.error || 'Failed to create connection')
      }
    } catch (err) {
      setError('Failed to create connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/connections"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Connections
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Add New Connection
          </h1>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Input
              label="Connection Name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Production DB"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Database Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="postgres">PostgreSQL</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Host"
                type="text"
                required
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              />
              <Input
                label="Port"
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              />
            </div>

            <Input
              label="Database Name"
              type="text"
              required
              value={formData.database}
              onChange={(e) => setFormData({ ...formData, database: e.target.value })}
            />

            <Input
              label="Username"
              type="text"
              required
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ssl"
                checked={formData.ssl}
                onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="ssl" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Use SSL
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Testing Connection...' : 'Create Connection'}
              </Button>
              <Link href="/connections" className="flex-1">
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
