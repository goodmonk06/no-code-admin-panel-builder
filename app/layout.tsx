import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'No-Code Admin Panel Builder',
  description: 'Auto-generate CRUD admin panels for any database',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
