"use client";

import { useState } from "react";
import { IconChevronLeft } from "@/components/shared/IconChevronLeft";
import { motion } from "framer-motion";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";
import { staggerContainer, staggerItem } from "@/styles/animations";

interface Props {
  initialValue: string;
  onNext: (date: string) => void;
  onBack: () => void;
}

export function StepBirthDate({ initialValue, onNext, onBack }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(initialValue || today);

  const isValid = date && date <= today;

  return (
    <motion.div
      variants={staggerContainer}
      animate="animate"
      className="flex-1 flex flex-col px-6 pt-8"
    >
      <motion.div variants={staggerItem} className="text-center mb-10">
        <div className="text-6xl mb-4">👶</div>
        <ScreenTitleStack>
          <h1 className="type-page-headline">When were they born?</h1>
          <p className="text-text-secondary text-base">
            This helps us track age milestones and start your calendar on the
            right day.
          </p>
        </ScreenTitleStack>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-3">
        <label
          htmlFor="birth-date"
          className="block text-sm font-medium text-[#9999BB] uppercase tracking-wider"
        >
          Date of Birth
        </label>
        <input
          id="birth-date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-4 text-xl font-semibold text-[#F0F0FF] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors"
          style={{ colorScheme: "dark" }}
        />
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
          onClick={() => onNext(date)}
          disabled={!isValid}
          className="flex-[2] py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
          style={{ background: "var(--gradient-cta-primary)", color: "var(--color-text-primary)" }}
        >
          Continue →
        </button>
      </motion.div>
    </motion.div>
  );
}
