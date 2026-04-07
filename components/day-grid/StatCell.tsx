"use client";

import { motion } from "framer-motion";
import { cellTapFeedback, cellFillPop } from "@/styles/animations";
import { statColor, statEmoji, poopColorHex } from "@/styles/tokens";
import type { TrackingEntry, StatType } from "@/types/stats";
import type { PoopColor } from "@/types/stats";

interface Props {
  slot: number;
  statType: StatType;
  entry: TrackingEntry | null;
  isSleepSpan?: boolean;
  isSleepStart?: boolean;
  pendingSleepStartSlot?: number | null;
  onTap: (slot: number, statType: StatType, existing: TrackingEntry | null) => void;
}

export function StatCell({
  slot,
  statType,
  entry,
  isSleepSpan = false,
  isSleepStart = false,
  pendingSleepStartSlot = null,
  onTap,
}: Props) {
  const isFilled = !!entry || isSleepSpan;
  const color = statColor[statType];

  let bgColor = color;
  if (statType === "poop_diaper" && entry) {
    const poopColor = (entry.value as { color: PoopColor }).color;
    bgColor = poopColorHex[poopColor] ?? color;
  }

  const pendingIdx =
    statType === "sleep" && pendingSleepStartSlot !== null && !entry
      ? slot - pendingSleepStartSlot
      : -99;
  const pendingFillAlpha =
    pendingIdx === 0
      ? "70"
      : pendingIdx === 1
        ? "38"
        : pendingIdx === 2
          ? "1A"
          : null;

  const showLoggedFill = !pendingFillAlpha && isFilled;

  const showSleepEmoji =
    statType === "sleep" &&
    (pendingIdx === 0 || (!!entry && !isSleepSpan));
  const showOtherEmoji =
    statType !== "sleep" && !!entry && !isSleepSpan;
  const showEmoji = showSleepEmoji || showOtherEmoji;

  return (
    <motion.button
      {...cellTapFeedback}
      onClick={() => onTap(slot, statType, entry)}
      className="relative flex items-center justify-center w-full h-full min-h-[48px] min-w-[44px] select-none"
      aria-label={`${statType} at slot ${slot}`}
    >
      {pendingFillAlpha && (
        <motion.div
          key={`pending-sleep-${statType}-${slot}`}
          variants={pendingIdx === 0 ? cellFillPop : undefined}
          initial={pendingIdx === 0 ? "initial" : undefined}
          animate={pendingIdx === 0 ? "animate" : undefined}
          className="absolute inset-[2px] rounded-[6px]"
          style={{
            background: `${bgColor}${pendingFillAlpha}`,
          }}
        />
      )}

      {showLoggedFill && (
        <motion.div
          key={`fill-${statType}-${slot}`}
          variants={isSleepSpan && !isSleepStart ? undefined : cellFillPop}
          initial={isSleepSpan && !isSleepStart ? undefined : "initial"}
          animate={isSleepSpan && !isSleepStart ? undefined : "animate"}
          className="absolute inset-[2px] rounded-[6px]"
          style={{
            background: `${bgColor}${isSleepSpan ? "55" : "70"}`,
          }}
        />
      )}

      {showEmoji && (
        <motion.span
          key={`emoji-${statType}-${slot}`}
          variants={cellFillPop}
          initial="initial"
          animate="animate"
          className="relative z-10 text-xl leading-none pointer-events-none"
        >
          {statType === "poop_diaper" ? "💩" : statEmoji[statType]}
        </motion.span>
      )}
    </motion.button>
  );
}
