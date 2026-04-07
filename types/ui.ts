/**
 * types/ui.ts
 *
 * UI-layer types: sheet configs, grid state, navigation.
 */

import type { StatType } from "./stats";

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

export type SheetType =
  | "poop_diaper"
  | "feeding"
  | "sleep"
  | "tummy_time"
  | "weight"
  | "photo";

export interface SheetConfig {
  type: SheetType;
  /** The time slot the sheet was opened from (for grid-based sheets) */
  slot?: number;
  /** Existing entry id if editing */
  entryId?: string;
  /** Pre-filled values when editing */
  initialValue?: Record<string, unknown>;
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

export interface DeleteConfirmConfig {
  entryId: string;
  statType: StatType;
  slot: number;
}

// ─── Grid Cell ───────────────────────────────────────────────────────────────

export interface GridCellCoord {
  slot: number;      // 0–95
  statType: StatType;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type NavigationDirection = "forward" | "back";

// ─── Flip Card State ──────────────────────────────────────────────────────────

export type ChartPeriod = "day" | "week" | "month";

export interface FlipCardState {
  statType: StatType;
  isFlipped: boolean;
  chartPeriod: ChartPeriod;
}
