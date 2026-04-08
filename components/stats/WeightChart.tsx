"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, differenceInDays, subDays } from "date-fns";
import { useProfileStore } from "@/lib/store/profileStore";
import { statColor, statTextColor } from "@/styles/tokens";
import { formatWeight } from "@/types/profile";
import { getDailyRecordsForRange } from "@/lib/supabase/queries/daily-records";
import type { ChartPeriod } from "@/types/ui";
import { useAppNow } from "@/lib/appTimeContext";

// ─── WHO weight-for-age (combined sex approximation, grams) ──────────────────

const WHO_TABLE = [
  { d: 0,   p3: 2500, p15: 2900, p50: 3300, p85: 3800, p97: 4300 },
  { d: 30,  p3: 3400, p15: 3800, p50: 4300, p85: 4900, p97: 5400 },
  { d: 60,  p3: 4300, p15: 4800, p50: 5600, p85: 6300, p97: 7000 },
  { d: 90,  p3: 5100, p15: 5700, p50: 6400, p85: 7200, p97: 8000 },
  { d: 120, p3: 5600, p15: 6300, p50: 7000, p85: 7900, p97: 8800 },
  { d: 150, p3: 6000, p15: 6700, p50: 7500, p85: 8500, p97: 9400 },
  { d: 180, p3: 6400, p15: 7100, p50: 7900, p85: 9000, p97: 10000 },
  { d: 240, p3: 6800, p15: 7700, p50: 8600, p85: 9700, p97: 10900 },
  { d: 300, p3: 7100, p15: 8000, p50: 8900, p85: 10000, p97: 11200 },
  { d: 365, p3: 7700, p15: 8500, p50: 9600, p85: 10900, p97: 12200 },
  { d: 548, p3: 9000, p15: 9900, p50: 11100, p85: 12500, p97: 14000 },
  { d: 730, p3: 9800, p15: 10800, p50: 12200, p85: 13700, p97: 15400 },
];

type WhoRow = { p3: number; p15: number; p50: number; p85: number; p97: number };
type BandKey = keyof WhoRow;

function interpolateWHO(ageDays: number): WhoRow {
  const table = WHO_TABLE;
  if (ageDays <= 0) return table[0];
  const last = table[table.length - 1];
  if (ageDays >= last.d) return last;
  const idx = table.findIndex((r) => r.d >= ageDays);
  const a = table[idx - 1], b = table[idx];
  const t = (ageDays - a.d) / (b.d - a.d);
  return {
    p3:  a.p3  + t * (b.p3  - a.p3),
    p15: a.p15 + t * (b.p15 - a.p15),
    p50: a.p50 + t * (b.p50 - a.p50),
    p85: a.p85 + t * (b.p85 - a.p85),
    p97: a.p97 + t * (b.p97 - a.p97),
  };
}

