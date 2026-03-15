import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
/**
 * Optional auth: if a Bearer token exists and is valid, sets req.user.
 * Otherwise, continues without throwing (public endpoints can still work).
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
  } catch {
    // ignore invalid token for public endpoints
  }
  next();
}

