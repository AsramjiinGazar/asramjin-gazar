import { supabase } from '../db/supabase.js';
import { AppError } from '../utils/AppError.js';
import { awardXP } from './xpService.js';
import type { CreateReactionInput } from '../validators/postValidators.js';

export async function addReaction(postId: string, userId: string, input: CreateReactionInput) {
  const { data: post } = await supabase.from('posts').select('id, user_id').eq('id', postId).single();
  if (!post) throw new AppError(404, 'Post not found');

  const { data: existing } = await supabase
    .from('reactions')
    .select('id, type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('reactions')
      .update({ type: input.type })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw new AppError(500, 'Failed to update reaction');
    return data;
  }

  const { data, error } = await supabase
    .from('reactions')
    .insert({
      post_id: postId,
      user_id: userId,
      type: input.type,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Failed to add reaction');

  if (post.user_id !== userId) {
    await awardXP(post.user_id, 'receive_reactions', {
      reactorId: userId,
      referenceType: 'post',
      referenceId: postId,
    });
    const { checkAndUpdateProgress } = await import('./questsService.js');
    await checkAndUpdateProgress(post.user_id, 'receive_reactions');
  }

  return data;
}

export async function removeReaction(postId: string, userId: string) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw new AppError(500, 'Failed to remove reaction');
  return { success: true };
}

export const reactionsService = {
  addReaction,
  removeReaction,
};
