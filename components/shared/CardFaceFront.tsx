"use client";

import { motion } from "framer-motion";
import { flipCardFront } from "@/styles/animations";
import { statCardHomeBorder, statCardRadialFill } from "@/lib/statCardSurface";

interface Props {
  color: string;
  textColor: string;
  label: string;
  emoji: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** Bottom-left label. Defaults to "today". */
  leftLabel?: string;
  children: React.ReactNode;
}

export function CardFaceFront({
  color,
  textColor,
  label,
  emoji,
  isExpanded = false,
  onToggleExpand,
  leftLabel = "today",
  children,
}: Props) {
  return (
    <motion.div
      variants={flipCardFront}
      className="flip-card-face w-full h-full rounded-2xl flex flex-col border"
      style={{
        paddingTop:    "var(--space-16)",
        paddingBottom: "var(--space-12)",
        paddingLeft:   "var(--space-16)",
        paddingRight:  "var(--space-16)",
        background:  statCardRadialFill(color),
        borderColor: statCardHomeBorder(color),
      }}
    >
      {/* Top chrome: pill label + emoji */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-medium px-2 py-0.5 rounded-full shrink-0"
          style={{ fontSize: "var(--text-xs)", background: `${color}20`, color: textColor }}
        >
          {label}
        </span>
        <span className="leading-none font-sans not-italic" style={{ fontSize: "var(--text-2xl)" }} aria-hidden>
          {emoji}
        </span>
      </div>

      {/* Expanded placeholder */}
      {isExpanded && (
        <div
          className="flex-1 flex items-center justify-center rounded-xl my-2 border border-dashed"
          style={{ borderColor: `${color}30` }}
        >
          <span className="text-[10px]" style={{ color: `${color}60` }}>
            Expanded view — coming soon
          </span>
        </div>
      )}

      {/* Card-specific content — sits at bottom of the available space */}
      <div className="flex-1 flex flex-col justify-end">
        {children}
      </div>

      {/* Bottom chrome: today (left) · tap to flip + optional expand btn (right) */}
      <div className="flex items-center justify-between" style={{ marginTop: "var(--space-16)" }}>
        <span className="text-[#8888AA]" style={{ fontSize: "var(--text-sm)" }}>{leftLabel}</span>
        <div className="flex items-center" style={{ gap: "var(--space-8)" }}>
          <span className="text-[#8888AA] uppercase tracking-wide" style={{ fontSize: "var(--text-2xs)" }}>tap to flip</span>
          {onToggleExpand && (
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
