import type { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function hidePost(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status?: 'hidden' | 'flagged' };
  const newStatus = status ?? 'hidden';

  const { data, error } = await supabase
    .from('posts')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to update post');
  res.json(data);
}

export async function deletePost(req: Request, res: Response) {
  const { error } = await supabase
    .from('posts')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  if (error) throw new AppError(500, 'Failed to delete post');
  res.json({ success: true });
}

export async function deleteComment(req: Request, res: Response) {
  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  if (error) throw new AppError(500, 'Failed to delete comment');
  res.json({ success: true });
}

export async function deleteGalleryItem(req: Request, res: Response) {
  const { data: item } = await supabase
    .from('gallery_items')
    .select('cloudinary_public_id')
    .eq('id', req.params.id)
    .single();

  if (!item) throw new AppError(404, 'Gallery item not found');

  const { deleteImage } = await import('../services/cloudinaryService.js');
  await deleteImage(item.cloudinary_public_id);

  const { error } = await supabase.from('gallery_items').delete().eq('id', req.params.id);
  if (error) throw new AppError(500, 'Failed to delete gallery item');
  res.json({ success: true });
}

export const adminModerationController = {
  hidePost,
  deletePost,
  deleteComment,
  deleteGalleryItem,
};
