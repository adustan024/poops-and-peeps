"use client";

import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { SheetSaveButton } from "@/components/shared/SheetSaveButton";
import { SheetDeleteButton } from "@/components/shared/SheetDeleteButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDuration?: number;
  isEditing?: boolean;
  onSave: (durationMinutes: number) => void;
  onDelete?: () => void;
}

const DURATION_OPTIONS = [2, 5, 10, 15, 20, 30];

export function TummyTimeSheet({
  isOpen,
  onClose,
  initialDuration = 5,
  isEditing = false,
  onSave,
  onDelete,
}: Props) {
  const [duration, setDuration] = useState(initialDuration);
  const [custom, setCustom] = useState(false);
  const [customValue, setCustomValue] = useState(String(initialDuration));

  const isPreset = DURATION_OPTIONS.includes(duration);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Tummy Time 🐛" : "Log Tummy Time 🐛"}
    >
      <div className="px-5 pt-4 pb-0 space-y-5">
        <p className="sheet-lede">How long?</p>

        <div className="grid grid-cols-3 gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); setCustom(false); }}
              className="py-3 rounded-xl text-sm font-semibold border-2 transition-all"
              style={{
                borderColor: duration === d && !custom ? "#0D9488" : "#252533",
                background: duration === d && !custom ? "rgba(13,148,136,0.15)" : "#1C1C26",
                color: duration === d && !custom ? "#0D9488" : "#9999BB",
              }}
            >
              {d}m
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div>
          <button
            onClick={() => setCustom(true)}
            className="text-sm text-[#9999BB] underline"
          >
            Enter custom time
          </button>
          {custom && (
            <div className="flex items-center gap-3 mt-2 bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-3">
              <input
                type="number"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  setDuration(Number(e.target.value));
                }}
                min="1"
                max="120"
                inputMode="numeric"
                className="flex-1 bg-transparent text-xl font-semibold text-[#F0F0FF] focus:outline-none"
                autoFocus
              />
              <span className="text-[#9999BB]">min</span>
            </div>
          )}
        </div>

        <SheetSaveButton
          color="#0D9488"
          textColor="#2DD4BF"
          label={isEditing ? "Save Changes" : "Log Tummy Time"}
          disabled={duration <= 0}
          onClick={() => { onSave(duration); onClose(); }}
        />

        {isEditing && onDelete && (
          <SheetDeleteButton onClick={() => { onDelete(); onClose(); }} />
        )}
      </div>
    </BottomSheet>
  );
}
