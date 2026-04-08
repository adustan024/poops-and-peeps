"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { CardFaceFront } from "@/components/shared/CardFaceFront";
import { CardFaceBack } from "@/components/shared/CardFaceBack";
import { getEntriesForRange } from "@/lib/supabase/queries/entries";
import { dateToSlot } from "@/types/stats";
import { useAppNow } from "@/lib/appTimeContext";
import type { TrackingEntry } from "@/types/stats";

const C  = "#6366F1";
const CT = "#818CF8";
const N  = 96;

// ─── Data helpers ────────────────────────────────────────────────────────────

function buildOccupied(entries: TrackingEntry[], date: string): Uint8Array {
  const occ = new Uint8Array(N);
  for (const e of entries) {
    if (e.entry_date !== date || e.stat_type !== "sleep") continue;
    const end = (e.value as { end_slot: number }).end_slot ?? e.time_slot;
    for (let i = e.time_slot; i <= Math.min(end, 95); i++) occ[i] = 1;
  }
  return occ;
}

function buildFrequency(entries: TrackingEntry[], dates: string[]): number[] {
  const freq = new Array<number>(N).fill(0);
  for (const d of dates) {
    const occ = buildOccupied(entries, d);
    for (let i = 0; i < N; i++) if (occ[i]) freq[i]++;
  }
  return freq;
}

function countSlots(occ: Uint8Array): number {
  return Array.from(occ).reduce((a, b) => a + b, 0);
}

