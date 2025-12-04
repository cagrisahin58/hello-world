import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  timezone: string;
  work_hours: { start: string; end: string };
  productive_hours: string[];
  level: number;
  xp: number;
  streak_days: number;
  last_active_date?: Date;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'active' | 'completed' | 'archived';
  priority?: 'A' | 'B' | 'C';
  deadline?: Date;
  estimated_hours?: number;
  actual_hours: number;
  completion_percentage: number;
  is_in_top_3: boolean;
  key_result_area?: string;
  smart_analysis?: any;
  created_at: Date;
  completed_at?: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  goal_id?: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'A' | 'B' | 'C' | 'D' | 'E';
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  category?: string;
  estimated_minutes?: number;
  actual_minutes: number;
  deadline?: Date;
  scheduled_start?: Date;
  scheduled_end?: Date;
  completed_at?: Date;
  postpone_count: number;
  focus_sessions_count: number;
  is_frog: boolean;
  blocking_tasks?: string[];
  blocks_tasks?: string[];
  parent_task_id?: string;
  order_index?: number;
  created_at: Date;
  updated_at: Date;
}
