"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BottomSheet } from "./BottomSheet";
import { useProfileStore } from "@/lib/store/profileStore";
import { lbsOzToGrams, kgToGrams, formatWeight } from "@/types/profile";
import { SheetSaveButton } from "@/components/shared/SheetSaveButton";

import { SheetDeleteButton } from "@/components/shared/SheetDeleteButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialWeightGrams?: number;
  initialDate?: string; // "YYYY-MM-DD", defaults to today
  isEditing?: boolean;
  onSave: (grams: number, date: string) => void;
  onDelete?: () => void;
}

const today = () => format(new Date(), "yyyy-MM-dd");

export function WeightSheet({ isOpen, onClose, initialWeightGrams, initialDate, isEditing = false, onSave, onDelete }: Props) {
  const units = useProfileStore((s) => s.profile?.units ?? "imperial");

  const [date, setDate] = useState(initialDate ?? today());
  const [lbs, setLbs] = useState(
    initialWeightGrams ? String(Math.floor((initialWeightGrams / 28.3495) / 16)) : ""
  );
  const [oz, setOz] = useState(
    initialWeightGrams ? ((initialWeightGrams / 28.3495) % 16).toFixed(1) : ""
  );
  const [kg, setKg] = useState(
    initialWeightGrams ? (initialWeightGrams / 1000).toFixed(3) : ""
  );

  useEffect(() => {
    if (!isOpen) return;
    setDate(initialDate ?? today());
    if (initialWeightGrams) {
      setLbs(String(Math.floor((initialWeightGrams / 28.3495) / 16)));
      setOz(((initialWeightGrams / 28.3495) % 16).toFixed(1));
      setKg((initialWeightGrams / 1000).toFixed(3));
    } else {
      setLbs("");
      setOz("");
      setKg("");
    }
  }, [isOpen, initialWeightGrams, initialDate]);

  function handleSave() {
    let grams: number;
    if (units === "imperial") {
      grams = lbsOzToGrams(parseFloat(lbs) || 0, parseFloat(oz) || 0);
    } else {
      grams = kgToGrams(parseFloat(kg) || 0);
    }
    if (grams > 0) {
      onSave(grams, date);
      onClose();
    }
  }

  const isValid =
    units === "imperial"
      ? (parseFloat(lbs) || 0) > 0 || (parseFloat(oz) || 0) > 0
      : (parseFloat(kg) || 0) > 0;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Weight ⚖️" : "Log Weight ⚖️"}>
      <div className="px-5 pt-4 pb-0 space-y-5">

        {/* Date picker */}
        <div className="space-y-2">
          <label className="text-xs text-[#9999BB] uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-3 text-base font-medium text-[#F0F0FF] focus:outline-none focus:border-[#EC4899]"
            style={{ colorScheme: "dark" }}
          />
        </div>

        {/* Weight inputs */}
        {units === "imperial" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-[#9999BB] uppercase tracking-wider">Pounds</label>
              <input
                type="number"
                value={lbs}
                onChange={(e) => setLbs(e.target.value)}
                placeholder="0"
                min="0"
                max="30"
                inputMode="numeric"
                className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-3 text-xl font-semibold text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none focus:border-[#EC4899]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#9999BB] uppercase tracking-wider">Ounces</label>
              <input
                type="number"
                value={oz}
                onChange={(e) => setOz(e.target.value)}
                placeholder="0.0"
                min="0"
                max="15.9"
                step="0.1"
                inputMode="decimal"
                className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-3 text-xl font-semibold text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none focus:border-[#EC4899]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs text-[#9999BB] uppercase tracking-wider">Kilograms</label>
            <div className="flex items-center gap-3 bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-3">
              <input
                type="number"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="0.000"
                min="0"
                step="0.001"
                inputMode="decimal"
                className="flex-1 bg-transparent text-xl font-semibold text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none"
              />
              <span className="text-[#9999BB]">kg</span>
            </div>
          </div>
        )}

        {/* Preview */}
        {isValid && (
          <div
            className="py-3 rounded-xl text-center font-semibold"
            style={{ background: "rgba(236,72,153,0.12)", color: "#EC4899" }}
          >
            ⚖️{" "}
            {units === "imperial"
              ? formatWeight(lbsOzToGrams(parseFloat(lbs) || 0, parseFloat(oz) || 0), "imperial")
              : formatWeight(kgToGrams(parseFloat(kg) || 0), "metric")}
          </div>
        )}

        <SheetSaveButton
          color="#EC4899"
          textColor="#F472B6"
          label={isEditing ? "Save Changes" : "Save Weight"}
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
