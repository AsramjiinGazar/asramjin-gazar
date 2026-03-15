import { Router } from 'express';
import { announcementsController } from '../controllers/announcementsController.js';

const router = Router();

router.get('/', announcementsController.getAnnouncements);

export default router;
