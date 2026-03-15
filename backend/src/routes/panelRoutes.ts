import { Router } from 'express';
import { panelController } from '../controllers/panelController.js';
import { validate } from '../middleware/validate.js';
import { createQuestSchema } from '../validators/questValidators.js';
import { createAnnouncementSchema } from '../validators/announcementValidators.js';
import { createBadgeSchema } from '../validators/badgeValidators.js';

const router = Router();

router.post('/quests', validate(createQuestSchema), panelController.createQuest);
router.post('/quests/:id/award-xp', panelController.awardQuestXp);
router.post('/announcements', validate(createAnnouncementSchema), panelController.createAnnouncement);
router.get('/badges', panelController.listBadges);
router.post('/badges', validate(createBadgeSchema), panelController.createBadge);
router.post('/badges/award', panelController.awardBadges);

export default router;
