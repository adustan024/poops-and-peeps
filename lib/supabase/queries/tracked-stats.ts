/**
 * lib/supabase/queries/tracked-stats.ts
 */

import { getSupabaseClient } from "../client";
import type { TrackedStat, StatType } from "@/types/stats";
import { ALL_STAT_TYPES } from "@/types/stats";

export async function getTrackedStats(babyId: string): Promise<TrackedStat[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tracked_stats")
    .select("*")
    .eq("baby_id", babyId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrackedStat[];
}

/** Create default tracked stats rows for a new baby (all enabled) */
export async function createDefaultTrackedStats(
  userId: string,
  babyId: string,
  enabledTypes: StatType[] = ALL_STAT_TYPES
): Promise<void> {
  const supabase = getSupabaseClient();

  const rows = ALL_STAT_TYPES.map((statType, index) => ({
    user_id: userId,
    baby_id: babyId,
    stat_type: statType,
    enabled: enabledTypes.includes(statType),
    sort_order: index,
  }));

  const { error } = await supabase.from("tracked_stats").insert(rows);
  if (error) throw error;
}

export async function updateTrackedStat(
  id: string,
  updates: Partial<Pick<TrackedStat, "enabled" | "sort_order">>
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("tracked_stats")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}
