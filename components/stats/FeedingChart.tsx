"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getEntriesForRange } from "@/lib/supabase/queries/entries";
import { useProfileStore } from "@/lib/store/profileStore";
import type { FeedingValue } from "@/types/stats";

const BG_COLOR   = "#0A0A0F";
const C          = "#22C55E";
const GRAD_BOT   = `linear-gradient(to top, ${C}CC, ${C}4D)`;
const GRAD_TOP   = `linear-gradient(to top, ${C}4D, ${C}CC)`;

// Card content height ≈ 96px; label ~16px → bars must fit in ~80px
const MAX_COL_H   = 74;   // V1 single bar
const MAX_STACK_H = 36;   // V2 each segment (36 + 2 gap + 36 = 74px total)
const STACK_GAP   = 2;
const COL_GAP     = 6;
const LABEL_MT    = 4;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mlToDisplay(ml: number, units: string): string {
  if (units === "imperial") {
    return `${parseFloat((ml / 29.5735).toFixed(1))}oz`;
  }
  return `${Math.round(ml)}ml`;
}

function fmtCount(n: number): string {
  const r = parseFloat(n.toFixed(1));
  return r % 1 === 0 ? String(Math.round(r)) : r.toFixed(1);
}

// ─── Bar label (horizontal, top- or bottom-aligned in bar) ───────────────────

function BarLabel({
  text,
  minH,
  barH,
  placement,
}: {
  text:      string;
  minH:      number;
  barH:      number;
  placement: "top" | "bottom";
}) {
  if (barH < minH) return null;
  return (
    <span
      className={`font-bold leading-none pointer-events-none select-none absolute inset-0 flex justify-center text-center overflow-hidden ${
        placement === "top" ? "items-start" : "items-end"
      }`}
      style={{
        fontSize:   "var(--text-xs)",
        fontWeight: "var(--font-weight-bold)",
        color:      "var(--color-surface-700)",
        ...(placement === "top"
          ? { paddingTop: "2px" }
          : { paddingBottom: "var(--space-4)" }),
      }}
    >
      {text}
    </span>
  );
}

// ─── Column component ─────────────────────────────────────────────────────────

interface ColProps {
  countH:       number;
  countLabel:   string;
  countFilled:  boolean;
  amountH:      number | null;
  amountLabel:  string | null;
  dateLabel:    string;
  delay:        number;
  animKey:      number;
}

function FeedingCol({
  countH,
  countLabel,
  countFilled,
  amountH,
  amountLabel,
  dateLabel,
  delay,
  animKey,
}: ColProps) {
  const hasAmounts = amountH !== null;

  return (
    <div className="flex flex-col items-center justify-end flex-1">

      {/* Top bar — amount (V2 only) */}
      {hasAmounts && (
        <>
          <div
            className="w-full relative overflow-hidden"
            style={{
              height:       Math.max(2, amountH!),
              borderRadius: 3,
              background:
                amountLabel != null && amountLabel !== "" ? GRAD_TOP : `${C}20`,
            }}
          >
            {amountLabel != null && amountLabel !== "" && (
              <>
                <BarLabel text={amountLabel} minH={16} barH={amountH!} placement="top" />
                <motion.div
                  key={`${animKey}-a`}
                  className="absolute inset-0"
                  style={{ background: BG_COLOR }}
                  initial={{ y: "0%" }}
                  animate={{ y: "-101%" }}
                  transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </>
            )}
          </div>
          <div style={{ height: STACK_GAP }} />
        </>
      )}

      {/* Bottom bar — count */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          height:       Math.max(2, countH),
          borderRadius: 3,
          background:   countFilled ? GRAD_BOT : `${C}20`,
        }}
      >
        {countFilled && (
          <>
            <BarLabel text={countLabel} minH={12} barH={countH} placement="bottom" />
            <motion.div
              key={`${animKey}-c`}
              className="absolute inset-0"
              style={{ background: BG_COLOR }}
              initial={{ y: "0%" }}
              animate={{ y: "-101%" }}
              transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </>
        )}
      </div>

      {/* Date label */}
      <span
        className="w-full text-center tabular-nums leading-none font-bold"
        style={{
          fontSize:  "var(--text-xs)",
          color:     `${C}CC`,
          marginTop: LABEL_MT,
        }}
      >
        {dateLabel}
      </span>
    </div>
  );
}

// ─── Main chart ───────────────────────────────────────────────────────────────

interface Props {
  babyId:  string;
  period:  "week" | "month";
  animKey: number;
}

