import { Router } from 'express';
import { studentsController } from '../controllers/studentsController.js';
import { validateQuery } from '../middleware/validate.js';
import { studentsQuerySchema } from '../validators/profileValidators.js';

const router = Router();

router.get('/', validateQuery(studentsQuerySchema), studentsController.getStudents);
router.get('/:id', studentsController.getStudentById);

export default router;
