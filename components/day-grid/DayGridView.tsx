"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays as dateFnsAddDays } from "date-fns";
import { useDayEntries, findEntry, findSleepEntryForSlot } from "@/lib/hooks/useDayEntries";
import { useShallow } from "zustand/react/shallow";
import { useUIStore } from "@/lib/store/uiStore";
import { useProfileStore } from "@/lib/store/profileStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCurrentDaySlot } from "@/lib/hooks/useCurrentDaySlot";
import { useDailyRecord } from "@/lib/hooks/useDailyRecord";
import { upsertDailyRecordMerge, clearDailyRecordWeight } from "@/lib/supabase/queries/daily-records";
import { insertEntry as rawInsertEntry, deleteEntry as rawDeleteEntry, getEntriesForDate } from "@/lib/supabase/queries/entries";
import { DayGridHeader } from "./DayGridHeader";
import { DayGridRow, ROW_HEIGHT } from "./DayGridRow";
import { DayFab } from "./DayFab";
import { WeightSheet } from "@/components/sheets/WeightSheet";
import { PoopSheet } from "@/components/sheets/PoopSheet";
import { FeedingSheet } from "@/components/sheets/FeedingSheet";
import { SleepSheet } from "@/components/sheets/SleepSheet";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import type { TrackingEntry, StatType } from "@/types/stats";
import type { PoopColor } from "@/types/stats";
import { dateToSlot, slotToTimeString } from "@/types/stats";
import { useAppNow } from "@/lib/appTimeContext";

const TOTAL_SLOTS = 96;

interface Props {
  date: string; // "YYYY-MM-DD"
}

type SheetState =
  | { type: "poop"; slot: number; entry: TrackingEntry | null }
  | { type: "feeding"; slot: number; entry: TrackingEntry | null }
  | {
      type: "sleep";
      slot: number;
      entry: TrackingEntry | null;
      // When this entry is one half of a cross-day split, linkedEntry is the other half.
      // "prev" = linkedEntry is the previous day's entry (has the real start time)
      // "next" = linkedEntry is the next day's entry (has the real end time)
      linkedEntry?: TrackingEntry;
      linkedSide?: "prev" | "next";
    }
  | null;

type DeleteState = { entryId: string; statType: StatType; slot: number } | null;

