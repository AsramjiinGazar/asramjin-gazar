import { Router } from 'express';
import { questsController } from '../controllers/questsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.js';

const router = Router();

router.use(optionalAuthMiddleware);
router.get('/', questsController.getQuests);
router.get('/me', authMiddleware, questsController.getMyProgress);

export default router;
