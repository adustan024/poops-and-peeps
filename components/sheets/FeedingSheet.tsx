"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "./BottomSheet";
import type { FeedingMethod } from "@/types/stats";
import { useProfileStore } from "@/lib/store/profileStore";
import { flOzToMl } from "@/types/profile";
import { SheetSaveButton } from "@/components/shared/SheetSaveButton";
import { SheetDeleteButton } from "@/components/shared/SheetDeleteButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMethods?: FeedingMethod[];
  initialAmountMl?: number;
  isEditing?: boolean;
  onSave: (data: { methods: FeedingMethod[]; amount_ml?: number }) => void;
  onDelete?: () => void;
}

const METHOD_OPTIONS: { value: FeedingMethod; label: string; emoji: string }[] = [
  { value: "breast_left",  label: "Left Breast",  emoji: "🤱" },
  { value: "breast_right", label: "Right Breast", emoji: "🤱" },
  { value: "formula",      label: "Bottle",       emoji: "🍼" },
];

export function FeedingSheet({
  isOpen,
  onClose,
  initialMethods = [],
  initialAmountMl,
  isEditing = false,
  onSave,
  onDelete,
}: Props) {
  const units = useProfileStore((s) => s.profile?.units ?? "imperial");

  const [selectedMethods, setSelectedMethods] = useState<Set<FeedingMethod>>(new Set());

  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedMethods(new Set(initialMethods));
    setAmount(
      isEditing && initialAmountMl
        ? units === "imperial"
          ? (initialAmountMl / 29.5735).toFixed(1)
          : initialAmountMl.toFixed(0)
        : ""
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function toggleMethod(method: FeedingMethod) {
    setSelectedMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) {
        next.delete(method);
      } else {
        next.add(method);
      }
      return next;
    });
  }

  function handleSave() {
    const methods = Array.from(selectedMethods);
    let amount_ml: number | undefined;

    if (amount) {
      const num = parseFloat(amount);
      if (!isNaN(num) && num > 0) {
        amount_ml = units === "imperial" ? flOzToMl(num) : num;
      }
    }

    onSave({ methods, amount_ml });
    onClose();
  }

  const isValid = selectedMethods.size > 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Feeding 🍼" : "Log Feeding 🍼"}
    >
      <div className="px-5 pt-4 pb-0 space-y-5">
        {/* Method multi-select */}
        <div className="space-y-2">
          <p className="sheet-lede font-medium">
            Method (select all that apply)
          </p>
          <div className="space-y-2">
            {METHOD_OPTIONS.map((opt) => {
              const isOn = selectedMethods.has(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleMethod(opt.value)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isOn ? "#22C55E" : "#252533",
                    background: isOn ? "rgba(34,197,94,0.12)" : "#1C1C26",
                  }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span
                    className="text-base font-medium"
                    style={{ color: isOn ? "#22C55E" : "#9999BB" }}
                  >
                    {opt.label}
                  </span>
                  {isOn && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount (optional) */}
        <div className="space-y-2">
          <p className="sheet-lede font-medium">
            Amount (optional)
          </p>
          <div className="flex items-center gap-3 bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              inputMode="decimal"
              className="flex-1 bg-transparent text-xl font-semibold text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none"
            />
            <span className="text-[#9999BB] font-medium">
              {units === "imperial" ? "fl oz" : "mL"}
            </span>
          </div>
        </div>

        <SheetSaveButton
          color="#22C55E"
          textColor="#4ADE80"
          label={isEditing ? "Save Changes" : "Log Feeding"}
          disabled={!isValid}
          onClick={handleSave}
        />

        {isEditing && onDelete && (
          <SheetDeleteButton onClick={() => { onDelete(); onClose(); }} />
        )}
      </div>
    </BottomSheet>
  );
}
