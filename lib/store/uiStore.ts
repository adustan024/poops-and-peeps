/**
 * lib/store/uiStore.ts
 *
 * Ephemeral UI state: open sheets, modals, selected date, sleep tracking.
 */

import { create } from "zustand";
import type { SheetConfig, DeleteConfirmConfig } from "@/types/ui";
import type { StatType } from "@/types/stats";

interface SleepStartState {
  slot: number;
  statType: "sleep";
  date: string; // "YYYY-MM-DD" — date the first tap happened on
}

interface UIState {
  // ─── Active sheet ───────────────────────────────────────────
  activeSheet: SheetConfig | null;
  openSheet: (config: SheetConfig) => void;
  closeSheet: () => void;

  // ─── Delete confirm modal ────────────────────────────────────
  deleteConfirm: DeleteConfirmConfig | null;
  openDeleteConfirm: (config: DeleteConfirmConfig) => void;
  closeDeleteConfirm: () => void;

  // ─── Sleep "tap-to-start" state ──────────────────────────────
  // When a user taps a sleep cell the first time, we hold the start slot
  // here. The next tap on a different slot completes the sleep range.
  sleepStart: SleepStartState | null;
  setSleepStart: (state: SleepStartState | null) => void;

  // ─── Selected date (day grid navigation) ────────────────────
  selectedDate: string; // "YYYY-MM-DD"
  setSelectedDate: (date: string) => void;

  // ─── Calendar view month ─────────────────────────────────────
  calendarMonth: { year: number; month: number }; // month 1-indexed
  setCalendarMonth: (year: number, month: number) => void;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const useUIStore = create<UIState>((set) => ({
  activeSheet: null,
  openSheet: (config) => set({ activeSheet: config }),
  closeSheet: () => set({ activeSheet: null }),

  deleteConfirm: null,
  openDeleteConfirm: (config) => set({ deleteConfirm: config }),
  closeDeleteConfirm: () => set({ deleteConfirm: null }),

  sleepStart: null,
  setSleepStart: (state) => set({ sleepStart: state }),

  selectedDate: todayStr(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  calendarMonth: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
  setCalendarMonth: (year, month) => set({ calendarMonth: { year, month } }),
}));