function getBandAndPctile(
  ageDays: number,
  grams: number
): { lower: BandKey; upper: BandKey; pctile: number } {
  const w = interpolateWHO(ageDays);
  const lerp = (a: number, b: number, t: number) =>
    Math.round(a + (b - a) * Math.min(1, Math.max(0, t)));
  if (grams < w.p3)  return { lower: "p3",  upper: "p3",  pctile: lerp(0, 3,   grams / w.p3) };
  if (grams < w.p15) return { lower: "p3",  upper: "p15", pctile: lerp(3, 15,  (grams - w.p3)  / (w.p15 - w.p3)) };
  if (grams < w.p50) return { lower: "p15", upper: "p50", pctile: lerp(15, 50, (grams - w.p15) / (w.p50 - w.p15)) };
  if (grams < w.p85) return { lower: "p50", upper: "p85", pctile: lerp(50, 85, (grams - w.p50) / (w.p85 - w.p50)) };
  if (grams < w.p97) return { lower: "p85", upper: "p97", pctile: lerp(85, 97, (grams - w.p85) / (w.p97 - w.p85)) };
  return { lower: "p97", upper: "p97", pctile: 97 };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function ageLabel(ageDays: number): string {
  if (ageDays === 0) return "birth";
  if (ageDays < 14)  return `${ageDays}d`;
  if (ageDays < 91)  return `${Math.round(ageDays / 7)}w`;
  return `${Math.round(ageDays / 30.4)}mo`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  babyId: string;
  period: ChartPeriod;
}

export function WeightChart({ babyId }: Props) {
  const appNow    = useAppNow();
  const units     = useProfileStore((s) => s.profile?.units ?? "imperial");
  const baby      = useProfileStore((s) => s.baby);
  const color     = statColor.weight;
  const textColor = statTextColor.weight;

  const today     = appNow;
  const birthDate = baby?.birth_date ? parseISO(baby.birth_date) : subDays(today, 90);
  const totalDays = Math.max(1, differenceInDays(today, birthDate));

  const startDate = format(birthDate, "yyyy-MM-dd");
  const endDate   = format(today, "yyyy-MM-dd");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["weightChart", babyId, startDate, endDate],
    queryFn:  () => getDailyRecordsForRange(babyId, startDate, endDate),
    staleTime: 60_000,
  });

  const weightByDate: Record<string, number> = {};
  for (const r of records) {
    if (r.weight_grams != null && r.weight_grams > 0) {
      weightByDate[r.record_date] = r.weight_grams;
    }
  }

  // Actual weight data points sorted by age
  const actualData = Object.entries(weightByDate)
    .map(([date, grams]) => ({
      ageDays: Math.max(0, differenceInDays(parseISO(date), birthDate)),
      grams,
    }))
    .sort((a, b) => a.ageDays - b.ageDays);

  const latestEntry = actualData.length ? actualData[actualData.length - 1] : null;
  const { lower, upper, pctile } = latestEntry
    ? getBandAndPctile(latestEntry.ageDays, latestEntry.grams)
    : getBandAndPctile(totalDays, interpolateWHO(totalDays).p50);

  // WHO band data — smooth curves at the baby's current percentile band
  const step = Math.max(1, Math.ceil(totalDays / 80));
  const whoData = Array.from({ length: Math.ceil(totalDays / step) + 1 }, (_, i) => {
    const d = Math.min(i * step, totalDays);
    const w = interpolateWHO(d);
    const whoBase = lower === upper ? w[lower] * 0.92 : w[lower];
    const whoTop  = lower === upper ? w[upper] * 1.08 : w[upper];
    return { ageDays: d, whoBase, whoBand: whoTop - whoBase };
  });

  // Y-axis domain: start near birth weight, not 0
  const allGrams = actualData.map((d) => d.grams);
  const whoAtBirth = interpolateWHO(0);
  const minG = allGrams.length ? Math.min(...allGrams, whoAtBirth.p3) : whoAtBirth.p3;
  const maxG = allGrams.length ? Math.max(...allGrams, whoAtBirth.p97) : whoAtBirth.p97;
  const yPad = Math.max((maxG - minG) * 0.1, 200);
  const yMin = Math.max(0, minG - yPad);
  const yMax = maxG + yPad;

  // X-axis tick interval to show ~5 ticks
  const tickEvery = Math.max(step, Math.ceil(totalDays / 5 / step) * step);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-5 w-5 rounded-full border-2 animate-spin"
          style={{ borderColor: `${color}40`, borderTopColor: color }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chart */}
      <div className="flex-1 min-w-0 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={whoData} margin={{ top: 4, right: 4, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-weight-growth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="ageDays"
              type="number"
              domain={[0, totalDays]}
              scale="linear"
              ticks={Array.from(
                { length: Math.ceil(totalDays / tickEvery) + 1 },
                (_, i) => Math.min(i * tickEvery, totalDays)
              )}
              tick={(props) => {
                const { x, y, payload } = props as { x: number; y: number; payload: { value: number } };
                const label = ageLabel(payload.value);
                const anchor = payload.value === 0 ? "start" : payload.value >= totalDays ? "end" : "middle";
                return (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor={anchor}
                    style={{ fontSize: "var(--text-2xs)", fontWeight: "700", fill: "#8888AA" }}
                  >
                    {label}
                  </text>
                );
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[yMin, yMax]} hide />
            <Tooltip
              contentStyle={{
                background: "#1C1C26",
                border: `1px solid ${color}40`,
                borderRadius: 8,
                fontSize: 11,
                color: "#F0F0FF",
              }}
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value);
                return Number.isFinite(n) && n > 0 ? [formatWeight(n, units)] : ["—"];
              }}
              labelFormatter={(d) => ageLabel(Number(d))}
              cursor={{ stroke: `${color}30` }}
            />

            {/* WHO percentile band — transparent base + colored fill between bounds */}
            <Area
              type="monotone"
              dataKey="whoBase"
              stackId="who"
              stroke="none"
              fillOpacity={0}
              isAnimationActive={false}
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="whoBand"
              stackId="who"
              stroke="none"
              fill="#6366F1"
              fillOpacity={0.18}
              isAnimationActive={false}
              legendType="none"
            />

            {/* Actual baby weight curve with gradient fill + pink dots */}
            <Area
              data={actualData}
              type="monotone"
              dataKey="grams"
              stroke={color}
              strokeWidth={1.5}
              fill="url(#grad-weight-growth)"
              connectNulls
              dot={(props) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: { grams?: number } };
                if (!payload?.grams) return <g key={`dot-empty-${cx}`} />;
                return (
                  <circle
                    key={`dot-${cx}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={color}
                    stroke="#0A0A0F"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={{ r: 4, fill: color, stroke: "#0A0A0F", strokeWidth: 1 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Percentile line — below chart, above footer */}
      {latestEntry && (
        <div style={{ marginTop: "-12px" }}>
          <span
            className="font-bold leading-none tabular-nums"
            style={{ fontSize: "var(--text-2xl)", color: textColor }}
          >
            {ordinal(pctile)} percentile
          </span>
        </div>
      )}
    </div>
  );
}
