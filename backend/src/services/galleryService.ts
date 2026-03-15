import { randomUUID } from 'crypto';
import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { uploadImage, deleteImage, isCloudinaryConfigured } from './cloudinaryService.js';
import { awardXP } from './xpService.js';
import type { CreateGalleryItemInput, GalleryQueryInput } from '../validators/galleryValidators.js';

const LOCAL_PREFIX = 'local:';

function bufferToDataUrl(mimetype: string, buffer: Buffer): string {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

export async function uploadGalleryItem(
  userId: string,
  file: Express.Multer.File,
  caption?: string,
  category?: string
) {
  let url: string;
  let publicId: string;
  if (isCloudinaryConfigured()) {
    const result = await uploadImage(file.buffer);
    url = result.url;
    publicId = result.publicId;
  } else {
    url = bufferToDataUrl(file.mimetype, file.buffer);
    publicId = LOCAL_PREFIX + randomUUID();
  }

  const { data, error } = await supabase
    .from('gallery_items')
    .insert({
      user_id: userId,
      image_url: url,
      cloudinary_public_id: publicId,
      caption: caption ?? null,
      category: category ?? null,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to save gallery item');

  await awardXP(userId, 'gallery_upload', {
    referenceType: 'gallery',
    referenceId: data.id,
  });
  const { checkAndUpdateProgress } = await import('./questsService.js');
  await checkAndUpdateProgress(userId, 'gallery_upload');
  const { checkAndAwardBadges } = await import('./badgesService.js');
  await checkAndAwardBadges(userId);

  return data;
}

export async function getGalleryItems(query: GalleryQueryInput) {
  const { page, limit, category } = query;
  const offset = (page - 1) * limit;

  let q = supabase
    .from('gallery_items')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) {
    q = q.eq('category', category);
  }

  const mine = (query as unknown as { mine?: boolean }).mine ?? false;
  const userId = (query as unknown as { userId?: string }).userId;
  if (mine && userId) {
    q = q.eq('user_id', userId);
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);

  if (error) throw new AppError(500, 'Failed to fetch gallery');

  const items = data ?? [];
  const userIds = [...new Set(items.map((i) => i.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url')
    .in('user_id', userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return {
    data: items.map((i) => ({
      ...i,
      author: profileMap.get(i.user_id) ?? null,
    })),
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getGalleryItemById(id: string) {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !data) throw new AppError(404, 'Gallery item not found');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url')
    .eq('user_id', data.user_id)
    .single();

  return { ...data, author: profile ?? null };
}

export async function deleteGalleryItem(id: string, userId: string, role: string) {
  const { data: item, error: fetchError } = await supabase
    .from('gallery_items')
    .select('user_id, cloudinary_public_id')
    .eq('id', id)
    .single();

  if (fetchError || !item) throw new AppError(404, 'Gallery item not found');
  if (item.user_id !== userId && role !== 'admin') {
    throw new AppError(403, 'Not authorized to delete this item');
  }

  if (!item.cloudinary_public_id.startsWith(LOCAL_PREFIX)) {
    await deleteImage(item.cloudinary_public_id);
  }

  const { error: deleteError } = await supabase.from('gallery_items').delete().eq('id', id);
  if (deleteError) throw new AppError(500, 'Failed to delete gallery item');
  return { success: true };
}

export const galleryService = {
  uploadGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  deleteGalleryItem,
};
