"use client";

import { motion } from "framer-motion";

interface Props {
  onAddWeight: () => void;
  disabled?: boolean;
}

export function DayFab({ onAddWeight, disabled }: Props) {
  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: "max(1rem, var(--spacing-safe-bottom))" }}
    >
      <motion.button
        type="button"
        disabled={disabled}
        whileTap={{ scale: 0.92 }}
        onClick={onAddWeight}
        aria-label="Log weight"
        className="h-14 w-14 rounded-[var(--radius-full)] text-[var(--color-text-inverse)] shadow-[var(--shadow-glow-purple)] disabled:opacity-45 flex items-center justify-center"
        style={{ background: "var(--gradient-cta-primary)" }}
      >
        <span className="text-[1.875rem] font-bold leading-none -translate-y-0.5 select-none">
          +
        </span>
      </motion.button>
    </div>
  );
}
