"use client";

import { motion } from "framer-motion";
import { flipCardBack } from "@/styles/animations";
import { statCardHomeBorder, statCardRadialFill } from "@/lib/statCardSurface";
import { PeriodToggle } from "./PeriodToggle";

interface Props {
  color: string;
  textColor?: string;
  /** Omit to hide the period toggle entirely */
  period?: "week" | "month";
  onPeriodChange?: (p: "week" | "month") => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** Optional node rendered between the period toggle and "tap to flip" */
  footerExtra?: React.ReactNode;
  /** Override the top margin above the footer row. Defaults to var(--space-12). */
  footerMarginTop?: string;
  children: React.ReactNode;
}

export function CardFaceBack({
  color,
  textColor,
  period,
  onPeriodChange,
  isExpanded = false,
  onToggleExpand,
  footerExtra,
  footerMarginTop = "0px",
  children,
}: Props) {
  return (
    <motion.div
      variants={flipCardBack}
      className="flip-card-face flip-card-back w-full h-full rounded-2xl flex flex-col border"
      style={{
        paddingTop:    "var(--space-12)",
        paddingBottom: "var(--space-12)",
        paddingLeft:   "var(--space-16)",
        paddingRight:  "var(--space-16)",
        background:  statCardRadialFill(color),
        borderColor: statCardHomeBorder(color),
      }}
    >
      {/* Card-specific content */}
      <div className="flex-1 min-h-0 min-w-0">
        {children}
      </div>

      {/* Bottom chrome: period toggle (left) · [footerExtra] · tap to flip + optional expand btn (right) */}
      <div className="flex items-center justify-between" style={{ marginTop: footerMarginTop }}>
        {period && onPeriodChange && (
          <PeriodToggle period={period} onChange={onPeriodChange} activeColor={color} />
        )}
        <div className="flex items-center ml-auto" style={{ gap: "var(--space-8)" }}>
          {footerExtra}
          <span className="text-[#8888AA] uppercase tracking-wide" style={{ fontSize: "var(--text-2xs)" }}>tap to flip</span>
          {onToggleExpand && textColor && (
            <motion.button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
              whileTap={{ scale: 0.85 }}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold leading-none"
              style={{
                fontSize: "var(--text-lg)",
                background: `${color}30`,
                color: textColor,
                border: `1px solid ${color}50`,
              }}
              aria-label={isExpanded ? "Collapse card" : "Expand card"}
            >
              <span className="block -translate-y-px leading-none">
                {isExpanded ? "−" : "+"}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
