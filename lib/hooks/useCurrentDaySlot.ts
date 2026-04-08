"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { dateToSlot } from "@/types/stats";
import { useAppNow } from "@/lib/appTimeContext";

/** Live-updating current 15m slot index when `date` is today; otherwise `-1`. */
export function useCurrentDaySlot(date: string): number {
  const appNow = useAppNow();
  const appNowRef = useRef(appNow);
  appNowRef.current = appNow;
  const todayYmd = format(appNow, "yyyy-MM-dd");
  const isToday = date === todayYmd;
  const [slot, setSlot] = useState(() =>
    isToday ? dateToSlot(appNow) : -1
  );

  useEffect(() => {
    if (date !== format(appNowRef.current, "yyyy-MM-dd")) {
      setSlot(-1);
      return;
    }
    setSlot(dateToSlot(appNowRef.current));
    const id = window.setInterval(
      () => setSlot(dateToSlot(appNowRef.current)),
      60_000
    );
    return () => window.clearInterval(id);
  }, [date, todayYmd, appNow]);

  return slot;
}
