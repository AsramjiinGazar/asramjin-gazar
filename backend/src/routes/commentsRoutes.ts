import { Router } from 'express';
import { commentsController } from '../controllers/commentsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const updateCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

router.put('/:id', authMiddleware, validate(updateCommentSchema), commentsController.updateComment);
router.delete('/:id', authMiddleware, commentsController.deleteComment);

export default router;
