import type { Baby } from "@/types/profile";

const toneKey = (babyId: string) => `baby_avatar_emoji_tone_${babyId}`;
const ringKey = (babyId: string) => `baby_avatar_ring_style_${babyId}`;

export function readBabyAvatarToneLocal(babyId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(toneKey(babyId));
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0 || n > 5) return null;
  return n;
}

export function writeBabyAvatarToneLocal(babyId: string, tone: number): void {
  localStorage.setItem(toneKey(babyId), String(tone));
}

export function clearBabyAvatarToneLocal(babyId: string): void {
  localStorage.removeItem(toneKey(babyId));
}

export function readBabyAvatarRingLocal(babyId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ringKey(babyId));
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0 || n > 4) return null;
  return n;
}

export function writeBabyAvatarRingLocal(babyId: string, ring: number): void {
  localStorage.setItem(ringKey(babyId), String(ring));
}

export function clearBabyAvatarRingLocal(babyId: string): void {
  localStorage.removeItem(ringKey(babyId));
}

/** When API omits fields, merge device copy; when API has values, trust server and drop locals. */
export function mergeBabyWithLocalAvatarPrefs(baby: Baby): Baby {
  let b = { ...baby };

  const tone = b.avatar_emoji_tone;
  if (tone !== undefined && tone !== null) {
    if (typeof window !== "undefined") clearBabyAvatarToneLocal(baby.id);
  } else if (typeof window !== "undefined") {
    const lt = readBabyAvatarToneLocal(baby.id);
    if (lt != null) b = { ...b, avatar_emoji_tone: lt };
  }

  const ring = b.avatar_ring_style;
  if (ring !== undefined && ring !== null) {
    if (typeof window !== "undefined") clearBabyAvatarRingLocal(baby.id);
  } else if (typeof window !== "undefined") {
    const lr = readBabyAvatarRingLocal(baby.id);
    if (lr != null) b = { ...b, avatar_ring_style: lr };
  }

  return b;
}

export const mergeBabyWithStoredAvatarTone = mergeBabyWithLocalAvatarPrefs;
