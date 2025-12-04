import { Response } from 'express';
import { AuthRequest } from '../types';
import { db } from '../database/db';

export class TasksController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { status, priority, goalId, isFrog } = req.query;

      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      const params: any[] = [req.user.id];
      let paramCount = 2;

      if (status) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (priority) {
        query += ` AND priority = $${paramCount}`;
        params.push(priority);
        paramCount++;
      }

      if (goalId) {
        query += ` AND goal_id = $${paramCount}`;
        params.push(goalId);
        paramCount++;
      }

      if (isFrog !== undefined) {
        query += ` AND is_frog = $${paramCount}`;
        params.push(isFrog === 'true');
        paramCount++;
      }

      query += ' ORDER BY priority ASC, deadline ASC NULLS LAST, created_at DESC';

      const result = await db.query(query, params);

      res.json({ tasks: result.rows });
    } catch (error) {
      console.error('List tasks error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        goalId,
        title,
        description,
        priority,
        category,
        estimatedMinutes,
        deadline,
        scheduledStart,
        scheduledEnd,
      } = req.body;

      const result = await db.query(
        `INSERT INTO tasks (
          user_id, goal_id, title, description, priority, category,
          estimated_minutes, deadline, scheduled_start, scheduled_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          req.user.id,
          goalId || null,
          title,
          description || null,
          priority || 'C',
          category || null,
          estimatedMinutes || null,
          deadline || null,
          scheduledStart || null,
          scheduledEnd || null,
        ]
      );

      res.status(201).json({ task: result.rows[0] });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async get(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [
        id,
        req.user.id,
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json({ task: result.rows[0] });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      const allowedFields = [
        'title',
        'description',
        'priority',
        'status',
        'category',
        'estimated_minutes',
        'actual_minutes',
        'deadline',
        'scheduled_start',
        'scheduled_end',
        'is_frog',
        'order_index',
      ];

      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        res.status(400).json({ error: 'No valid fields to update' });
        return;
      }

      values.push(id, req.user.id);

      const result = await db.query(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json({ task: result.rows[0] });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [
        id,
        req.user.id,
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async complete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await db.query(
        `UPDATE tasks
         SET status = 'completed', completed_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // TODO: Update user XP and check for achievements
      // TODO: Update goal completion percentage

      res.json({ task: result.rows[0] });
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async postpone(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await db.query(
        `UPDATE tasks
         SET postpone_count = postpone_count + 1
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Check if this task is being postponed too much (bottleneck detection)
      if (result.rows[0].postpone_count >= 3) {
        // TODO: Create bottleneck entry
        console.log(`Task ${id} postponed ${result.rows[0].postpone_count} times - potential bottleneck`);
      }

      res.json({ task: result.rows[0] });
    } catch (error) {
      console.error('Postpone task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await db.query(
        `UPDATE tasks
         SET status = 'in_progress'
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json({ task: result.rows[0] });
    } catch (error) {
      console.error('Start task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async dailyPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get today's tasks
      const today = new Date().toISOString().split('T')[0];

      const result = await db.query(
        `SELECT * FROM tasks
         WHERE user_id = $1
         AND status != 'completed'
         AND (DATE(scheduled_start) = $2 OR deadline::DATE = $2 OR is_frog = true)
         ORDER BY priority ASC, deadline ASC NULLS LAST`,
        [req.user.id, today]
      );

      // TODO: Implement intelligent daily planning algorithm
      // For now, just return filtered tasks

      res.json({
        date: today,
        tasks: result.rows,
        summary: {
          total: result.rows.length,
          byPriority: {
            A: result.rows.filter((t) => t.priority === 'A').length,
            B: result.rows.filter((t) => t.priority === 'B').length,
            C: result.rows.filter((t) => t.priority === 'C').length,
          },
        },
      });
    } catch (error) {
      console.error('Daily plan error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
