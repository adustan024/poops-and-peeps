/**
 * lib/hooks/useDayEntries.ts
 *
 * Fetches and manages tracking entries for a specific date.
 * Includes optimistic updates and Supabase Realtime subscription.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getEntriesForDate,
  insertEntry,
  updateEntry,
  deleteEntry,
} from "@/lib/supabase/queries/entries";
import type { TrackingEntry, EntryValue, StatType } from "@/types/stats";

export function useDayEntries(babyId: string | undefined, date: string) {
  const queryClient = useQueryClient();
  const queryKey = ["dayEntries", babyId, date];

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey,
    queryFn: () => getEntriesForDate(babyId!, date),
    enabled: !!babyId,
    staleTime: 30 * 1000,
  });

  // ─── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!babyId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`day-entries-${babyId}-${date}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_entries",
          filter: `baby_id=eq.${babyId}`,
        },
        (payload) => {
          // Only invalidate if the changed row matches the current date
          const row = (payload.new ?? payload.old) as Partial<TrackingEntry>;
          if (row.entry_date === date) {
            queryClient.invalidateQueries({ queryKey });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [babyId, date, queryClient, queryKey]);

  // Invalidates the day's entries AND any chart/range queries for this baby
  const invalidateBaby = () => {
    queryClient.invalidateQueries({ queryKey });
    if (babyId) {
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[1] === babyId && q.queryKey[0] !== "dayEntries",
      });
    }
  };

  // ─── Insert ───────────────────────────────────────────────────────────────
  const insertMutation = useMutation({
    mutationFn: (params: {
      slot: number;
      statType: StatType;
      value: EntryValue;
    }) =>
      insertEntry({
        babyId: babyId!,
        date,
        slot: params.slot,
        statType: params.statType,
        value: params.value,
      }),
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TrackingEntry[]>(queryKey);

      // Optimistic entry
      const optimistic: TrackingEntry = {
        id: `optimistic-${Date.now()}`,
        user_id: "optimistic",
        baby_id: babyId!,
        entry_date: date,
        time_slot: params.slot,
        stat_type: params.statType,
        value: params.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<TrackingEntry[]>(queryKey, (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      invalidateBaby();
    },
  });

  // ─── Update ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (params: { entryId: string; value: EntryValue }) =>
      updateEntry(params.entryId, params.value),
    onSettled: () => {
      invalidateBaby();
    },
  });

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => deleteEntry(entryId),
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TrackingEntry[]>(queryKey);
      queryClient.setQueryData<TrackingEntry[]>(queryKey, (old) =>
        (old ?? []).filter((e) => e.id !== entryId)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      invalidateBaby();
    },
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    insertEntry: insertMutation.mutate,
    updateEntry: updateMutation.mutate,
    deleteEntry: deleteMutation.mutate,
  };
}

/** Helper to find an entry at a specific slot + statType */
export function findEntry(
  entries: TrackingEntry[],
  slot: number,
  statType: StatType
): TrackingEntry | undefined {
  return entries.find(
    (e) => e.time_slot === slot && e.stat_type === statType
  );
}

/** For sleep: find all entries that span a given slot */
export function findSleepEntryForSlot(
  entries: TrackingEntry[],
  slot: number
): TrackingEntry | undefined {
  return entries.find((e) => {
    if (e.stat_type !== "sleep") return false;
    const endSlot = (e.value as { end_slot: number }).end_slot;
    return slot >= e.time_slot && slot <= endSlot;
  });
}
