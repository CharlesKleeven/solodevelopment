import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Check for token in cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      error: 'Please log in to access this feature.',
      code: 'NOT_AUTHENTICATED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // Ensure the user object has the expected structure
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(403).json({
      error: 'Your session has expired. Please log in again.',
      code: 'SESSION_EXPIRED'
    });
  }
};