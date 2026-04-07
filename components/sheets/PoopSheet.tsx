"use client";

import { useCallback } from "react";
import { BottomSheet } from "./BottomSheet";
import type { PoopColor } from "@/types/stats";
import { poopSheetChoiceSelected } from "@/styles/tokens";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialColor?: PoopColor;
  isEditing?: boolean;
  onSave: (color: PoopColor) => void;
  onDelete?: () => void;
}

const COLORS: { value: PoopColor; label: string; emoji: string }[] = [
  { value: "yellow", label: "Yellow", emoji: "🟡" },
  { value: "green", label: "Green", emoji: "🟢" },
  { value: "brown", label: "Brown", emoji: "🟤" },
  { value: "black", label: "Black", emoji: "⚫" },
];

const SURFACE_IDLE = "var(--color-surface-700)";
const BORDER_IDLE = "var(--color-surface-600)";
const TEXT_IDLE = "var(--color-text-secondary)";

export function PoopSheet({
  isOpen,
  onClose,
  initialColor,
  isEditing = false,
  onSave,
  onDelete,
}: Props) {
  // When editing, initialColor is the existing logged color (tap same = delete).
  // When creating, initialColor is the last-used color (tap = save, no delete).
  const loggedColor = initialColor;

  const handlePick = useCallback(
    (c: PoopColor) => {
      if (isEditing && loggedColor !== undefined && c === loggedColor) {
        onDelete?.();
        onClose();
        return;
      }
      onSave(c);
      onClose();
    },
    [isEditing, loggedColor, onDelete, onClose, onSave]
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Poop 💩" : "Poop Color 💩"}
    >
      <div className="px-5 pt-4 pb-0">
        <p className="sheet-lede">
          {isEditing
            ? "Tap a color to change. Tap the same color again to remove this log."
            : "Tap a color to log."}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((c) => {
            const highlighted = loggedColor === c.value;
            const sel = poopSheetChoiceSelected[c.value];
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => handlePick(c.value)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.98]"
                style={
                  highlighted
                    ? {
                        borderColor: sel.border,
                        background: sel.fill,
                      }
                    : {
                        borderColor: BORDER_IDLE,
                        background: SURFACE_IDLE,
                      }
                }
              >
                <span className="text-2xl">{c.emoji}</span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: highlighted ? sel.label : TEXT_IDLE,
                  }}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
