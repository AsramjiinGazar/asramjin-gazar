import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF'));
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  // Vercel Serverless functions have tight request size limits; keep this conservative.
  limits: { fileSize: 4 * 1024 * 1024 },
}).single('image');
