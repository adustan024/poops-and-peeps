/**
 * lib/supabase/queries/daily-records.ts
 */

import { getSupabaseClient } from "../client";
import type { DailyRecord } from "@/types/stats";

export async function getDailyRecord(
  babyId: string,
  date: string
): Promise<DailyRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("baby_id", babyId)
    .eq("record_date", date)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as DailyRecord | null;
}

export async function upsertDailyRecord(params: {
  userId: string;
  babyId: string;
  date: string;
  weightGrams?: number;
  photoUrl?: string;
  notes?: string;
}): Promise<DailyRecord> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("daily_records")
    .upsert({
      user_id: params.userId,
      baby_id: params.babyId,
      record_date: params.date,
      ...(params.weightGrams !== undefined && { weight_grams: params.weightGrams }),
      ...(params.photoUrl !== undefined && { photo_url: params.photoUrl }),
      ...(params.notes !== undefined && { notes: params.notes }),
    })
    .select()
    .single();

  if (error) throw error;
  return data as DailyRecord;
}

/** Preserves fields not passed in `params` by re-reading the row first. */
export async function upsertDailyRecordMerge(params: {
  userId: string;
  babyId: string;
  date: string;
  weightGrams?: number;
  photoUrl?: string;
  notes?: string;
}): Promise<DailyRecord> {
  const existing = await getDailyRecord(params.babyId, params.date);
  const weightGrams =
    params.weightGrams !== undefined
      ? params.weightGrams
      : existing?.weight_grams;
  const photoUrl =
    params.photoUrl !== undefined ? params.photoUrl : existing?.photo_url;
  const notes =
    params.notes !== undefined ? params.notes : existing?.notes;

  return upsertDailyRecord({
    userId: params.userId,
    babyId: params.babyId,
    date: params.date,
    ...(weightGrams !== undefined && { weightGrams }),
    ...(photoUrl !== undefined && { photoUrl }),
    ...(notes !== undefined && { notes }),
  });
}

/** Clears weight_grams on a daily record (nulls the field). */
export async function clearDailyRecordWeight(
  babyId: string,
  date: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("daily_records")
    .update({ weight_grams: null })
    .eq("baby_id", babyId)
    .eq("record_date", date);
  if (error) throw error;
}

/** Upload a photo to Supabase Storage and return its public URL */
export async function uploadBabyPhoto(
  userId: string,
  babyId: string,
  date: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient();

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${babyId}/${date}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("baby-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("baby-photos").getPublicUrl(path);
  return data.publicUrl;
}

/** Returns the most recent daily_record row that has a weight logged. */
export async function getLatestWeight(
  babyId: string
): Promise<{ weight_grams: number; record_date: string } | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_records")
    .select("weight_grams, record_date")
    .eq("baby_id", babyId)
    .not("weight_grams", "is", null)
    .order("record_date", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as { weight_grams: number; record_date: string } | null;
}

export async function getDailyRecordsForRange(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<DailyRecord[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("baby_id", babyId)
    .gte("record_date", startDate)
    .lte("record_date", endDate)
    .order("record_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DailyRecord[];
}
