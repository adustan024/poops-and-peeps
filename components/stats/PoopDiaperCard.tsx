"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { statEmoji, statLabel, statColor, statTextColor } from "@/styles/tokens";
import { CardFaceFront } from "@/components/shared/CardFaceFront";
import { CardFaceBack } from "@/components/shared/CardFaceBack";
import { PoopDiaperChart } from "./PoopDiaperChart";

const STAT_TYPE = "poop_diaper" as const;
const BAR_HEIGHT = 24;
const BAR_GAP    = 8;

function PoopBars({
  count,
  textColor,
  color,
}: {
  count: number;
  textColor: string;
  color: string;
}) {
  const containerRef           = useRef<HTMLDivElement>(null);
  const [totalWidth, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const barWidth = totalWidth > 0
    ? (totalWidth - BAR_GAP * (count - 1)) / count
    : 0;

  return (
    <div
      ref={containerRef}
      className="flex flex-1"
      style={{ gap: BAR_GAP }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            height:             BAR_HEIGHT,
            borderRadius:       9999,
            backgroundImage:    `linear-gradient(to right, ${textColor}, ${color})`,
            backgroundSize:     `${totalWidth}px 100%`,
            backgroundPosition: `-${i * (barWidth + BAR_GAP)}px 0`,
          }}
        />
      ))}
    </div>
  );
}

interface Props {
  babyId: string;
  todayCount: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function PoopDiaperCard({
  babyId,
  todayCount,
  isExpanded = false,
  onToggleExpand,
}: Props) {
  const [isFlipped,   setIsFlipped]   = useState(false);
  const [period,      setPeriod]      = useState<"week" | "month">("week");
  const [backAnimKey, setBackAnimKey] = useState(0);

  useEffect(() => {
    if (isFlipped) setBackAnimKey((k) => k + 1);
  }, [isFlipped]);

  useEffect(() => {
    setBackAnimKey((k) => k + 1);
  }, [period]);

  const color     = statColor[STAT_TYPE];
  const textColor = statTextColor[STAT_TYPE];
  const emoji     = statEmoji[STAT_TYPE];
  const label     = statLabel[STAT_TYPE];

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
        >
          <div className="flex items-end w-full" style={{ gap: "var(--space-24)" }}>
            <div
              className="font-bold shrink-0"
              style={{ fontSize: "var(--text-3xl)", color: textColor }}
            >
              {todayCount || "—"}
            </div>
            {todayCount > 0 && (
              <PoopBars count={todayCount} textColor={textColor} color={color} />
            )}
          </div>
        </CardFaceFront>

        <CardFaceBack
          color={color}
          textColor={textColor}
          period={period}
          onPeriodChange={setPeriod}
          footerMarginTop="var(--space-12)"
        >
          <PoopDiaperChart
            babyId={babyId}
            period={period}
            textColor={textColor}
            animKey={backAnimKey}
          />
        </CardFaceBack>
      </motion.div>
    </motion.div>
  );
}
