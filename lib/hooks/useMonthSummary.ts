/**
 * lib/hooks/useMonthSummary.ts
 *
 * Aggregated entry counts per day for calendar indicator dots.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getEntriesForRange } from "@/lib/supabase/queries/entries";
import type { DaySummary, MonthSummary, StatType } from "@/types/stats";
import {
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
} from "date-fns";

export function useMonthSummary(
  babyId: string | undefined,
  year: number,
  month: number // 1-indexed
) {
  const monthDate = new Date(year, month - 1, 1);
  const startDate = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

  return useQuery<MonthSummary>({
    queryKey: ["monthSummary", babyId, year, month],
    queryFn: async () => {
      const entries = await getEntriesForRange(babyId!, startDate, endDate);

      // Build a map of date → counts per stat
      const countMap: Record<string, Partial<Record<StatType, number>>> = {};

      for (const entry of entries) {
        if (!countMap[entry.entry_date]) {
          countMap[entry.entry_date] = {};
        }
        const existing = countMap[entry.entry_date][entry.stat_type] ?? 0;
        countMap[entry.entry_date][entry.stat_type] = existing + 1;
      }

      const days: DaySummary[] = eachDayOfInterval({
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
      }).map((d) => {
        const dateStr = format(d, "yyyy-MM-dd");
        const counts = countMap[dateStr] ?? {};
        return {
          date: dateStr,
          counts,
          hasEntries: Object.keys(counts).length > 0,
        };
      });

      return { year, month, days };
    },
    enabled: !!babyId,
    staleTime: 60 * 1000,
  });
}
