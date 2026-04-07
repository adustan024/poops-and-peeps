"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BottomSheet } from "./BottomSheet";
import { slotToTimeString } from "@/types/stats";
import { SheetSaveButton } from "@/components/shared/SheetSaveButton";
import { SheetDeleteButton } from "@/components/shared/SheetDeleteButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  startSlot: number;
  initialEndSlot?: number;
  date?: string; // "YYYY-MM-DD" — the date the start slot is on
  isEditing?: boolean;
  onSave: (data: { start_slot: number; end_slot: number }) => void;
  onDelete?: () => void;
}

export function SleepSheet({
  isOpen,
  onClose,
  startSlot,
  initialEndSlot,
  date,
  isEditing = false,
  onSave,
  onDelete,
}: Props) {
  const [start, setStart] = useState(startSlot);
  const [end, setEnd] = useState(
    initialEndSlot !== undefined
      ? initialEndSlot
      : Math.min(startSlot + 4, 95)
  );

  useEffect(() => {
    if (!isOpen) return;
    setStart(startSlot);
    setEnd(
      initialEndSlot !== undefined
        ? initialEndSlot
        : Math.min(startSlot + 4, 95)
    );
  }, [isOpen, startSlot, initialEndSlot]);

  const slotOptions = Array.from({ length: 96 }, (_, i) => ({
    value: i,
    label: slotToTimeString(i),
  }));

  // Allow end < start to represent cross-midnight
  const crossesMidnight = end < start;
  const isValid = end !== start;
  const durationSlots = crossesMidnight ? (96 - start) + end : end - start;
  const durationMins = durationSlots * 15;
  const durationHours = Math.floor(durationMins / 60);
  const durationRemMins = durationMins % 60;

  const durationLabel =
    durationHours > 0
      ? `${durationHours}h ${durationRemMins > 0 ? `${durationRemMins}m` : ""}`
      : `${durationMins}m`;

  const dateLabel = date
    ? format(new Date(date + "T12:00:00"), "MMM d")
    : null;

  const nextDayLabel =
    date && crossesMidnight
      ? format(new Date(new Date(date + "T12:00:00").getTime() + 86400000), "MMM d")
      : null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Sleep 😴" : "Log Sleep 😴"}
    >
      <div className="px-5 pt-4 pb-0 space-y-5">
        {/* Time selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#9999BB] font-medium uppercase tracking-wider">Start</p>
              {crossesMidnight && dateLabel ? (
                <span className="text-[10px] text-indigo-400 normal-case tracking-normal font-medium">{dateLabel} →</span>
              ) : dateLabel ? (
                <span className="text-[10px] text-[#9999BB] normal-case tracking-normal">{dateLabel}</span>
              ) : null}
            </div>
            <select
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-3 py-3 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#6366F1]"
              style={{ colorScheme: "dark" }}
            >
              {slotOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#9999BB] font-medium uppercase tracking-wider">End</p>
              {crossesMidnight && nextDayLabel ? (
                <span className="text-[10px] text-indigo-400 normal-case tracking-normal font-medium">{nextDayLabel}</span>
              ) : dateLabel ? (
                <span className="text-[10px] text-[#9999BB] normal-case tracking-normal">{dateLabel}</span>
              ) : null}
            </div>
            <select
              value={end}
              onChange={(e) => setEnd(Number(e.target.value))}
              className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-3 py-3 text-sm text-[#F0F0FF] focus:outline-none focus:border-[#6366F1]"
              style={{ colorScheme: "dark" }}
            >
              {slotOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration display */}
        {isValid && (
          <div
            className="flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ background: "rgba(99, 102, 241, 0.15)" }}
          >
            <span className="text-base font-semibold text-[#6366F1]">
              {durationLabel}
            </span>
            {crossesMidnight && (
              <span className="text-xs text-indigo-400">crosses midnight</span>
            )}
          </div>
        )}

        {!isValid && (
          <p className="text-xs text-amber-400 text-center">
            Start and end time cannot be the same
          </p>
        )}

        <SheetSaveButton
          color="#6366F1"
          textColor="#818CF8"
          label={isEditing ? "Save Changes" : "Log Sleep"}
          disabled={!isValid}
          onClick={() => { onSave({ start_slot: start, end_slot: end }); onClose(); }}
        />

        {isEditing && onDelete && (
          <SheetDeleteButton onClick={() => { onDelete(); onClose(); }} />
        )}
      </div>
    </BottomSheet>
  );
}
