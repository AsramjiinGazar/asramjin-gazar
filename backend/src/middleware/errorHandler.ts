import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === 'MulterError') {
    const message = err.message === 'File too large' ? 'File size exceeds 5MB limit' : err.message;
    res.status(400).json({ error: message });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation error',
      details: (err as { errors?: unknown[] }).errors,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
