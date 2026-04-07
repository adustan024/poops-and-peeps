export const BABY_AVATAR_EMOJI_BY_TONE = [
  "👶",
  "👶🏻",
  "👶🏼",
  "👶🏽",
  "👶🏾",
  "👶🏿",
] as const;

export type BabyAvatarTone = 0 | 1 | 2 | 3 | 4 | 5;

export function getBabyAvatarEmoji(tone: number | null | undefined): string {
  const i = Math.min(
    Math.max(Number(tone) || 0, 0),
    BABY_AVATAR_EMOJI_BY_TONE.length - 1
  );
  return BABY_AVATAR_EMOJI_BY_TONE[i];
}
