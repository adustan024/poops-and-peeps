"use client";

import { AnimatePresence, motion } from "framer-motion";
import { fadeIn, confirmModal } from "@/styles/animations";
import { statEmoji, statLabel } from "@/styles/tokens";
import type { StatType } from "@/types/stats";
import { slotToTimeString } from "@/types/stats";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  statType: StatType;
  slot: number;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  statType,
  slot,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              variants={confirmModal}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-sm bg-[#1C1C26] rounded-2xl p-6 border border-[#252533]"
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">{statEmoji[statType]}</div>
                <h3 className="text-lg font-semibold text-[#F0F0FF] mb-1">
                  Delete {statLabel[statType]}?
                </h3>
                <p className="text-sm text-[#9999BB]">
                  {slotToTimeString(slot)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-medium text-sm text-[#9999BB] bg-[#252533]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className="flex-1 py-3 rounded-xl font-medium text-sm text-white bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
