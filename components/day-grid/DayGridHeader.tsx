"use client";

import { statEmoji, statLabel, statTextColor } from "@/styles/tokens";
import type { TrackedStat } from "@/types/stats";
import { GRID_STAT_TYPES } from "@/types/stats";

interface Props {
  trackedStats: TrackedStat[];
}

const TIME_COL_WIDTH = 64; // px

export function DayGridHeader({ trackedStats }: Props) {
  const gridStats = trackedStats.filter(
    (ts) => ts.enabled && GRID_STAT_TYPES.includes(ts.stat_type)
  );

  return (
    <div
      className="flex items-stretch bg-[var(--color-surface-800)] border-b border-[var(--color-surface-700)] sticky top-0 z-20"
      style={{ paddingLeft: TIME_COL_WIDTH }}
    >
      {gridStats.map((ts) => (
        <div
          key={ts.stat_type}
          className="flex-1 flex flex-col items-center justify-start gap-0.5 min-w-[44px] py-3"
          style={{ borderLeft: "1px solid var(--color-surface-700)" }}
        >
          <span className="text-base leading-none">{statEmoji[ts.stat_type]}</span>
          <span
            className="text-[10px] font-medium uppercase tracking-wide text-center w-full px-0.5 leading-none"
            style={{ color: statTextColor[ts.stat_type] }}
          >
            {statLabel[ts.stat_type]}
          </span>
        </div>
      ))}
    </div>
  );
}

export { TIME_COL_WIDTH };
