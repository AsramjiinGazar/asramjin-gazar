import { Router } from 'express';
import { badgesController } from '../controllers/badgesController.js';

const router = Router();

router.get('/', badgesController.getBadges);

export default router;
