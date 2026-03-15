export const XP_AMOUNTS: Record<string, number> = {
  daily_login: 5,
  post_created: 10,
  comment_created: 5,
  gallery_upload: 15,
  receive_reactions: 2,
  quest_completed: 0, // varies per quest
};

export const XP_LIMITS = {
  comment_daily_cap: 50,
  comment_cooldown_minutes: 1,
  post_cooldown_minutes: 5,
  gallery_cooldown_minutes: 10,
};
