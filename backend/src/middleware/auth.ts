import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { authService } from '../services/authService.js';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError(401, 'Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
