export const XP_PER_LEVEL = 100;

/** Level = floor(totalXp / 100). No level cap. At 100 XP, level goes up and "current" XP resets (display as totalXp % 100). */
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / XP_PER_LEVEL);
}

/** XP toward next level (0 to XP_PER_LEVEL-1) for progress bar display. */
export function xpTowardNextLevel(totalXp: number): number {
  return totalXp % XP_PER_LEVEL;
}
