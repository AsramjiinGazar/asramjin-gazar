import { Router } from 'express';
import { adminQuestsController } from '../controllers/adminQuestsController.js';
import { adminBadgesController } from '../controllers/adminBadgesController.js';
import { announcementsController } from '../controllers/announcementsController.js';
import { adminModerationController } from '../controllers/adminModerationController.js';
import { adminUsersController } from '../controllers/adminUsersController.js';
import { adminXpController } from '../controllers/adminXpController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createQuestSchema, updateQuestSchema } from '../validators/questValidators.js';
import { createBadgeSchema } from '../validators/badgeValidators.js';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../validators/announcementValidators.js';
import { z } from 'zod';

const awardBadgeSchema = z.object({ badgeId: z.string().uuid() });

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.post('/quests', validate(createQuestSchema), adminQuestsController.createQuest);
router.post('/quests/:id/award-xp', adminQuestsController.awardQuestXp);
router.put('/quests/:id', validate(updateQuestSchema), adminQuestsController.updateQuest);
router.delete('/quests/:id', adminQuestsController.deleteQuest);

router.post('/badges', validate(createBadgeSchema), adminBadgesController.createBadge);
router.post('/users/:id/badges', validate(awardBadgeSchema), adminBadgesController.awardBadgeToUser);

router.post('/announcements', validate(createAnnouncementSchema), announcementsController.createAnnouncement);
router.put('/announcements/:id', validate(updateAnnouncementSchema), announcementsController.updateAnnouncement);
router.delete('/announcements/:id', announcementsController.deleteAnnouncement);

router.put('/posts/:id/hide', adminModerationController.hidePost);
router.delete('/posts/:id', adminModerationController.deletePost);
router.delete('/comments/:id', adminModerationController.deleteComment);
router.delete('/gallery/:id', adminModerationController.deleteGalleryItem);

router.get('/users', adminUsersController.getUsers);
router.post('/xp/adjust', adminXpController.adjustXp);

export default router;
