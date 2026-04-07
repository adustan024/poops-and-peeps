"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/styles/animations";
import type { StatType } from "@/types/stats";
import { IconChevronLeft } from "@/components/shared/IconChevronLeft";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";
import { statCardHomeBorder, statCardRadialFill } from "@/lib/statCardSurface";
import { statEmoji, statLabel, statColor, statTextColor } from "@/styles/tokens";

interface Props {
  initialValue: StatType[];
  onNext: (stats: StatType[]) => void;
  onBack: () => void;
}

const ALL_STATS: StatType[] = [
  "wet_diaper",
  "poop_diaper",
  "feeding",
  "sleep",
  "weight",
];

export function StepStatPicker({ initialValue, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<StatType>>(
    new Set(initialValue)
  );

  function toggle(stat: StatType) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(stat)) {
        next.delete(stat);
      } else {
        next.add(stat);
      }
      return next;
    });
  }

  return (
    <motion.div
      variants={staggerContainer}
      animate="animate"
      className="flex-1 flex flex-col px-6 pt-8"
    >
      <motion.div variants={staggerItem} className="text-center mb-8">
        <div className="text-6xl mb-4">📋</div>
        <ScreenTitleStack>
          <h1 className="type-page-headline">What to track?</h1>
          <p className="text-text-secondary text-base">
            Select everything you want to log. Turn others on/off anytime in
            settings.
          </p>
        </ScreenTitleStack>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 overflow-y-auto">
        {ALL_STATS.map((stat) => {
          const isOn = selected.has(stat);
          const color = statColor[stat];
          const textColor = statTextColor[stat];
          return (
            <button
              key={stat}
              type="button"
              onClick={() => toggle(stat)}
              className="w-full h-[156px] rounded-2xl p-4 flex flex-col justify-between border text-left transition-[border-color,background]"
              style={{
                borderColor: isOn
                  ? statCardHomeBorder(color)
                  : "var(--color-surface-600)",
                background: isOn
                  ? statCardRadialFill(color)
                  : "var(--color-surface-700)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={
                    isOn
                      ? { background: `${color}20`, color: textColor }
                      : {
                          background: "var(--color-surface-600)",
                          color: "var(--color-text-secondary)",
                        }
                  }
                >
                  {statLabel[stat]}
                </span>
                <span className="text-2xl leading-none" aria-hidden>
                  {statEmoji[stat]}
                </span>
              </div>

              <div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    color: isOn ? textColor : "var(--color-text-muted)",
                  }}
                >
                  {isOn ? "✓" : "—"}
                </div>
                <div className="text-[10px] text-[#8888AA] mt-0.5">
                  {isOn ? "tap to deselect" : "tap to select"}
                </div>
              </div>
            </button>
          );
        })}
      </motion.div>

      <div className="flex-1" />

      <motion.div variants={staggerItem} className="flex gap-3 pb-8 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-semibold text-base bg-[var(--color-surface-700)] text-[var(--color-text-secondary)] border border-[var(--color-surface-600)] flex items-center justify-center gap-2"
        >
          <IconChevronLeft className="w-5 h-5 shrink-0" />
          Back
        </button>
        <button
          onClick={() => onNext(Array.from(selected))}
          disabled={selected.size === 0}
          className="flex-[2] py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
          style={{ background: "var(--gradient-cta-primary)", color: "var(--color-text-primary)" }}
        >
          Continue →
        </button>
      </motion.div>
    </motion.div>
  );
}