export function DayGridView({ date }: Props) {
  const appNow = useAppNow();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentSlot = useCurrentDaySlot(date);
  const baby = useProfileStore((s) => s.baby);
  const trackedStats = useProfileStore(
    useShallow((s) =>
      s.trackedStats.filter((ts) => ts.enabled).sort((a, b) => a.sort_order - b.sort_order)
    )
  );

  const { entries, insertEntry, updateEntry, deleteEntry } = useDayEntries(
    baby?.id,
    date
  );
  const { data: dailyRecord } = useDailyRecord(baby?.id ?? null, date);

  // Adjacent day entries — used to detect and reconstruct cross-day sleep sessions
  const prevDate = format(dateFnsAddDays(new Date(date + "T12:00:00"), -1), "yyyy-MM-dd");
  const nextDate = format(dateFnsAddDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd");
  const { data: prevEntries = [] } = useQuery({
    queryKey: ["dayEntries", baby?.id, prevDate],
    queryFn: () => getEntriesForDate(baby!.id, prevDate),
    enabled: !!baby?.id,
    staleTime: 30 * 1000,
  });
  const { data: nextEntries = [] } = useQuery({
    queryKey: ["dayEntries", baby?.id, nextDate],
    queryFn: () => getEntriesForDate(baby!.id, nextDate),
    enabled: !!baby?.id,
    staleTime: 30 * 1000,
  });

  const sleepStart = useUIStore((s) => s.sleepStart);
  const setSleepStart = useUIStore((s) => s.setSleepStart);

  const pendingSleepStartSlot = useMemo(
    () => (sleepStart?.statType === "sleep" ? sleepStart.slot : null),
    [sleepStart]
  );

  const [lastPoopColor, setLastPoopColor] = useState<PoopColor | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return (localStorage.getItem("lastPoopColor") as PoopColor) ?? undefined;
  });

  const [activeSheet, setActiveSheet] = useState<SheetState>(null);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);

  const mergeDailyMutation = useMutation({
    mutationFn: upsertDailyRecordMerge,
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["dailyRecord", v.babyId, v.date] });
      queryClient.invalidateQueries({ queryKey: ["weightChart", v.babyId], exact: false });
    },
  });

  const deleteWeightMutation = useMutation({
    mutationFn: () => clearDailyRecordWeight(baby!.id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyRecord", baby?.id, date] });
      queryClient.invalidateQueries({ queryKey: ["weightChart", baby?.id], exact: false });
    },
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: TOTAL_SLOTS,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  useEffect(() => {
    const today = format(appNow, "yyyy-MM-dd");
    let targetSlot: number;
    if (date === today) {
      targetSlot = Math.max(dateToSlot(appNow) - 2, 0);
    } else {
      targetSlot = 32; // 8:00 AM
    }
    virtualizer.scrollToIndex(targetSlot, { align: "start" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, appNow]);

  const handleCellTap = useCallback(
    (slot: number, statType: StatType, existing: TrackingEntry | null) => {
      // ─── Sleep logic ────────────────────────────────────────────────────
      if (statType === "sleep") {
        const existingSleep = findSleepEntryForSlot(entries, slot);
        if (existingSleep) {
          // Detect if this entry is one half of a cross-day split
          let linkedEntry: TrackingEntry | undefined;
          let linkedSide: "prev" | "next" | undefined;
          const endSlot = (existingSleep.value as { end_slot: number }).end_slot;

          if (existingSleep.time_slot === 0) {
            // This entry starts at midnight — look for a prev-day entry ending at 11:45 PM (95)
            const prevLink = prevEntries.find(
              (e) => e.stat_type === "sleep" && (e.value as { end_slot: number }).end_slot === 95
            );
            if (prevLink) { linkedEntry = prevLink; linkedSide = "prev"; }
          } else if (endSlot === 95) {
            // This entry ends at 11:45 PM — look for a next-day entry starting at midnight (0)
            const nextLink = nextEntries.find(
              (e) => e.stat_type === "sleep" && e.time_slot === 0
            );
            if (nextLink) { linkedEntry = nextLink; linkedSide = "next"; }
          }

          setActiveSheet({ type: "sleep", slot: existingSleep.time_slot, entry: existingSleep, linkedEntry, linkedSide });
          return;
        }
        if (!sleepStart) {
          // First tap — set start
          setSleepStart({ slot, statType: "sleep", date });
          return;
        }
        // Second tap — complete sleep entry
        const startDate = sleepStart.date;
        const startSlot = sleepStart.slot;
        setSleepStart(null);
        if (slot === startSlot && startDate === date) return; // tapped same cell, cancel

        if (startDate !== date) {
          // Cross-day: sleep started on a previous date
          // Entry 1 on start date: startSlot → end of day (95)
          // Entry 2 on current date: midnight (0) → tapped slot
          if (!baby?.id) return;
          rawInsertEntry({
            babyId: baby.id,
            date: startDate,
            slot: startSlot,
            statType: "sleep",
            value: { end_slot: 95 },
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["dayEntries", baby.id, startDate] });
          });
          rawInsertEntry({
            babyId: baby.id,
            date,
            slot: 0,
            statType: "sleep",
            value: { end_slot: slot },
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["dayEntries", baby.id, date] });
          });
        } else {
          // Same-day: always use the earlier slot as start
          const [s, e] = slot > startSlot ? [startSlot, slot] : [slot, startSlot];
          insertEntry({
            slot: s,
            statType: "sleep",
            value: { end_slot: e },
          });
        }
        return;
      }

      // ─── Poop: instant log if last color known, sheet only for edits or first-ever log ──
      if (statType === "poop_diaper") {
        if (existing) {
          setActiveSheet({ type: "poop", slot, entry: existing });
        } else if (lastPoopColor) {
          insertEntry({ slot, statType: "poop_diaper", value: { color: lastPoopColor } });
        } else {
          setActiveSheet({ type: "poop", slot, entry: null });
        }
        return;
      }
      if (statType === "feeding") {
        setActiveSheet({ type: "feeding", slot, entry: existing });
        return;
      }
      // ─── Direct stats (wet) ──────────────────────────────────────────────
      if (existing) {
        // Pre-filled → confirm delete
        setDeleteState({ entryId: existing.id, statType, slot });
        return;
      }
      // Empty → instant log
      insertEntry({ slot, statType, value: {} });
    },
    [entries, prevEntries, nextEntries, sleepStart, setSleepStart, insertEntry, baby, date, queryClient, lastPoopColor]
  );

  const items = virtualizer.getVirtualItems();

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <DayGridHeader trackedStats={trackedStats} />

      {/* Virtual scroll container */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto overscroll-none pb-24"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {items.map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: ROW_HEIGHT,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <DayGridRow
                slot={virtualRow.index}
                trackedStats={trackedStats}
                entries={entries}
                isCurrentTimeSlot={virtualRow.index === currentSlot}
                pendingSleepStartSlot={pendingSleepStartSlot}
                onCellTap={handleCellTap}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sleep start indicator */}
      {user?.id && baby?.id && (
        <>
          <DayFab
            onAddWeight={() => setWeightSheetOpen(true)}
            disabled={mergeDailyMutation.isPending}
          />
          <WeightSheet
            isOpen={weightSheetOpen}
            onClose={() => setWeightSheetOpen(false)}
            initialWeightGrams={dailyRecord?.weight_grams}
            initialDate={date}
            isEditing={!!dailyRecord?.weight_grams}
            onSave={(grams, selectedDate) => {
              if (!user?.id || !baby?.id) return;
              mergeDailyMutation.mutate({
                userId: user.id,
                babyId: baby.id,
                date: selectedDate,
                weightGrams: grams,
              });
            }}
            onDelete={() => deleteWeightMutation.mutate()}
          />
        </>
      )}

      {sleepStart && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,22rem)] rounded-2xl px-4 py-3 flex items-start gap-3 text-[var(--color-text-primary)] border border-[var(--color-surface-600)] shadow-[var(--shadow-card)]"
          style={{
            background: `linear-gradient(
              135deg,
              color-mix(in srgb, var(--color-brand-blue) 22%, var(--color-surface-800)),
              color-mix(in srgb, var(--color-brand-teal) 10%, var(--color-surface-900))
            )`,
          }}
        >
          <span
            aria-hidden
            className="text-[1.75rem] leading-none shrink-0 w-10 min-h-11 inline-flex items-center justify-center"
          >
            😴
          </span>
          <p className="flex-1 text-sm font-medium leading-snug pt-0.5">
            <span className="font-semibold">{baby?.name ?? "Baby"}</span> has been sleeping since{" "}
            {sleepStart && (
              <>
                <span className="font-semibold">{slotToTimeString(sleepStart.slot)}</span>
                {sleepStart.date !== date && (
                  <span className="text-[var(--color-text-secondary)]">
                    {" "}({format(new Date(sleepStart.date + "T12:00:00"), "MMM d")})
                  </span>
                )}
              </>
            )}
            . Tap the wake-up time above to log it.
          </p>
          <button
            type="button"
            className="shrink-0 -mr-1 -mt-0.5 w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-700)] active:scale-95"
            onClick={() => setSleepStart(null)}
            aria-label="Dismiss and cancel sleep"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Sheets ────────────────────────────────────────────────────── */}
      <PoopSheet
        isOpen={activeSheet?.type === "poop"}
        onClose={() => setActiveSheet(null)}
        initialColor={
          activeSheet?.type === "poop" && activeSheet.entry
            ? (activeSheet.entry.value as { color: PoopColor }).color
            : undefined
        }
        isEditing={!!(activeSheet?.type === "poop" && activeSheet.entry)}
        onSave={(color) => {
          if (activeSheet?.type !== "poop") return;
          if (activeSheet.entry) {
            updateEntry({ entryId: activeSheet.entry.id, value: { color } });
          } else {
            insertEntry({ slot: activeSheet.slot, statType: "poop_diaper", value: { color } });
          }
          localStorage.setItem("lastPoopColor", color);
          setLastPoopColor(color);
        }}
        onDelete={
          activeSheet?.type === "poop" && activeSheet.entry
            ? () => deleteEntry(activeSheet.entry!.id)
            : undefined
        }
      />

      <FeedingSheet
        isOpen={activeSheet?.type === "feeding"}
        onClose={() => setActiveSheet(null)}
        initialMethods={
          activeSheet?.type === "feeding" && activeSheet.entry
            ? (activeSheet.entry.value as { methods: [] }).methods
            : []
        }
        initialAmountMl={
          activeSheet?.type === "feeding" && activeSheet.entry
            ? (activeSheet.entry.value as { amount_ml?: number }).amount_ml
            : undefined
        }
        isEditing={!!(activeSheet?.type === "feeding" && activeSheet.entry)}
        onSave={(data) => {
          if (activeSheet?.type !== "feeding") return;
          if (activeSheet.entry) {
            updateEntry({ entryId: activeSheet.entry.id, value: data });
          } else {
            insertEntry({ slot: activeSheet.slot, statType: "feeding", value: data });
          }
        }}
        onDelete={
          activeSheet?.type === "feeding" && activeSheet.entry
            ? () => deleteEntry(activeSheet.entry!.id)
            : undefined
        }
      />

      {(() => {
        const s = activeSheet?.type === "sleep" ? activeSheet : null;
        // Resolve the "effective" start/end across linked entries
        const hasPrevLink = s?.linkedSide === "prev" && !!s.linkedEntry;
        const hasNextLink = s?.linkedSide === "next" && !!s.linkedEntry;
        const effectiveStartSlot = hasPrevLink
          ? s!.linkedEntry!.time_slot
          : (s?.entry?.time_slot ?? 0);
        const effectiveEndSlot = hasNextLink
          ? (s!.linkedEntry!.value as { end_slot: number }).end_slot
          : s?.entry
            ? (s.entry.value as { end_slot: number }).end_slot
            : undefined;
        const effectiveStartDate = hasPrevLink ? prevDate : date;

        return (
          <SleepSheet
            isOpen={activeSheet?.type === "sleep"}
            onClose={() => setActiveSheet(null)}
            startSlot={effectiveStartSlot}
            initialEndSlot={effectiveEndSlot}
            date={effectiveStartDate}
            isEditing={!!s?.entry}
            onSave={(data) => {
              if (activeSheet?.type !== "sleep") return;
              const crossesMidnight = data.end_slot < data.start_slot;
              const startDate = hasPrevLink ? prevDate : date;
              const endDateForSplit = format(dateFnsAddDays(new Date(startDate + "T12:00:00"), 1), "yyyy-MM-dd");

              // Delete the current entry
              if (activeSheet.entry) deleteEntry(activeSheet.entry.id);

              // Delete the linked entry (on the other day) via raw delete
              if (activeSheet.linkedEntry && baby?.id) {
                const linkedDate = activeSheet.linkedSide === "prev" ? prevDate : nextDate;
                rawDeleteEntry(activeSheet.linkedEntry.id).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["dayEntries", baby!.id, linkedDate] });
                });
              }

              if (crossesMidnight && baby?.id) {
                // Re-create as two split entries
                if (startDate === date) {
                  insertEntry({ slot: data.start_slot, statType: "sleep", value: { end_slot: 95 } });
                } else {
                  rawInsertEntry({ babyId: baby.id, date: startDate, slot: data.start_slot, statType: "sleep", value: { end_slot: 95 } })
                    .then(() => queryClient.invalidateQueries({ queryKey: ["dayEntries", baby!.id, startDate] }));
                }
                if (endDateForSplit === date) {
                  insertEntry({ slot: 0, statType: "sleep", value: { end_slot: data.end_slot } });
                } else {
                  rawInsertEntry({ babyId: baby.id, date: endDateForSplit, slot: 0, statType: "sleep", value: { end_slot: data.end_slot } })
                    .then(() => queryClient.invalidateQueries({ queryKey: ["dayEntries", baby!.id, endDateForSplit] }));
                }
              } else {
                // Same-day — write to startDate
                if (startDate === date) {
                  insertEntry({ slot: data.start_slot, statType: "sleep", value: { end_slot: data.end_slot } });
                } else {
                  rawInsertEntry({ babyId: baby!.id, date: startDate, slot: data.start_slot, statType: "sleep", value: { end_slot: data.end_slot } })
                    .then(() => queryClient.invalidateQueries({ queryKey: ["dayEntries", baby!.id, startDate] }));
                }
              }
            }}
            onDelete={
              s?.entry
                ? () => {
                    deleteEntry(s.entry!.id);
                    if (s.linkedEntry && baby?.id) {
                      const linkedDate = s.linkedSide === "prev" ? prevDate : nextDate;
                      rawDeleteEntry(s.linkedEntry.id).then(() => {
                        queryClient.invalidateQueries({ queryKey: ["dayEntries", baby!.id, linkedDate] });
                      });
                    }
                  }
                : undefined
            }
          />
        );
      })()}

      {/* ─── Delete Confirm Modal ──────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={!!deleteState}
        onClose={() => setDeleteState(null)}
        onConfirm={() => {
          if (deleteState) deleteEntry(deleteState.entryId);
          setDeleteState(null);
        }}
        statType={deleteState?.statType ?? "wet_diaper"}
        slot={deleteState?.slot ?? 0}
      />
    </div>
  );
}
