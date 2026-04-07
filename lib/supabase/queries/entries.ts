/**
 * lib/supabase/queries/entries.ts
 *
 * All read/write operations for tracking_entries table.
 */

import { getSupabaseClient } from "../client";
import type { TrackingEntry, EntryValue, StatType } from "@/types/stats";

/** Fetch all tracking entries for a baby on a specific date */
export async function getEntriesForDate(
  babyId: string,
  date: string // "YYYY-MM-DD"
): Promise<TrackingEntry[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("tracking_entries")
    .select("*")
    .eq("baby_id", babyId)
    .eq("entry_date", date)
    .order("time_slot", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrackingEntry[];
}

/** Insert a new tracking entry */
export async function insertEntry(params: {
  babyId: string;
  date: string;
  slot: number;
  statType: StatType;
  value: EntryValue;
}): Promise<TrackingEntry> {
  const supabase = getSupabaseClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tracking_entries")
    .insert({
      user_id: user.user.id,
      baby_id: params.babyId,
      entry_date: params.date,
      time_slot: params.slot,
      stat_type: params.statType,
      value: params.value,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrackingEntry;
}

/** Update an existing entry's value */
export async function updateEntry(
  entryId: string,
  value: EntryValue
): Promise<TrackingEntry> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("tracking_entries")
    .update({ value })
    .eq("id", entryId)
    .select()
    .single();

  if (error) throw error;
  return data as TrackingEntry;
}

/** Delete an entry by id */
export async function deleteEntry(entryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("tracking_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}

/** Fetch entries for a date range (for month summary / charts) */
export async function getEntriesForRange(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<TrackingEntry[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("tracking_entries")
    .select("id, entry_date, time_slot, stat_type, value")
    .eq("baby_id", babyId)
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .order("entry_date", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrackingEntry[];
}
