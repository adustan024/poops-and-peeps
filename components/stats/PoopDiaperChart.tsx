"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getEntriesForRange } from "@/lib/supabase/queries/entries";

const STAT_TYPE = "poop_diaper" as const;
const BG_COLOR  = "#0A0A0F";
const LABEL_GAP = 8;  // px between label and bar area

// ─── 7d constants ─────────────────────────────────────────────────────────────
const ROW_H_7D   = 8;
const BAR_GAP_7D = 8;
const LABEL_W_7D = 28;  // fits "M/d" at text-xs bold

// ─── 30d constants ────────────────────────────────────────────────────────────
const ROW_H_30D   = 16;
const BAR_GAP_30D = 8;
const LABEL_W_30D = 56;  // fits "M/dd avg." at text-xs bold

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  label:     string;
  count:     number;
  barH:      number;
  barGap:    number;
  labelW:    number;
  textColor: string;
  animDelay: number;
}

function PoopChartRow({
  label,
  count,
  barH,
  barGap,
  labelW,
  textColor,
  animDelay,
}: RowProps) {
  const bars    = Math.max(1, count);
  const isEmpty = count === 0;

  return (
    <div className="flex items-center" style={{ gap: LABEL_GAP }}>
      <span
        className="tabular-nums text-right shrink-0 font-bold leading-none"
        style={{
          width:    labelW,
          fontSize: "var(--text-xs)",
          color:    `${textColor}CC`,
        }}
      >
        {label}
      </span>

      <div className="flex flex-1" style={{ gap: barGap }}>
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            className="flex-1 relative overflow-hidden"
            style={{ height: barH, borderRadius: 9999 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: isEmpty ? `${textColor}20` : textColor,
              }}
            />
            <motion.div
              className="absolute inset-0"
              style={{ background: BG_COLOR }}
              initial={{ x: "0%" }}
              animate={{ x: "101%" }}
              transition={{
                duration: 0.45,
                delay:    animDelay,
                ease:     [0.25, 0.46, 0.45, 0.94],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main chart ───────────────────────────────────────────────────────────────

interface Props {
  babyId:    string;
  period:    "week" | "month";
  textColor: string;
  animKey:   number;
}

export function PoopDiaperChart({ babyId, period, textColor, animKey }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const days  = period === "week" ? 7 : 30;
  const start = format(subDays(new Date(), days - 1), "yyyy-MM-dd");

  const { data: entries = [], isLoading } = useQuery({
    queryKey:  ["poopChart", babyId, period],
    queryFn:   () => getEntriesForRange(babyId, start, today),
    staleTime: 60_000,
  });

  const rows = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const e of entries) {
      if (e.stat_type !== STAT_TYPE) continue;
      countMap[e.entry_date] = (countMap[e.entry_date] ?? 0) + 1;
    }

    if (period === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
        return {
          label: format(parseISO(date), "M/d"),
          count: countMap[date] ?? 0,
        };
      });
    }

    // 30d → 4 weekly buckets, oldest first
    // Average includes 0-poop days per spec
    return Array.from({ length: 4 }, (_, w) => {
      const ago   = (3 - w) * 7;
      const label = `${format(subDays(new Date(), ago + 6), "M/d")} avg.`;
      const dates = Array.from({ length: 7 }, (_, d) =>
        format(subDays(new Date(), ago + d), "yyyy-MM-dd")
      ).filter((d) => d >= start && d <= today);
      const sum = dates.reduce((a, d) => a + (countMap[d] ?? 0), 0);
      const avg = dates.length > 0 ? sum / dates.length : 0;
      return { label, count: Math.round(avg) };
    });
  }, [entries, period, start, today]);

  const barH   = period === "week" ? ROW_H_7D  : ROW_H_30D;
  const barGap = period === "week" ? BAR_GAP_7D : BAR_GAP_30D;
  const labelW = period === "week" ? LABEL_W_7D : LABEL_W_30D;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: `${textColor}40`, borderTopColor: textColor }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full w-full">
      {rows.map((row, i) => (
        <PoopChartRow
          key={`${animKey}-${i}`}
          label={row.label}
          count={row.count}
          barH={barH}
          barGap={barGap}
          labelW={labelW}
          textColor={textColor}
          animDelay={i * 0.055}
        />
      ))}
    </div>
  );
}
