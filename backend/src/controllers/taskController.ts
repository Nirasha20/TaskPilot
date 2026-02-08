import { Request, Response, NextFunction } from 'express';
import { TaskModel } from '../models/Task';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAllTasks = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    
    console.log('Fetching tasks for user:', userId);

    const tasks = await TaskModel.findAllByUserId(userId);
    
    console.log('Found tasks:', tasks.length);

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    });
  }
);

export const getTask = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const taskId = parseInt(req.params.id as string);

    const task = await TaskModel.findById(taskId, userId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  }
);

export const createTask = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const { title, description, status, priority, category, tags } = req.body;

    const task = await TaskModel.create({
      user_id: userId,
      title,
      description,
      status,
      priority,
      category,
      tags,
    });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task },
    });
  }
);

export const updateTask = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const taskId = parseInt(req.params.id as string);
    const updateData = req.body;

    // If status is being changed to completed, set completed_at
    if (updateData.status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date();
    }

    // If starting tracking, stop all other tracking tasks
    if (updateData.is_tracking === true) {
      await TaskModel.stopAllTracking(userId);
    }

    const task = await TaskModel.update(taskId, userId, updateData);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task },
    });
  }
);

export const deleteTask = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const taskId = parseInt(req.params.id as string);

    const deleted = await TaskModel.delete(taskId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: null,
    });
  }
);

export const startTimer = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const taskId = parseInt(req.params.id as string);

    // Stop all other tracking tasks first
    await TaskModel.stopAllTracking(userId);

    // Start tracking this task
    const task = await TaskModel.update(taskId, userId, {
      is_tracking: true,
      status: 'in-progress',
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Timer started',
      data: { task },
    });
  }
);

export const stopTimer = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const taskId = parseInt(req.params.id as string);

    const task = await TaskModel.update(taskId, userId, {
      is_tracking: false,
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Timer stopped',
      data: { task },
    });
  }
);
