"use client";

import { memo } from "react";
import { StatCell } from "./StatCell";
import { TIME_COL_WIDTH } from "./DayGridHeader";
import { slotToTimeString } from "@/types/stats";
import { findEntry, findSleepEntryForSlot } from "@/lib/hooks/useDayEntries";
import type { TrackingEntry, StatType, TrackedStat } from "@/types/stats";
import { GRID_STAT_TYPES } from "@/types/stats";

interface Props {
  slot: number;
  trackedStats: TrackedStat[];
  entries: TrackingEntry[];
  isCurrentTimeSlot?: boolean;
  pendingSleepStartSlot: number | null;
  onCellTap: (slot: number, statType: StatType, existing: TrackingEntry | null) => void;
}

const ROW_HEIGHT = 48; // px — must match virtualizer itemSize

export const DayGridRow = memo(function DayGridRow({
  slot,
  trackedStats,
  entries,
  isCurrentTimeSlot = false,
  pendingSleepStartSlot,
  onCellTap,
}: Props) {
  const gridStats = trackedStats.filter(
    (ts) => ts.enabled && GRID_STAT_TYPES.includes(ts.stat_type)
  );

  const isHourMark = slot % 4 === 0;
  const timeLabel = isHourMark ? slotToTimeString(slot) : null;
  const isHourDividerBelow = (slot + 1) % 4 === 0;

  const isEvenHour = Math.floor(slot / 4) % 2 === 0;
  const zebraBg = isEvenHour ? "transparent" : "rgba(255,255,255,0.015)";
  const rowBg = isCurrentTimeSlot
    ? "color-mix(in srgb, var(--color-brand-amber) 4%, transparent)"
    : zebraBg;

  const statRowBorderBottom = isCurrentTimeSlot
    ? "1px solid transparent"
    : isHourDividerBelow
    ? "1px solid var(--color-surface-700)"
    : "1px solid rgba(255,255,255,0.04)";

  return (
    <div
      className="flex items-stretch"
      style={{
        height: ROW_HEIGHT,
        background: rowBg,
        boxShadow: isCurrentTimeSlot
          ? "inset 0 0 0 1px color-mix(in srgb, var(--color-brand-amber) 25%, transparent)"
          : undefined,
      }}
    >
      <div
        className="flex items-center justify-end pr-3 flex-shrink-0"
        style={{
          width: TIME_COL_WIDTH,
          borderBottom: isCurrentTimeSlot
            ? "1px solid transparent"
            : isHourDividerBelow
            ? "1px solid var(--color-surface-700)"
            : undefined,
        }}
      >
        {timeLabel && (
          <span className="text-[10px] text-[#8888AA] font-mono">
            {timeLabel}
          </span>
        )}
      </div>

      {/* Stat cells */}
      {gridStats.map((ts) => {
        const statType = ts.stat_type;
        let entry: TrackingEntry | null = null;
        let isSleepSpan = false;
        let isSleepStart = false;

        if (statType === "sleep") {
          const sleepEntry = findSleepEntryForSlot(entries, slot);
          if (sleepEntry) {
            entry = sleepEntry;
            isSleepStart = sleepEntry.time_slot === slot;
            isSleepSpan = !isSleepStart;
          }
        } else {
          entry = findEntry(entries, slot, statType) ?? null;
        }

        return (
          <div
            key={statType}
            className="flex-1 min-w-[44px]"
            style={{
              borderLeft: "1px solid var(--color-surface-700)",
              borderBottom: statRowBorderBottom,
            }}
          >
            <StatCell
              slot={slot}
              statType={statType}
              entry={entry}
              isSleepSpan={isSleepSpan}
              isSleepStart={isSleepStart}
              pendingSleepStartSlot={pendingSleepStartSlot}
              onTap={onCellTap}
            />
          </div>
        );
      })}
    </div>
  );
});

export { ROW_HEIGHT };
