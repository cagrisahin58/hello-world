import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      res.status(400).json({ errors });
      return;
    }

    next();
  };
};

// Common validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createGoalSchema = Joi.object({
  rawInput: Joi.string().min(10).max(1000).optional(),
  title: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(2000).optional(),
  category: Joi.string().max(50).optional(),
  deadline: Joi.date().optional(),
  estimatedHours: Joi.number().min(1).max(10000).optional(),
  useAI: Joi.boolean().default(false),
}).or('rawInput', 'title');

export const createTaskSchema = Joi.object({
  goalId: Joi.string().uuid().optional(),
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(2000).optional(),
  priority: Joi.string().valid('A', 'B', 'C', 'D', 'E').default('C'),
  category: Joi.string().max(50).optional(),
  estimatedMinutes: Joi.number().min(1).max(960).optional(),
  deadline: Joi.date().optional(),
  scheduledStart: Joi.date().optional(),
  scheduledEnd: Joi.date().optional(),
});