function slotsToHM(slots: number): string {
  if (slots <= 0) return "—";
  const m = slots * 15;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

// ─── Gradient builders ────────────────────────────────────────────────────────

function solidGrad(occ: Uint8Array, currentSlot: number): string {
  const stops: string[] = [];
  let prev = "";
  for (let i = 0; i <= N; i++) {
    const pct = ((i / N) * 100).toFixed(2) + "%";
    if (i === N) { if (prev) stops.push(`${prev} ${pct}`); break; }
    const col = (currentSlot >= 0 && i > currentSlot)
      ? `${C}18`
      : occ[i] ? C : `${C}28`;
    if (col !== prev) {
      if (prev) stops.push(`${prev} ${pct}`);
      stops.push(`${col} ${pct}`);
      prev = col;
    }
  }
  return `linear-gradient(to right,${stops.join(",")})`;
}

function freqGrad(freq: number[]): string {
  const maxFreq = Math.max(1, ...freq);
  const stops: string[] = [];
  let prev = "";
  for (let i = 0; i <= N; i++) {
    const pct = ((i / N) * 100).toFixed(2) + "%";
    if (i === N) { if (prev) stops.push(`${prev} ${pct}`); break; }
    const r = freq[i] / maxFreq;
    const col = r === 0
      ? `${C}28`
      : `${C}${Math.round(0xBB + r * (0xFF - 0xBB)).toString(16).padStart(2, "0")}`;
    if (col !== prev) {
      if (prev) stops.push(`${prev} ${pct}`);
      stops.push(`${col} ${pct}`);
      prev = col;
    }
  }
  return `linear-gradient(to right,${stops.join(",")})`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StripRow({
  label,
  gradient,
  delay,
  stat,
  rowHeight = 7,
  fontSize = "var(--text-2xs)",
  labelWidth = "w-4",
}: {
  label: string;
  gradient: string;
  delay: number;
  stat?: string;
  rowHeight?: number;
  fontSize?: string;
  labelWidth?: string;
}) {
  return (
    <Fragment>
      <span
        className={`${labelWidth} font-bold shrink-0 text-right tabular-nums leading-none`}
        style={{ fontSize, color: `${CT}CC`, marginRight: "var(--space-8)" }}
      >
        {label}
      </span>
      <div className="min-w-0 w-full" style={{ paddingRight: "var(--space-8)" }}>
        <div
          className="relative w-full overflow-hidden rounded-[3px]"
          style={{ height: rowHeight }}
        >
          <div className="absolute inset-0" style={{ background: gradient }} />
          <motion.div
            className="absolute inset-0"
            style={{ background: "#0A0A0F" }}
            initial={{ x: "0%" }}
            animate={{ x: "101%" }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </div>
      {stat !== undefined ? (
        <span
          className="min-w-0 font-bold tabular-nums leading-none text-right"
          style={{ fontSize, color: `${CT}CC` }}
        >
          {stat}
        </span>
      ) : (
        <span className="min-w-0" aria-hidden />
      )}
    </Fragment>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface Props {
  babyId: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function SleepStripCard({ babyId, isExpanded = false, onToggleExpand: _onToggleExpand }: Props) {
  const appNow = useAppNow();
  const currentSlot = dateToSlot(appNow);
  const [isFlipped,   setIsFlipped]   = useState(false);
  const [period,      setPeriod]      = useState<"week" | "month">("week");
  const [backAnimKey, setBackAnimKey] = useState(0);

  const today     = format(appNow, "yyyy-MM-dd");
  const startDate = format(subDays(appNow, 27), "yyyy-MM-dd");

  useEffect(() => {
    if (isFlipped) setBackAnimKey((k) => k + 1);
  }, [isFlipped]);

  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: ["sleepRange", babyId, startDate, today],
    queryFn:  () => getEntriesForRange(babyId, startDate, today),
    enabled:  !!babyId,
    staleTime: 60_000,
  });

  const entries = useMemo(
    () => allEntries.filter((e) => e.stat_type === "sleep"),
    [allEntries]
  );

  // Front — today
  const todayOcc   = useMemo(() => buildOccupied(entries, today), [entries, today]);
  const dailyGrad  = useMemo(() => solidGrad(todayOcc, currentSlot), [todayOcc, currentSlot]);
  const sleepTotal = useMemo(() => slotsToHM(countSlots(todayOcc)), [todayOcc]);

  // Back — 7-day rows with per-day duration
  const weekRows = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(appNow, 6 - i), "yyyy-MM-dd");
      const occ = buildOccupied(entries, d);
      const slots = countSlots(occ);
      return {
        label:    format(subDays(appNow, 6 - i), "M/d"),
        gradient: solidGrad(occ, d === today ? currentSlot : -1),
        stat:     slotsToHM(slots),
      };
    }),
    [entries, today, currentSlot, appNow]
  );

  // Back — 4-week rows with smart average (only days with logged sleep)
  const monthRows = useMemo(() =>
    Array.from({ length: 4 }, (_, wi) => {
      const ago = (3 - wi) * 7;
      const dates = Array.from({ length: 7 }, (_, d) =>
        format(subDays(appNow, ago + d), "yyyy-MM-dd")
      ).filter((d) => d >= startDate && d <= today);

      const slotCounts = dates.map((d) => countSlots(buildOccupied(entries, d)));
      const daysWithData = slotCounts.filter((s) => s > 0);
      const avgSlots = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length)
        : 0;

      return {
        label:    format(subDays(appNow, ago + 6), "M/d"),
        gradient: freqGrad(buildFrequency(entries, dates)),
        stat:     daysWithData.length > 0 ? `${slotsToHM(avgSlots)} avg` : "—",
      };
    }),
    [entries, startDate, today, appNow]
  );

  const rows = period === "week" ? weekRows : monthRows;
  const rowCfg = period === "week"
    ? { rowHeight: 8,  fontSize: "var(--text-xs)", labelWidth: "w-7" }
    : { rowHeight: 16, fontSize: "var(--text-xs)", labelWidth: "w-7" };

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
          color={C}
          textColor={CT}
          label="Sleep"
          emoji="😴"
          isExpanded={isExpanded}
        >
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <motion.div
                className="w-full rounded-[3px]"
                style={{ height: 10, background: `${C}20` }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <div className="w-full relative overflow-hidden rounded-[4px]" style={{ height: 8 }}>
                <div className="absolute inset-0 rounded-[3px]" style={{ background: dailyGrad }} />
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "#0A0A0F" }}
                  initial={{ x: "0%" }}
                  animate={{ x: "101%" }}
                  transition={{ duration: 0.85, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            )}
            <div className="font-bold" style={{ fontSize: "var(--text-3xl)", color: CT }}>
              {sleepTotal}
            </div>
          </div>
        </CardFaceFront>

        {/* ── BACK ────────────────────────────────────────────────────── */}
        <CardFaceBack
          color={C}
          period={period}
          onPeriodChange={setPeriod}
          footerMarginTop="var(--space-12)"
        >
          <div
            className="grid h-full w-full items-center"
            style={{
              gridTemplateColumns: "auto minmax(0, 1fr) max-content",
              alignContent: "space-between",
            }}
          >
            {rows.map((row, i) => (
              <StripRow
                key={`${period}-${i}-${backAnimKey}`}
                label={row.label}
                gradient={row.gradient}
                delay={i * 0.055}
                stat={row.stat}
                rowHeight={rowCfg.rowHeight}
                fontSize={rowCfg.fontSize}
                labelWidth={rowCfg.labelWidth}
              />
            ))}
          </div>
        </CardFaceBack>

      </motion.div>
    </motion.div>
  );
}
