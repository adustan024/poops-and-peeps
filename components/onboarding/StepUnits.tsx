"use client";

import { useState } from "react";
import { IconChevronLeft } from "@/components/shared/IconChevronLeft";
import { motion } from "framer-motion";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";
import { staggerContainer, staggerItem } from "@/styles/animations";
import type { UnitPreference } from "@/types/profile";

interface Props {
  initialValue: UnitPreference;
  onNext: (units: UnitPreference) => void;
  onBack: () => void;
}

const options: { value: UnitPreference; label: string; sub: string; emoji: string }[] = [
  {
    value: "imperial",
    label: "lbs · oz · fl oz",
    sub: "Pounds, ounces, fluid ounces",
    emoji: "🇺🇸",
  },
  {
    value: "metric",
    label: "kg · mL",
    sub: "Kilograms, grams, milliliters",
    emoji: "🌍",
  },
];

export function StepUnits({ initialValue, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<UnitPreference>(initialValue);

  return (
    <motion.div
      variants={staggerContainer}
      animate="animate"
      className="flex-1 flex flex-col px-6 pt-8"
    >
      <motion.div variants={staggerItem} className="text-center mb-10">
        <div className="text-6xl mb-4">⚖️</div>
        <ScreenTitleStack>
          <h1 className="type-page-headline">Which units?</h1>
          <p className="text-text-secondary text-base">
            Used for weight and feeding amounts. You can change this anytime in
            settings.
          </p>
        </ScreenTitleStack>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all"
            style={{
              borderColor: selected === opt.value ? "#7C3AED" : "#252533",
              background:
                selected === opt.value
                  ? "rgba(124, 58, 237, 0.12)"
                  : "#1C1C26",
            }}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <div>
              <div className="text-lg font-semibold text-[#F0F0FF]">
                {opt.label}
              </div>
              <div className="text-sm text-[#9999BB]">{opt.sub}</div>
            </div>
            {selected === opt.value && (
              <div className="ml-auto w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </button>
        ))}
      </motion.div>

      <div className="flex-1" />

      <motion.div variants={staggerItem} className="flex gap-3 pb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-semibold text-base bg-[#1C1C26] text-[#9999BB] border border-[#252533] flex items-center justify-center gap-2"
        >
          <IconChevronLeft className="w-5 h-5 shrink-0" />
          Back
        </button>
        <button
          onClick={() => onNext(selected)}
          className="flex-[2] py-4 rounded-2xl font-semibold text-base"
          style={{ background: "var(--gradient-cta-primary)", color: "var(--color-text-primary)" }}
        >
          Continue →
        </button>
      </motion.div>
    </motion.div>
  );
}
