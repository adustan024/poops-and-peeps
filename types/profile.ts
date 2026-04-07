/**
 * types/profile.ts
 */

import { format, isValid, parseISO } from "date-fns";

export type UnitPreference = "imperial" | "metric";

export interface Profile {
  id: string;           // matches auth.users.id
  baby_name: string;
  birth_date: string;   // ISO date "YYYY-MM-DD"
  units: UnitPreference;
  created_at: string;
  updated_at: string;
}

export interface Baby {
  id: string;
  owner_id: string;
  name: string;
  birth_date: string;
  created_at: string;
  /** 0–5: default 👶 then Fitzpatrick skin-tone variants */
  avatar_emoji_tone?: number | null;
  /** 0–4: avatar ring / frame style */
  avatar_ring_style?: number | null;
}

// ─── Unit conversion helpers ─────────────────────────────────────────────────

/** Convert grams to display string based on user preference */
export function formatWeight(grams: number, units: UnitPreference): string {
  if (units === "metric") {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${grams.toFixed(0)} g`;
  }
  // Imperial: display as lbs + oz
  const totalOz = grams / 28.3495;
  const lbs = Math.floor(totalOz / 16);
  const oz = (totalOz % 16).toFixed(1);
  if (lbs === 0) return `${oz} oz`;
  return `${lbs} lb ${oz} oz`;
}

/** Convert lbs/oz inputs to grams for storage */
export function lbsOzToGrams(lbs: number, oz: number): number {
  return (lbs * 16 + oz) * 28.3495;
}

/** Convert kg/g input to grams for storage */
export function kgToGrams(kg: number): number {
  return kg * 1000;
}

/** Convert ml to display string based on user preference */
export function formatVolume(ml: number, units: UnitPreference): string {
  if (units === "metric") {
    return `${ml} mL`;
  }
  const oz = (ml / 29.5735).toFixed(1);
  return `${oz} oz`;
}

/** Convert fluid oz to ml for storage */
export function flOzToMl(flOz: number): number {
  return flOz * 29.5735;
}

/** Display birth date as MM-DD-YYYY from ISO YYYY-MM-DD */
export function formatBirthDateUs(iso: string): string {
  try {
    const d = parseISO(iso);
    if (!isValid(d)) return iso;
    return format(d, "MM-dd-yyyy");
  } catch {
    return iso;
  }
}
