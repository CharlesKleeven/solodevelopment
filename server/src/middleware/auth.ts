import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getClientIP, hashIP } from '../utils/ip';

const ONE_DAY = 24 * 60 * 60 * 1000;

function updateIpHashInBackground(userId: string, ipHash: string) {
  User.updateOne(
    {
      _id: userId,
      $or: [
        { lastIpHashUpdatedAt: { $exists: false } },
        { lastIpHashUpdatedAt: { $lt: new Date(Date.now() - ONE_DAY) } },
        { lastIpHash: { $ne: ipHash } },
      ],
    },
    {
      $set: {
        lastIpHash: ipHash,
        lastIpHashUpdatedAt: new Date(),
      },
    }
  ).exec().catch(() => {});
}

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

    updateIpHashInBackground(decoded.userId, hashIP(getClientIP(req)));

    next();
  } catch (error) {
    res.status(403).json({
      error: 'Your session has expired. Please log in again.',
      code: 'SESSION_EXPIRED'
    });
  }
};