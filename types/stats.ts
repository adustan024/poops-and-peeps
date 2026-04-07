/**
 * types/stats.ts
 *
 * Core stat/tracking types used throughout the app.
 */

export type StatType =
  | "wet_diaper"
  | "poop_diaper"
  | "feeding"
  | "sleep"
  | "weight";

export type PoopColor = "yellow" | "green" | "brown" | "black";
export type FeedingMethod = "breast_left" | "breast_right" | "formula";

// ─── Entry Value Shapes (jsonb in DB) ────────────────────────────────────────

export interface WetDiaperValue {
  // no extra fields
}

export interface PoopDiaperValue {
  color: PoopColor;
}

export interface FeedingValue {
  methods: FeedingMethod[];
  amount_ml?: number;
}

export interface SleepValue {
  end_slot: number; // 0–95 (the slot where sleep ended)
}

// Union of all possible value shapes
export type EntryValue =
  | WetDiaperValue
  | PoopDiaperValue
  | FeedingValue
  | SleepValue;

// ─── Tracking Entry ──────────────────────────────────────────────────────────

export interface TrackingEntry {
  id: string;
  user_id: string;
  baby_id: string;
  entry_date: string;        // ISO date string "YYYY-MM-DD"
  time_slot: number;         // 0–95 (slot = hour*4 + quarter)
  stat_type: StatType;
  value: EntryValue;
  created_at: string;
  updated_at: string;
}

// ─── Daily Record ─────────────────────────────────────────────────────────────

export interface DailyRecord {
  id: string;
  user_id: string;
  baby_id: string;
  record_date: string;
  weight_grams?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── Tracked Stat (preferences) ──────────────────────────────────────────────

export interface TrackedStat {
  id: string;
  user_id: string;
  baby_id: string;
  stat_type: StatType;
  enabled: boolean;
  sort_order: number;
}

// ─── Summary types for charts/home ───────────────────────────────────────────

export interface DaySummary {
  date: string;           // "YYYY-MM-DD"
  counts: Partial<Record<StatType, number>>;
  hasEntries: boolean;
}

export interface MonthSummary {
  year: number;
  month: number;          // 1-indexed
  days: DaySummary[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a time_slot integer to a display string like "2:15 AM" */
export function slotToTimeString(slot: number): string {
  const totalMinutes = slot * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinute = minutes.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

/** Convert a Date to the nearest 15-min time_slot */
export function dateToSlot(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 4 + Math.floor(minutes / 15);
}

/** All stat types in display order */
export const ALL_STAT_TYPES: StatType[] = [
  "wet_diaper",
  "poop_diaper",
  "feeding",
  "sleep",
  "weight",
];

export function isSupportedStatType(value: string): value is StatType {
  return (ALL_STAT_TYPES as readonly string[]).includes(value);
}

/** Stats that use 15-min grid cells (vs. daily records) */
export const GRID_STAT_TYPES: StatType[] = [
  "wet_diaper",
  "poop_diaper",
  "feeding",
  "sleep",
];

/** Stats that open a bottom sheet on tap */
export const SHEET_STAT_TYPES: StatType[] = [
  "poop_diaper",
  "feeding",
  "sleep",
];

/** Stats that show a delete-confirm modal on pre-filled tap (no sheet) */
export const DIRECT_STAT_TYPES: StatType[] = ["wet_diaper"];
