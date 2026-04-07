"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { dateToSlot } from "@/types/stats";

function todayYmd(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Live-updating current 15m slot index when `date` is today; otherwise `-1`. */
export function useCurrentDaySlot(date: string): number {
  const isToday = date === todayYmd();
  const [slot, setSlot] = useState(() => (isToday ? dateToSlot(new Date()) : -1));

  useEffect(() => {
    if (date !== todayYmd()) {
      setSlot(-1);
      return;
    }
    setSlot(dateToSlot(new Date()));
    const id = window.setInterval(() => setSlot(dateToSlot(new Date())), 60_000);
    return () => window.clearInterval(id);
  }, [date]);

  return slot;
}
