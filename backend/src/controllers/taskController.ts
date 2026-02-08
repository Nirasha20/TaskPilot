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

export const getAnalytics = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const tasks = await TaskModel.findAllByUserId(userId);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate stats
    const timeToday = tasks
      .filter((t) => new Date(t.updated_at) >= today)
      .reduce((sum, t) => sum + t.total_time, 0);

    const timeThisWeek = tasks
      .filter((t) => new Date(t.updated_at) >= weekAgo)
      .reduce((sum, t) => sum + t.total_time, 0);

    const completedToday = tasks.filter(
      (t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at) >= today
    ).length;

    const completedThisWeek = tasks.filter(
      (t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at) >= weekAgo
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const avgTimePerTask = totalTasks > 0
      ? Math.round((tasks.reduce((sum, t) => sum + t.total_time, 0) / totalTasks) * 100) / 100
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        analytics: {
          timeToday,
          timeThisWeek,
          completedToday,
          completedThisWeek,
          totalTasks,
          completedTasks,
          avgTimePerTask,
        },
      },
    });
  }
);

export const getTimeDistribution = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const tasks = await TaskModel.findAllByUserId(userId);

    // Group by category
    const distribution: Record<string, number> = {};
    tasks.forEach((task) => {
      if (!distribution[task.category]) {
        distribution[task.category] = 0;
      }
      distribution[task.category] += task.total_time;
    });

    const data = Object.entries(distribution).map(([category, time]) => ({
      category,
      time,
      timeMinutes: Math.round(time / 60),
    }));

    res.status(200).json({
      status: 'success',
      data: { distribution: data },
    });
  }
);

export const getDailyProgress = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const tasks = await TaskModel.findAllByUserId(userId);

    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const dailyData = last7Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayTasks = tasks.filter((t) => {
        const updatedAt = new Date(t.updated_at);
        return updatedAt >= date && updatedAt < nextDay;
      });

      const completed = tasks.filter((t) => {
        if (t.status !== 'completed' || !t.completed_at) return false;
        const completedAt = new Date(t.completed_at);
        return completedAt >= date && completedAt < nextDay;
      }).length;

      const timeSpent = dayTasks.reduce((sum, t) => sum + t.total_time, 0);

      return {
        date: date.toISOString().split('T')[0],
        completed,
        timeSpent,
        timeMinutes: Math.round(timeSpent / 60),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { progress: dailyData },
    });
  }
);
