"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import { DayGridView } from "@/components/day-grid/DayGridView";
import { IconChevronLeft } from "@/components/shared/IconChevronLeft";
import { useProfile } from "@/lib/hooks/useProfile";

interface Props {
  params: Promise<{ date: string }>;
}

function toDayPath(isoDay: string) {
  return `/day/${isoDay}`;
}

export default function DayPage({ params }: Props) {
  const { date } = use(params);
  const router = useRouter();
  const { isLoading } = useProfile();

  let displayDate = date;
  let prevDay: string;
  let nextDay: string;
  try {
    const d = parseISO(date);
    displayDate = format(d, "EEEE, MMM d");
    prevDay = format(addDays(d, -1), "yyyy-MM-dd");
    nextDay = format(addDays(d, 1), "yyyy-MM-dd");
  } catch {
    prevDay = date;
    nextDay = date;
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[var(--color-surface-900)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand-purple)]/30 border-t-[var(--color-brand-purple)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-surface-900)]">
      <header className="shrink-0 border-b border-[var(--color-surface-700)] bg-[var(--color-surface-900)]">
        <div className="flex items-center pt-page-header pb-3 pl-4 pr-4 min-h-[3.25rem]">
          <div className="w-10 shrink-0" aria-hidden />
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-1">
            <button
              type="button"
              onClick={() => router.push(toDayPath(prevDay))}
              className="shrink-0 flex items-center justify-center min-w-11 min-h-11 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:opacity-70 transition-colors"
              aria-label="Previous day"
            >
              <IconChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-[var(--color-text-primary)] text-center min-w-0 leading-tight px-1">
              {displayDate}
            </h1>
            <button
              type="button"
              onClick={() => router.push(toDayPath(nextDay))}
              className="shrink-0 flex items-center justify-center min-w-11 min-h-11 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:opacity-70 transition-colors"
              aria-label="Next day"
            >
              <IconChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <div className="w-10 shrink-0 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-700)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <DayGridView date={date} />
      </div>
    </div>
  );
}
