import { Router } from 'express';
import { videosController } from '../controllers/videosController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createVideoSchema, videosQuerySchema } from '../validators/videoValidators.js';

const router = Router();

router.get('/', validateQuery(videosQuerySchema), videosController.getVideos);
router.get('/:id', videosController.getVideoById);

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validate(createVideoSchema),
  videosController.createVideo
);
router.delete('/:id', authMiddleware, requireRole('admin'), videosController.deleteVideo);

export default router;
