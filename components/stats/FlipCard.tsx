"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { statEmoji, statLabel, statColor, statTextColor } from "@/styles/tokens";
import { CardFaceFront } from "@/components/shared/CardFaceFront";
import { CardFaceBack } from "@/components/shared/CardFaceBack";
import { StatChart } from "./StatChart";
import type { StatType } from "@/types/stats";

interface Props {
  babyId: string;
  statType: StatType;
  todayCount: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function FlipCard({ babyId, statType, todayCount, isExpanded = false, onToggleExpand }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const color     = statColor[statType];
  const textColor = statTextColor[statType];
  const emoji     = statEmoji[statType];
  const label     = statLabel[statType];

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
        <CardFaceFront
          color={color}
          textColor={textColor}
          label={label}
          emoji={emoji}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        >
          <div className="font-bold" style={{ fontSize: "var(--text-3xl)", color: textColor }}>
            {todayCount}
          </div>
        </CardFaceFront>

        <CardFaceBack
          color={color}
          textColor={textColor}
          period={period}
          onPeriodChange={setPeriod}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        >
          <StatChart babyId={babyId} statType={statType} period={period} />
        </CardFaceBack>
      </motion.div>
    </motion.div>
  );
}
