"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
  isAfter,
} from "date-fns";
import { useUIStore } from "@/lib/store/uiStore";
import { useAppNow } from "@/lib/appTimeContext";
import { useMonthSummary } from "@/lib/hooks/useMonthSummary";
import { calendarMonthShellRadial } from "@/lib/statCardSurface";
import { statColor } from "@/styles/tokens";
import type { StatType } from "@/types/stats";

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Props {
  babyId: string | undefined;
  birthDate: string; // "YYYY-MM-DD"
}

export function CalendarMonthView({ babyId, birthDate }: Props) {
  const router = useRouter();
  const appNow = useAppNow();
  const { calendarMonth, setCalendarMonth } = useUIStore();
  const { year, month } = calendarMonth;

  const { data: summary } = useMonthSummary(babyId, year, month);

  const monthDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart);
  const today = appNow;
  const birth = parseISO(birthDate);

  function navMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setCalendarMonth(newYear, newMonth);
  }

  function handleDayTap(dateStr: string) {
    router.push(`/day/${dateStr}`);
  }

  const summaryMap = Object.fromEntries(
    (summary?.days ?? []).map((d) => [d.date, d])
  );

  return (
    <div
      className="rounded-2xl overflow-hidden mx-4 border border-[#1C1C26]"
      style={{ background: calendarMonthShellRadial() }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C1C26]">
        <button
          type="button"
          onClick={() => navMonth(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1C1C26] text-[#9999BB] text-base"
        >
          ‹
        </button>
        <h2 className="text-sm font-semibold text-[#F0F0FF]">
          {format(monthDate, "MMMM yyyy")}
        </h2>
        <button
          type="button"
          onClick={() => navMonth(1)}
          disabled={isAfter(new Date(year, month, 1), today)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1C1C26] text-[#9999BB] text-base disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-medium text-[#8888AA] uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[2px] p-2">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = isSameDay(day, today);
          const isFuture = isAfter(day, today);
          const isBeforeBirth = day < birth;
          const daySummary = summaryMap[dateStr];
          const hasEntries = daySummary?.hasEntries ?? false;

          const dotColors: string[] = hasEntries
            ? (Object.entries(daySummary?.counts ?? {}) as [StatType, number][])
                .filter(([, c]) => c > 0)
                .slice(0, 3)
                .map(([st]) => statColor[st])
            : [];

          return (
            <motion.button
              key={dateStr}
              type="button"
              onClick={() => !isFuture && !isBeforeBirth && handleDayTap(dateStr)}
              whileTap={!isFuture && !isBeforeBirth ? { scale: 0.9 } : undefined}
              disabled={isFuture || isBeforeBirth}
              className="flex flex-col items-center justify-center rounded-xl gap-0.5 aspect-square transition-colors"
              style={{
                background: isToday
                  ? "rgba(124, 58, 237, 0.2)"
                  : "transparent",
                opacity: isFuture || isBeforeBirth ? 0.25 : 1,
              }}
            >
              <span
                className="text-sm font-medium"
                style={{
                  color: isToday ? "#A78BFA" : "#F0F0FF",
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {format(day, "d")}
              </span>

              <div className="flex gap-[2px] h-[5px]">
                {dotColors.map((color, i) => (
                  <div
                    key={i}
                    className="w-[5px] h-[5px] rounded-full"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
