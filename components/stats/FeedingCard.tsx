"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { CardFaceFront } from "@/components/shared/CardFaceFront";
import { CardFaceBack } from "@/components/shared/CardFaceBack";
import { FeedingChart } from "./FeedingChart";
import { statColor, statTextColor, statEmoji, statLabel } from "@/styles/tokens";
import { getEntriesForDate } from "@/lib/supabase/queries/entries";
import { useProfileStore } from "@/lib/store/profileStore";
import type { FeedingValue } from "@/types/stats";

const STAT_TYPE = "feeding" as const;

const MAX_BAR_H = 48;
const MAX_BAR_W = 24;
const BAR_GAP   = 6;
const MIN_BAR_H = 8;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BarSpec {
  height: number;
  label?: string;
}

// ─── FeedingBars ──────────────────────────────────────────────────────────────

function FeedingBars({ bars }: { bars: BarSpec[] }) {
  const ref    = useRef<HTMLDivElement>(null);
  const [availW, setAvailW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAvailW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const count = bars.length;
  const barW  = availW > 0
    ? Math.min(MAX_BAR_W, Math.floor((availW - BAR_GAP * Math.max(0, count - 1)) / count))
    : MAX_BAR_W;

  return (
    <div
      ref={ref}
      className="flex flex-1 items-end"
      style={{ gap: BAR_GAP, height: MAX_BAR_H }}
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          className="relative overflow-hidden shrink-0 flex items-end justify-center"
          style={{
            width:        barW,
            height:       bar.height,
            borderRadius: 4,
            background:   "linear-gradient(to top, #22C55ECC, #22C55E4D)",
            paddingBottom: 4,
          }}
        >
          {bar.label && barW >= 12 && (
            <span
              className="font-bold text-white leading-none pointer-events-none select-none"
              style={{
                fontSize:    "var(--text-2xs)",
                writingMode: "vertical-rl",
                transform:   "rotate(180deg)",
              }}
            >
              {bar.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── FeedingCard ──────────────────────────────────────────────────────────────

interface Props {
  babyId: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function FeedingCard({ babyId, isExpanded = false, onToggleExpand: _onToggleExpand }: Props) {
  const [isFlipped,   setIsFlipped]   = useState(false);
  const [period,      setPeriod]      = useState<"week" | "month">("week");
  const [backAnimKey, setBackAnimKey] = useState(0);

  useEffect(() => {
    if (isFlipped) setBackAnimKey((k) => k + 1);
  }, [isFlipped]);

  useEffect(() => {
    setBackAnimKey((k) => k + 1);
  }, [period]);

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const units = useProfileStore((s) => s.profile?.units ?? "imperial");

  const color     = statColor[STAT_TYPE];
  const textColor = statTextColor[STAT_TYPE];
  const emoji     = statEmoji[STAT_TYPE];
  const label     = statLabel[STAT_TYPE];

  const { data: allEntries = [] } = useQuery({
    queryKey: ["dayEntries", babyId, today],
    queryFn:  () => getEntriesForDate(babyId, today),
    enabled:  !!babyId,
    staleTime: 30_000,
  });

  const feedings = useMemo(
    () => allEntries.filter((e) => e.stat_type === "feeding"),
    [allEntries]
  );

  const amounts = useMemo(
    () => feedings.map((f) => (f.value as FeedingValue).amount_ml ?? null),
    [feedings]
  );

  const hasAmounts = amounts.some((a) => a != null);

  // Build bar specs
  const bars = useMemo<BarSpec[]>(() => {
    if (!hasAmounts) {
      return feedings.map(() => ({ height: MAX_BAR_H }));
    }
    const maxAmount = Math.max(...amounts.map((a) => a ?? 0), 1);
    return feedings.map((_, i) => {
      const amt = amounts[i];
      if (amt == null) return { height: MAX_BAR_H };
      const h = Math.max(MIN_BAR_H, Math.round((amt / maxAmount) * MAX_BAR_H));
      const display = units === "imperial"
        ? `${parseFloat((amt / 29.5735).toFixed(1))}oz`
        : `${Math.round(amt)}ml`;
      return { height: h, label: display };
    });
  }, [feedings, amounts, hasAmounts, units]);

  // Total amount for V2 display
  const totalDisplay = useMemo(() => {
    if (!hasAmounts) return null;
    const totalMl = amounts.reduce<number>((s, a) => s + (a ?? 0), 0);
    if (units === "imperial") {
      const oz = totalMl / 29.5735;
      return { value: parseFloat(oz.toFixed(1)).toString(), unit: "oz" };
    }
    return { value: Math.round(totalMl).toString(), unit: "ml" };
  }, [amounts, hasAmounts, units]);

  return (
    <motion.div
      layout
      className="flip-card-container w-full cursor-pointer"
      style={{ height: isExpanded ? 300 : 156 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      onClick={() => setIsFlipped((v) => !v)}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        animate={isFlipped ? "back" : "front"}
      >
        {/* ── FRONT ──────────────────────────────────────────────────── */}
        <CardFaceFront
          color={color}
          textColor={textColor}
          label={label}
          emoji={emoji}
          isExpanded={isExpanded}
        >
          <div className="flex items-end w-full" style={{ gap: "var(--space-24)" }}>
            {/* Number: count (V1) or total amount (V2) */}
            {hasAmounts && totalDisplay ? (
              <div className="flex items-baseline shrink-0" style={{ gap: "2px", transform: "translateY(3px)" }}>
                <span
                  className="font-bold leading-none"
                  style={{ fontSize: "var(--text-3xl)", color: textColor }}
                >
                  {totalDisplay.value}
                </span>
                <span
                  className="font-bold leading-none"
                  style={{ fontSize: "var(--text-sm)", color: textColor }}
                >
                  {totalDisplay.unit}
                </span>
              </div>
            ) : (
              <span
                className="font-bold leading-none shrink-0"
                style={{ fontSize: "var(--text-3xl)", color: textColor, transform: "translateY(3px)" }}
              >
                {feedings.length || "—"}
              </span>
            )}

            {/* Bars */}
            {feedings.length > 0 && <FeedingBars bars={bars} />}
          </div>
        </CardFaceFront>

        {/* ── BACK ────────────────────────────────────────────────────── */}
        <CardFaceBack
          color={color}
          period={period}
          onPeriodChange={setPeriod}
          footerMarginTop="var(--space-12)"
        >
          <FeedingChart babyId={babyId} period={period} animKey={backAnimKey} />
        </CardFaceBack>
      </motion.div>
    </motion.div>
  );
}
