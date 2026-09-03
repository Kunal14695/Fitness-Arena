import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication token required. Please login or pass Bearer token.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.',
    });
    return;
  }
}
