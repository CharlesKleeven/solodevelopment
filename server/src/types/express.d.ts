import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username?: string;
    email?: string;
  };
}