"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO } from "date-fns";
import { getEntriesForRange } from "@/lib/supabase/queries/entries";
import { useAppNow } from "@/lib/appTimeContext";

const STAT_TYPE = "wet_diaper" as const;
const BAR_H     = 4;
const BAR_GAP   = 2;   // gap between bars within a stack
const COL_GAP   = 8;   // gap between day/week columns
const MAX_BARS  = 12;  // max bars rendered per stack

function barOpacity(index: number, total: number): number {
  if (total <= 1) return 1;
  return 1 - index * (0.9 / (total - 1));
}

function BarStack({
  count,
  textColor,
  isEmpty,
}: {
  count:     number;
  textColor: string;
  isEmpty:   boolean;
}) {
  const bars = isEmpty ? 1 : Math.min(count, MAX_BARS);
  return (
    <div className="flex flex-col-reverse" style={{ gap: BAR_GAP }}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="w-full rounded-full"
          style={{
            height:     BAR_H,
            background: textColor,
            opacity:    isEmpty ? 0.1 : barOpacity(i, bars),
          }}
        />
      ))}
    </div>
  );
}

interface Props {
  babyId:    string;
  period:    "week" | "month";
  textColor: string;
}

export function WetDiaperChart({ babyId, period, textColor }: Props) {
  const appNow = useAppNow();
  const today = format(appNow, "yyyy-MM-dd");
  const days  = period === "week" ? 7 : 30;
  const start = format(subDays(appNow, days - 1), "yyyy-MM-dd");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["wetDiaperChart", babyId, period],
    queryFn:  () => getEntriesForRange(babyId, start, today),
    staleTime: 60_000,
  });

  const columns = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const e of entries) {
      if (e.stat_type !== STAT_TYPE) continue;
      countMap[e.entry_date] = (countMap[e.entry_date] ?? 0) + 1;
    }

    if (period === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const date  = format(subDays(appNow, 6 - i), "yyyy-MM-dd");
        const count = countMap[date] ?? 0;
        return {
          label:   format(parseISO(date), "M/d"),
          count,
          isEmpty: count === 0,
        };
      });
    }

    // 30d → 4 weekly buckets, oldest first
    return Array.from({ length: 4 }, (_, w) => {
      const ago    = (3 - w) * 7;
      const dates  = Array.from({ length: 7 }, (_, d) =>
        format(subDays(appNow, ago + d), "yyyy-MM-dd")
      ).filter((d) => d >= start && d <= today);
      const logged = dates.map((d) => countMap[d] ?? 0).filter((c) => c > 0);
      const avg    = logged.length > 0
        ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length)
        : 0;
      return {
        label:   `${format(subDays(appNow, ago + 6), "M/d")} avg.`,
        count:   avg,
        isEmpty: avg === 0,
      };
    });
  }, [entries, period, start, today, appNow]);

  if (isLoading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${textColor}40`, borderTopColor: textColor }}
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "var(--space-8)" }}>
      <div className="flex items-end" style={{ gap: COL_GAP }}>
        {columns.map((col, i) => (
          <div key={i} className="flex-1 flex flex-col">
            <BarStack count={col.count} textColor={textColor} isEmpty={col.isEmpty} />
            <span
              className="text-center"
              style={{
                fontSize:  "var(--text-xs)",
                fontWeight: "var(--font-weight-bold)",
                color:     textColor,
                opacity:   0.8,
                marginTop: "var(--space-2)",
              }}
            >
              {col.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
