import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { awardXP } from './xpService.js';
import type { CreateCommentInput } from '../validators/postValidators.js';

export async function createComment(postId: string, userId: string, input: CreateCommentInput) {
  const { data: post } = await supabase.from('posts').select('id, user_id').eq('id', postId).single();
  if (!post) throw new AppError(404, 'Post not found');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content: input.content,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to create comment');

  await awardXP(userId, 'comment_created', {
    referenceType: 'comment',
    referenceId: data.id,
  });
  const { checkAndUpdateProgress } = await import('./questsService.js');
  await checkAndUpdateProgress(userId, 'comment_created');
  const { checkAndAwardBadges } = await import('./badgesService.js');
  await checkAndAwardBadges(userId);

  return data;
}

export async function getComments(postId: string) {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) throw new AppError(500, 'Failed to fetch comments');

  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url')
    .in('user_id', userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (comments ?? []).map((c) => ({
    ...c,
    author: profileMap.get(c.user_id) ?? null,
  }));
}

export async function updateComment(id: string, userId: string, role: string, content: string) {
  const { data: comment } = await supabase.from('comments').select('user_id').eq('id', id).single();
  if (!comment) throw new AppError(404, 'Comment not found');
  if (comment.user_id !== userId && role !== 'admin') {
    throw new AppError(403, 'Not authorized to update this comment');
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to update comment');
  return data;
}

export async function deleteComment(id: string, userId: string, role: string) {
  const { data: comment } = await supabase.from('comments').select('user_id').eq('id', id).single();
  if (!comment) throw new AppError(404, 'Comment not found');
  if (comment.user_id !== userId && role !== 'admin') {
    throw new AppError(403, 'Not authorized to delete this comment');
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new AppError(500, 'Failed to delete comment');
  return { success: true };
}

export const commentsService = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
