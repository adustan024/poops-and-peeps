import type { CSSProperties } from "react";
import { statCardHomeBorder, statCardRadialFill } from "@/lib/statCardSurface";

export const BABY_AVATAR_RING_COUNT = 5;

export type BabyAvatarRingPreset = { fillHex: string; borderHex?: string };

const RING_PRESETS: BabyAvatarRingPreset[] = [
  { fillHex: "#7C3AED" },
  { fillHex: "#EC4899" },
  { fillHex: "#FBBF24" },
  { fillHex: "#0D9488", borderHex: "#3B82F6" },
  { fillHex: "#22C55E" },
];

function clampRingIndex(index: number | null | undefined): number {
  return Math.min(
    Math.max(Number(index) || 0, 0),
    BABY_AVATAR_RING_COUNT - 1
  );
}

export function getBabyAvatarRingPreset(
  index: number | null | undefined
): BabyAvatarRingPreset {
  return RING_PRESETS[clampRingIndex(index)];
}

export function getBabyAvatarRingSurfaceStyle(
  index: number | null | undefined
): CSSProperties {
  const { fillHex, borderHex = fillHex } = getBabyAvatarRingPreset(index);
  return {
    background: statCardRadialFill(fillHex),
    border: `1px solid ${statCardHomeBorder(borderHex)}`,
  };
}
