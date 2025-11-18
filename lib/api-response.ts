import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiError {
  error: string
  details?: any
  code?: string
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
}

export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiException'
  }
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    )
  }

  // Custom API exceptions
  if (error instanceof ApiException) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          code: 'UNIQUE_CONSTRAINT',
        },
        { status: 409 }
      )
    }
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
    }
  }

  // Database connection errors
  if (error instanceof Error && error.message.includes('connect')) {
    return NextResponse.json(
      {
        error: 'Database connection failed',
        details: error.message,
        code: 'DB_CONNECTION_ERROR',
      },
      { status: 503 }
    )
  }

  // Generic errors
  const message = error instanceof Error ? error.message : 'Internal server error'
  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, message })
}

export function createdResponse<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, message }, { status: 201 })
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
