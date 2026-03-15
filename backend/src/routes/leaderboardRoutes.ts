import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboardController.js';

const router = Router();

router.get('/all-time', leaderboardController.getAllTime);
router.get('/monthly', leaderboardController.getMonthly);

export default router;
