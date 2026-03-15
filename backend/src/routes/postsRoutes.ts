import { Router } from 'express';
import { postsController } from '../controllers/postsController.js';
import { commentsController } from '../controllers/commentsController.js';
import { reactionsController } from '../controllers/reactionsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  createReactionSchema,
  postsQuerySchema,
} from '../validators/postValidators.js';

const router = Router();

router.use(optionalAuthMiddleware);

router.post('/', authMiddleware, validate(createPostSchema), postsController.createPost);
router.get('/', validateQuery(postsQuerySchema), postsController.getPosts);
router.get('/:id', postsController.getPostById);
router.put('/:id', authMiddleware, validate(updatePostSchema), postsController.updatePost);
router.delete('/:id', authMiddleware, postsController.deletePost);

router.post('/:postId/comments', authMiddleware, validate(createCommentSchema), commentsController.createComment);
router.get('/:postId/comments', commentsController.getComments);

router.post('/:postId/reactions', authMiddleware, validate(createReactionSchema), reactionsController.addReaction);
router.delete('/:postId/reactions', authMiddleware, reactionsController.removeReaction);

export default router;
