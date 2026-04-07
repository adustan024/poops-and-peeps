"use client";

import { sheetButtonRadialFill, sheetButtonBorder } from "@/lib/statCardSurface";

const DELETE_COLOR = "#EF4444";
const DELETE_TEXT  = "#FCA5A5";

interface Props {
  label?: string;
  onClick: () => void;
}

export function SheetDeleteButton({ label = "Delete Entry", onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 rounded-2xl font-medium text-sm border"
      style={{
        background: sheetButtonRadialFill(DELETE_COLOR),
        borderColor: sheetButtonBorder(DELETE_COLOR),
        color: DELETE_TEXT,
      }}
    >
      {label}
    </button>
  );
}
