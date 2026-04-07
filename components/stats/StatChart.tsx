"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getEntriesForRange } from "@/lib/supabase/queries/entries";
import { format, subDays, parseISO } from "date-fns";
import { statColor } from "@/styles/tokens";
import type { StatType } from "@/types/stats";
import type { ChartPeriod } from "@/types/ui";

interface Props {
  babyId: string;
  statType: StatType;
  period: ChartPeriod;
}

export function StatChart({ babyId, statType, period }: Props) {
  const today = new Date();
  const days = period === "day" ? 1 : period === "week" ? 7 : 30;
  const startDate = format(subDays(today, days - 1), "yyyy-MM-dd");
  const endDate = format(today, "yyyy-MM-dd");
  const color = statColor[statType];

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["chartEntries", babyId, statType, period],
    queryFn: () => getEntriesForRange(babyId, startDate, endDate),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${color}40`, borderTopColor: color }}
        />
      </div>
    );
  }

  // Aggregate counts per day for this stat type
  const countMap: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.stat_type !== statType) continue;
    countMap[entry.entry_date] = (countMap[entry.entry_date] ?? 0) + 1;
  }

  const chartData = Array.from({ length: days }, (_, i) => {
    const d = format(subDays(today, days - 1 - i), "yyyy-MM-dd");
    return {
      date: d,
      label: period === "month" ? format(parseISO(d), "d") : format(parseISO(d), "EEE"),
      count: countMap[d] ?? 0,
    };
  });

  const max = Math.max(...chartData.map((d) => d.count), 1);

  if (period === "week" || period === "month") {
    return (
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${statType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#8888AA" }}
              axisLine={false}
              tickLine={false}
              interval={period === "month" ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#8888AA" }}
              axisLine={false}
              tickLine={false}
              domain={[0, max + 1]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1C1C26",
                border: `1px solid ${color}40`,
                borderRadius: 8,
                fontSize: 11,
                color: "#F0F0FF",
              }}
              itemStyle={{ color }}
              cursor={{ stroke: `${color}30` }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${statType})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#8888AA" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#8888AA" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
