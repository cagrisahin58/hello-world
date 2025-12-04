import { Response } from 'express';
import { AuthRequest } from '../types';
import { db } from '../database/db';

export class GoalsController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { status } = req.query;

      let query = 'SELECT * FROM goals WHERE user_id = $1';
      const params: any[] = [req.user.id];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);

      res.json({ goals: result.rows });
    } catch (error) {
      console.error('List goals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { rawInput, title, description, category, deadline, estimatedHours, useAI } = req.body;

      let goalTitle = title;
      let goalDescription = description;
      let goalCategory = category;
      let goalDeadline = deadline;
      let goalEstimatedHours = estimatedHours;
      let smartAnalysis = null;

      // If useAI is true and rawInput is provided, we'll call AI service
      // For now, we'll create a placeholder implementation
      if (useAI && rawInput) {
        // TODO: Call AI microservice for goal analysis
        // This will be implemented when we create the AI service
        goalTitle = goalTitle || rawInput.substring(0, 100);
        smartAnalysis = {
          specific: 'AI analysis pending',
          measurable: 'AI analysis pending',
          achievable: 'AI analysis pending',
          relevant: 'AI analysis pending',
          timeBound: 'AI analysis pending',
        };
      }

      const result = await db.query(
        `INSERT INTO goals (user_id, title, description, category, deadline, estimated_hours, smart_analysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          req.user.id,
          goalTitle,
          goalDescription,
          goalCategory,
          goalDeadline,
          goalEstimatedHours,
          smartAnalysis ? JSON.stringify(smartAnalysis) : null,
        ]
      );

      res.status(201).json({ goal: result.rows[0] });
    } catch (error) {
      console.error('Create goal error:', error);
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

      const result = await db.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [
        id,
        req.user.id,
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      // Get associated tasks
      const tasksResult = await db.query(
        'SELECT * FROM tasks WHERE goal_id = $1 ORDER BY order_index, created_at',
        [id]
      );

      res.json({
        goal: result.rows[0],
        tasks: tasksResult.rows,
      });
    } catch (error) {
      console.error('Get goal error:', error);
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

      // Build dynamic update query
      const allowedFields = [
        'title',
        'description',
        'category',
        'status',
        'priority',
        'deadline',
        'estimated_hours',
        'completion_percentage',
        'is_in_top_3',
        'key_result_area',
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
        `UPDATE goals SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      res.json({ goal: result.rows[0] });
    } catch (error) {
      console.error('Update goal error:', error);
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

      const result = await db.query('DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id', [
        id,
        req.user.id,
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Delete goal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
