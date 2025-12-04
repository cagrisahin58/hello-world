import { Router } from 'express';
import { TasksController } from '../controllers/tasksController';
import { validate, createTaskSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();
const tasksController = new TasksController();

// All routes require authentication
router.use(authenticate);

router.get('/', tasksController.list.bind(tasksController));
router.post('/', validate(createTaskSchema), tasksController.create.bind(tasksController));
router.get('/daily-plan', tasksController.dailyPlan.bind(tasksController));
router.get('/:id', tasksController.get.bind(tasksController));
router.put('/:id', tasksController.update.bind(tasksController));
router.delete('/:id', tasksController.delete.bind(tasksController));
router.patch('/:id/start', tasksController.start.bind(tasksController));
router.patch('/:id/complete', tasksController.complete.bind(tasksController));
router.patch('/:id/postpone', tasksController.postpone.bind(tasksController));

export default router;
