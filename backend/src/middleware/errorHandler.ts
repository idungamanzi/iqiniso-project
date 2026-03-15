import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { MulterError } from 'multer'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string> = {}
    err.errors.forEach((e) => {
      const field = e.path.join('.')
      errors[field] = e.message
    })
    res.status(400).json({ error: 'Validation failed.', errors })
    return
  }

  // Multer file upload errors
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB ?? 10}MB.` })
      return
    }
    res.status(400).json({ error: err.message })
    return
  }

  // Known operational errors
  if (err instanceof Error) {
    if (err.message.includes('Only JPEG')) {
      res.status(400).json({ error: err.message })
      return
    }
    console.error('[ERROR]', err.message, err.stack)
  }

  res.status(500).json({ error: 'Internal server error. Please try again later.' })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found.' })
}
