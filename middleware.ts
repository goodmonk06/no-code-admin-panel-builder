import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a simple middleware that could be extended with authentication
// For now, it just allows all requests
export function middleware(request: NextRequest) {
  // In a production app, you would:
  // 1. Check if user is authenticated
  // 2. Get user role from session/JWT
  // 3. Check if user has permission to access the route
  // 4. Return 401/403 if not authorized

  // Example:
  // const token = request.cookies.get('auth-token')
  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/entities/:path*',
    '/api/connections/:path*',
  ],
}
