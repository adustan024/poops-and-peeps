"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";
import { staggerContainer, staggerItem } from "@/styles/animations";

interface Props {
  initialValue: string;
  onNext: (name: string) => void;
}

export function StepBabyName({ initialValue, onNext }: Props) {
  const [name, setName] = useState(initialValue);

  return (
    <motion.div
      variants={staggerContainer}
      animate="animate"
      className="flex-1 flex flex-col px-6 pt-8"
    >
      {/* Celebration header */}
      <motion.div variants={staggerItem} className="text-center mb-10">
        <div className="text-6xl mb-4">🎉</div>
        <ScreenTitleStack>
          <h1 className="type-page-headline">Congratulations!</h1>
          <p className="text-text-secondary text-base leading-relaxed">
            Welcome to the wild, wonderful adventure of parenthood.
            Let&apos;s get your little one set up.
          </p>
        </ScreenTitleStack>
      </motion.div>

      {/* Input */}
      <motion.div variants={staggerItem} className="space-y-3">
        <label
          htmlFor="baby-name"
          className="block text-sm font-medium text-[#9999BB] uppercase tracking-wider"
        >
          Baby&apos;s Name
        </label>
        <input
          id="baby-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Oliver, Lily…"
          maxLength={30}
          autoFocus
          autoComplete="off"
          className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-4 text-xl font-semibold text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors"
        />
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next button */}
      <motion.div variants={staggerItem} className="pb-8">
        <button
          onClick={() => onNext(name.trim())}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--gradient-cta-primary)",
            color: "var(--color-text-primary)",
          }}
        >
          Continue →
        </button>
      </motion.div>
    </motion.div>
  );
}
