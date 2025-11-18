import Link from 'next/link'
import { Database, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Database className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            No-Code Admin Panel Builder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Auto-generate beautiful CRUD admin panels for any PostgreSQL database.
            Connect, introspect, and manage your data instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              1. Connect Database
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Add your PostgreSQL connection details and let us handle the rest.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              2. Introspect Schema
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically discover all tables, columns, and relationships.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              3. Generate Admin UI
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get instant CRUD interfaces with list, detail, and edit views.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/connections"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Use Cases
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span><strong>Marketplace:</strong> Manage products, vendors, orders, and users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span><strong>CRM:</strong> Handle contacts, companies, deals, and activities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span><strong>Helpdesk:</strong> Track tickets, customers, and support agents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span><strong>Internal Tools:</strong> Outsource admin UI for any application</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
