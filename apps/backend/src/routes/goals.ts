import { Router } from 'express';
import { GoalsController } from '../controllers/goalsController';
import { validate, createGoalSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();
const goalsController = new GoalsController();

// All routes require authentication
router.use(authenticate);

router.get('/', goalsController.list.bind(goalsController));
router.post('/', validate(createGoalSchema), goalsController.create.bind(goalsController));
router.get('/:id', goalsController.get.bind(goalsController));
router.put('/:id', goalsController.update.bind(goalsController));
router.delete('/:id', goalsController.delete.bind(goalsController));

export default router;
