"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { statEmoji, statLabel, statColor, statTextColor } from "@/styles/tokens";
import { CardFaceFront } from "@/components/shared/CardFaceFront";
import { CardFaceBack } from "@/components/shared/CardFaceBack";
import { WetDiaperChart } from "./WetDiaperChart";

const STAT_TYPE = "wet_diaper" as const;
const BASE_HEIGHT = 156;
const BAR_H = 4;
const BAR_GAP = 3;
const BARS_FIT = 8; // bars that fit at base height without growing

interface Props {
  babyId: string;
  todayCount: number;
}

function opacityFor(index: number, total: number): number {
  if (total === 1) return 1;
  return 1 - index * (0.9 / (total - 1));
}

function WetDiaperBars({ count, color }: { count: number; color: string }) {
  if (count === 0) {
    return (
      <div
        className="font-bold"
        style={{ fontSize: "var(--text-3xl)", color }}
      >
        0
      </div>
    );
  }

  return (
    <div className="flex items-end" style={{ gap: 24 }}>
      <span
        className="font-bold shrink-0"
        style={{ fontSize: "var(--text-3xl)", color }}
      >
        {count}
      </span>
      <div className="flex-1 flex flex-col-reverse" style={{ gap: BAR_GAP }}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="w-full rounded-full"
            style={{
              height: BAR_H,
              background: color,
              opacity: opacityFor(i, count),
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function WetDiaperFlipCard({ babyId, todayCount }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const color     = statColor[STAT_TYPE];
  const textColor = statTextColor[STAT_TYPE];
  const emoji     = statEmoji[STAT_TYPE];
  const label     = statLabel[STAT_TYPE];

  const overflow = Math.max(0, todayCount - BARS_FIT);
  const cardHeight = BASE_HEIGHT + overflow * (BAR_H + BAR_GAP);

  return (
    <motion.div
      layout
      className="flip-card-container w-full cursor-pointer"
      style={{ height: cardHeight }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      onClick={() => setIsFlipped((v) => !v)}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        animate={isFlipped ? "back" : "front"}
      >
        <CardFaceFront
          color={color}
          textColor={textColor}
          label={label}
          emoji={emoji}
        >
          <WetDiaperBars count={todayCount} color={textColor} />
        </CardFaceFront>

        <CardFaceBack
          color={color}
          textColor={textColor}
          period={period}
          onPeriodChange={setPeriod}
        >
          <WetDiaperChart babyId={babyId} period={period} textColor={textColor} />
        </CardFaceBack>
      </motion.div>
    </motion.div>
  );
}
