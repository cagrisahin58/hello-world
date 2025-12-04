import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../database/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        `INSERT INTO users (email, password_hash, name)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, level, xp, streak_days, onboarding_completed, created_at`,
        [email, passwordHash, name || null]
      );

      const user = result.rows[0];

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level,
          xp: user.xp,
          streakDays: user.streak_days,
          onboardingCompleted: user.onboarding_completed,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await db.query(
        'SELECT id, email, password_hash, name, level, xp, streak_days, onboarding_completed FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Update last active date
      await db.query('UPDATE users SET last_active_date = CURRENT_DATE WHERE id = $1', [user.id]);

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level,
          xp: user.xp,
          streakDays: user.streak_days,
          onboardingCompleted: user.onboarding_completed,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);

      // Generate new access token
      const accessToken = generateAccessToken({ userId: payload.userId, email: payload.email });

      res.json({ accessToken });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          avatarUrl: req.user.avatar_url,
          timezone: req.user.timezone,
          workHours: req.user.work_hours,
          productiveHours: req.user.productive_hours,
          level: req.user.level,
          xp: req.user.xp,
          streakDays: req.user.streak_days,
          lastActiveDate: req.user.last_active_date,
          onboardingCompleted: req.user.onboarding_completed,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    // For JWT, logout is typically handled client-side by removing tokens
    // Here we could implement token blacklisting if needed in the future
    res.json({ message: 'Logged out successfully' });
  }
}
