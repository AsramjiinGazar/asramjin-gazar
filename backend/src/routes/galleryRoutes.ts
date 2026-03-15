import { Router } from 'express';
import { galleryController } from '../controllers/galleryController.js';
import { authMiddleware } from '../middleware/auth.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.js';
import { validateQuery } from '../middleware/validate.js';
import { uploadSingle } from '../middleware/upload.js';
import { galleryQuerySchema } from '../validators/galleryValidators.js';

const router = Router();

router.use(optionalAuthMiddleware);

router.post('/upload', authMiddleware, uploadSingle, galleryController.upload);
router.get('/', validateQuery(galleryQuerySchema), galleryController.getGallery);
router.get('/:id', galleryController.getGalleryItemById);
router.delete('/:id', authMiddleware, galleryController.deleteGalleryItem);

export default router;
