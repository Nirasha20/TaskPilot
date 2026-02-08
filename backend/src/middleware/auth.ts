import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header or invalid format');
      throw new ApiError(401, 'Authentication required. Please provide a valid token.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.error('No token found in authorization header');
      throw new ApiError(401, 'Authentication token not found.');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      throw new ApiError(500, 'Server configuration error');
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email: string;
      username: string;
    };

    console.log('User authenticated:', decoded.id);
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification failed:', error.message);
      next(new ApiError(401, 'Invalid or expired token.'));
    } else {
      console.error('Authentication error:', error);
      next(error);
    }
  }
};
