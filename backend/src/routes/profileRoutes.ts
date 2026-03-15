import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';
import { badgesController } from '../controllers/badgesController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadSingle } from '../middleware/upload.js';
import { updateProfileSchema } from '../validators/profileValidators.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', profileController.getMyProfile);
router.put('/me', validate(updateProfileSchema), profileController.updateMyProfile);
router.post('/me/avatar', uploadSingle, profileController.uploadAvatar);
router.get('/me/badges', badgesController.getMyBadges);

export default router;
