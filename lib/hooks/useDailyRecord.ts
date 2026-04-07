"use client";

import { useQuery } from "@tanstack/react-query";
import { getDailyRecord } from "@/lib/supabase/queries/daily-records";
import type { DailyRecord } from "@/types/stats";

export function useDailyRecord(babyId: string | null, date: string | null) {
  return useQuery({
    queryKey: ["dailyRecord", babyId, date],
    queryFn: async (): Promise<DailyRecord | null> => {
      if (!babyId || !date) return null;
      return getDailyRecord(babyId, date);
    },
    enabled: !!babyId && !!date,
  });
}
