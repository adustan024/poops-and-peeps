"use client";

import { sheetButtonRadialFill, sheetButtonBorder } from "@/lib/statCardSurface";

interface Props {
  color: string;
  textColor: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function SheetSaveButton({ color, textColor, label, disabled = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40 border"
      style={{
        background: sheetButtonRadialFill(color),
        borderColor: sheetButtonBorder(color),
        color: textColor,
      }}
    >
      {label}
    </button>
  );
}
