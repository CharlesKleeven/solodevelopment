import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check for token in cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: 'Please log in to access this feature.',
      code: 'NOT_AUTHENTICATED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      error: 'Your session has expired. Please log in again.',
      code: 'SESSION_EXPIRED'
    });
  }
};