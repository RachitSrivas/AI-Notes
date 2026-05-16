import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};