export function FeedingChart({ babyId, period, animKey }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const start = format(subDays(new Date(), 27), "yyyy-MM-dd");
  const units = useProfileStore((s) => s.profile?.units ?? "imperial");

  const { data: entries = [], isLoading } = useQuery({
    queryKey:  ["feedingChart", babyId, period],
    queryFn:   () => getEntriesForRange(babyId, start, today),
    staleTime: 60_000,
  });

  const cols = useMemo(() => {
    const countMap:      Record<string, number> = {};
    const totalAmountMap: Record<string, number> = {};

    for (const e of entries) {
      if (e.stat_type !== "feeding") continue;
      countMap[e.entry_date] = (countMap[e.entry_date] ?? 0) + 1;
      const amt = (e.value as FeedingValue).amount_ml;
      if (amt != null) {
        totalAmountMap[e.entry_date] = (totalAmountMap[e.entry_date] ?? 0) + amt;
      }
    }

    const hasAnyAmounts = Object.keys(totalAmountMap).length > 0;

    if (period === "week") {
      const dates = Array.from({ length: 7 }, (_, i) =>
        format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
      );

      const maxCount  = Math.max(1, ...dates.map((d) => countMap[d] ?? 0));
      const totals    = dates.map((d) => totalAmountMap[d] ?? 0);
      const maxAmount = Math.max(1, ...totals);

      return dates.map((d, i) => {
        const count = countMap[d] ?? 0;
        const total = totals[i];
        const amountH = hasAnyAmounts
          ? total > 0
            ? Math.round((total / maxAmount) * MAX_STACK_H)
            : MAX_STACK_H
          : null;
        return {
          dateLabel:   format(parseISO(d), "M/d"),
          countH:      Math.round((count  / maxCount)  * (hasAnyAmounts ? MAX_STACK_H : MAX_COL_H)),
          countLabel:  String(count),
          countFilled: count > 0,
          amountH,
          amountLabel: hasAnyAmounts && total > 0 ? mlToDisplay(total, units) : null,
        };
      });
    }

    // 30d → 4 weekly buckets — amount = avg total daily amount across the week
    const buckets = Array.from({ length: 4 }, (_, w) => {
      const ago   = (3 - w) * 7;
      const dates = Array.from({ length: 7 }, (_, d) =>
        format(subDays(new Date(), ago + d), "yyyy-MM-dd")
      ).filter((d) => d >= start && d <= today);

      const totalCount = dates.reduce((s, d) => s + (countMap[d] ?? 0), 0);
      const avgCount   = dates.length > 0 ? totalCount / dates.length : 0;

      // avg of daily totals (only days that have amount data)
      const dailyTotals = dates
        .map((d) => totalAmountMap[d] ?? 0)
        .filter((t) => t > 0);
      const avgDailyTotal = dailyTotals.length > 0
        ? dailyTotals.reduce((s, t) => s + t, 0) / dailyTotals.length
        : 0;

      return {
        dateLabel:     `${format(subDays(new Date(), ago + 6), "M/d")} avg.`,
        avgCount,
        avgDailyTotal,
        totalCount,
      };
    });

    const maxCount = Math.max(1, ...buckets.map((b) => b.avgCount));
    const maxAmt   = Math.max(1, ...buckets.map((b) => b.avgDailyTotal));

    return buckets.map((b) => {
      const amountH = hasAnyAmounts
        ? b.avgDailyTotal > 0
          ? Math.round((b.avgDailyTotal / maxAmt) * MAX_STACK_H)
          : MAX_STACK_H
        : null;
      const countMaxH = hasAnyAmounts ? MAX_STACK_H : MAX_COL_H;
      const countH =
        b.totalCount === 0
          ? countMaxH
          : Math.round((b.avgCount / maxCount) * countMaxH);
      return {
        dateLabel:   b.dateLabel,
        countH,
        countLabel:  b.totalCount === 0 ? "—" : fmtCount(b.avgCount),
        countFilled: b.totalCount > 0,
        amountH,
        amountLabel:
          hasAnyAmounts && b.avgDailyTotal > 0 ? mlToDisplay(b.avgDailyTotal, units) : null,
      };
    });
  }, [entries, period, start, today, units]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: `${C}40`, borderTopColor: C }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-end w-full h-full" style={{ gap: COL_GAP }}>
      {cols.map((col, i) => (
        <FeedingCol
          key={`${animKey}-${i}`}
          countH={col.countH}
          countLabel={col.countLabel}
          countFilled={col.countFilled}
          amountH={col.amountH}
          amountLabel={col.amountLabel}
          dateLabel={col.dateLabel}
          delay={i * 0.055}
          animKey={animKey}
        />
      ))}
    </div>
  );
}
