import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple authentication middleware for admin routes
 * In production, use NextAuth.js or similar
 */
export function authenticateAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return false
  }

  // Format: "Bearer YOUR_SECRET_KEY"
  const token = authHeader.replace('Bearer ', '')
  const adminKey = process.env.ADMIN_SECRET_KEY || ''

  if (!adminKey) {
    console.error('ADMIN_SECRET_KEY is not set in environment variables')
    return false
  }

  return token === adminKey
}

export function requireAuth(request: NextRequest): NextResponse | null {
  if (!authenticateAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    )
  }
  return null
}
