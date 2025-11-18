import { describe, it, expect } from 'vitest'
import { ApiException, handleApiError } from '@/lib/api-response'
import { ZodError, z } from 'zod'

describe('API Response Helpers', () => {
  describe('ApiException', () => {
    it('should create an exception with message and status code', () => {
      const exception = new ApiException('Test error', 404, 'NOT_FOUND')

      expect(exception.message).toBe('Test error')
      expect(exception.statusCode).toBe(404)
      expect(exception.code).toBe('NOT_FOUND')
      expect(exception.name).toBe('ApiException')
    })

    it('should default to 500 status code', () => {
      const exception = new ApiException('Internal error')

      expect(exception.statusCode).toBe(500)
    })
  })

  describe('handleApiError', () => {
    it('should handle ZodError', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(0),
      })

      try {
        schema.parse({ email: 'invalid', age: -1 })
      } catch (error) {
        const response = handleApiError(error)
        const json = response.json() as any

        expect(response.status).toBe(400)
      }
    })

    it('should handle ApiException', () => {
      const error = new ApiException('Not found', 404, 'NOT_FOUND')
      const response = handleApiError(error)

      expect(response.status).toBe(404)
    })

    it('should handle Prisma unique constraint errors', () => {
      const prismaError = {
        code: 'P2002',
        message: 'Unique constraint failed',
      }

      const response = handleApiError(prismaError)
      expect(response.status).toBe(409)
    })

    it('should handle Prisma not found errors', () => {
      const prismaError = {
        code: 'P2025',
        message: 'Record not found',
      }

      const response = handleApiError(prismaError)
      expect(response.status).toBe(404)
    })

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong')
      const response = handleApiError(error)

      expect(response.status).toBe(500)
    })

    it('should handle database connection errors', () => {
      const error = new Error('connect ECONNREFUSED')
      const response = handleApiError(error)

      expect(response.status).toBe(503)
    })
  })
})
