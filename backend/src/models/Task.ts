import { pool } from '../config/database';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  total_time: number;
  is_tracking: boolean;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface CreateTaskData {
  user_id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  total_time?: number;
  is_tracking?: boolean;
  tags?: string[];
  completed_at?: Date;
}

export class TaskModel {
  static async create(taskData: CreateTaskData): Promise<Task> {
    const {
      user_id,
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      category = 'general',
      tags = [],
    } = taskData;

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, category, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, title, description, status, priority, category, tags]
    );

    return result.rows[0];
  }

  static async findAllByUserId(userId: number): Promise<Task[]> {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id: number, userId: number): Promise<Task | null> {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async update(
    id: number,
    userId: number,
    updateData: UpdateTaskData
  ): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return result.rows[0] || null;
    }

    values.push(id, userId);
    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async stopAllTracking(userId: number): Promise<void> {
    await pool.query(
      'UPDATE tasks SET is_tracking = false WHERE user_id = $1 AND is_tracking = true',
      [userId]
    );
  }
}
