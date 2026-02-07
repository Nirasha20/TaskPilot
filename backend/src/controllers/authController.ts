import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

const generateToken = (userId: number, email: string, username: string) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  // @ts-ignore - jsonwebtoken types are incorrectly narrow for expiresIn
  return jwt.sign(
    { id: userId, email, username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn }
  );
};

export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create new user
    const user = await UserModel.create({ email, username, password });

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.username);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      },
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await UserModel.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.username);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      },
    });
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
        },
      },
    });
  }
);
