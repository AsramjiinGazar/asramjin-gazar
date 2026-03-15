import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import type { UploadApiResponse } from 'cloudinary';

export function isCloudinaryConfigured(): boolean {
  return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new AppError(503, 'Cloudinary is not configured');
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder = 'gallery'
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err: Error | undefined, result: UploadApiResponse | undefined) => {
        if (err) reject(err);
        else if (result) resolve({ url: result.secure_url, publicId: result.public_id });
        else reject(new Error('Upload failed'));
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}
