'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Database, Trash2, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Connection {
  id: string
  name: string
  type: string
  createdAt: string
  entities: Array<{ id: string; tableName: string; displayName: string }>
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/connections')
      const data = await res.json()
      setConnections(data)
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIntrospect = async (connectionId: string) => {
    if (!confirm('This will introspect the database and create/update entity configurations. Continue?')) {
      return
    }

    try {
      const res = await fetch(`/api/connections/${connectionId}/introspect`, {
        method: 'POST',
      })
      const result = await res.json()

      if (res.ok) {
        alert(`Success! Found ${result.tablesFound} tables.`)
        fetchConnections()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to introspect:', error)
      alert('Failed to introspect database')
    }
  }

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure? This will delete the connection and all associated entities.')) {
      return
    }

    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchConnections()
      } else {
        alert('Failed to delete connection')
      }
    } catch (error) {
      console.error('Failed to delete connection:', error)
      alert('Failed to delete connection')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Connections</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your database connections and generate admin panels
            </p>
          </div>
          <Link href="/connections/new">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              Add Connection
            </Button>
          </Link>
        </div>

        {connections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No connections yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding your first database connection
            </p>
            <Link href="/connections/new">
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add Connection
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {connection.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Type: {connection.type} • {connection.entities.length} entities
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleIntrospect(connection.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Introspect
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(connection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {connection.entities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Entities:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {connection.entities.map((entity) => (
                        <Link
                          key={entity.id}
                          href={`/admin/${entity.id}/list`}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                          {entity.displayName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
