"use client";

import { AnimatePresence, motion } from "framer-motion";
import { bottomSheet } from "@/styles/animations";
import { BABY_AVATAR_EMOJI_BY_TONE } from "@/lib/babyEmoji";
import { BabyAvatarRingSurface } from "@/components/shared/BabyAvatarRingSurface";
import {
  BABY_AVATAR_RING_COUNT,
  getBabyAvatarRingPreset,
  getBabyAvatarRingSurfaceStyle,
} from "@/lib/babyAvatarRingStyles";

interface Props {
  open: boolean;
  selectedTone: number;
  selectedRing: number;
  onSelectTone: (tone: number) => void;
  onSelectRing: (ring: number) => void;
  onClose: () => void;
}

export function BabyEmojiPickerSheet({
  open,
  selectedTone,
  selectedRing,
  onSelectTone,
  onSelectRing,
  onClose,
}: Props) {
  const ringSurface = getBabyAvatarRingSurfaceStyle(selectedRing);
  const { fillHex: ringFillHex } = getBabyAvatarRingPreset(selectedRing);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="baby-picker-backdrop"
            role="presentation"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="baby-picker-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Customize baby avatar"
            className="fixed inset-x-0 bottom-0 z-[51] w-full rounded-t-3xl bg-[#13131A] border border-[#252533] border-b-0 px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,0,0,0.45)]"
            variants={bottomSheet}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              className="w-10 h-1 rounded-full bg-[#4B4B66] mx-auto mb-5"
              aria-hidden
            />
            <div className="grid grid-cols-3 gap-x-6 gap-y-5 mb-8 justify-items-center px-1">
              {BABY_AVATAR_EMOJI_BY_TONE.map((emoji, tone) => {
                const isSelected = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => onSelectTone(tone)}
                    className="rounded-full shrink-0 box-border flex items-center justify-center overflow-hidden w-16 h-16 text-3xl transition-transform active:scale-95"
                    style={{
                      ...ringSurface,
                      ...(isSelected
                        ? {
                            boxShadow: `0 0 0 2px #13131A, 0 0 0 4px ${ringFillHex}`,
                          }
                        : {}),
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between gap-1 mb-6 px-0.5">
              {Array.from({ length: BABY_AVATAR_RING_COUNT }, (_, ring) => (
                <BabyAvatarRingSurface
                  key={ring}
                  ringIndex={ring}
                  innerClassName="w-11 h-11"
                  onClick={() => onSelectRing(ring)}
                  className="transition-transform active:scale-95"
                  aria-label={`Frame style ${ring + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white"
              style={{
                background: "var(--gradient-cta-primary)",
              }}
            >
              Done
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
