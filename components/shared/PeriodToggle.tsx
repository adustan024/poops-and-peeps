"use client";

interface Props {
  period: "week" | "month";
  onChange: (p: "week" | "month") => void;
  activeColor: string;
}

export function PeriodToggle({ period, onChange, activeColor }: Props) {
  return (
    <div className="flex gap-1">
      {(["week", "month"] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(p); }}
          className="font-semibold px-6 py-0 rounded-md transition-colors leading-[18px]"
          style={{ fontSize: "var(--text-xs)",
            background: period === p ? activeColor : "#252533",
            color:      period === p ? "#fff" : "#8888AA",
          }}
        >
          {p === "week" ? "7d" : "30d"}
        </button>
      ))}
    </div>
  );
}
