/**
 * lib/supabase/queries/profiles.ts
 */

import { getSupabaseClient } from "../client";
import type { Profile, Baby } from "@/types/profile";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Profile | null;
}

export async function upsertProfile(
  profile: Omit<Profile, "created_at" | "updated_at">
): Promise<Profile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getBabyForUser(userId: string): Promise<Baby | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("babies")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Baby | null;
}

export async function createBaby(
  baby: Omit<Baby, "id" | "created_at">
): Promise<Baby> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("babies")
    .insert(baby)
    .select()
    .single();

  if (error) throw error;
  return data as Baby;
}

export async function updateBaby(
  babyId: string,
  patch: Partial<
    Pick<
      Baby,
      "name" | "birth_date" | "avatar_emoji_tone" | "avatar_ring_style"
    >
  >
): Promise<Baby> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("babies")
    .update(patch)
    .eq("id", babyId)
    .select()
    .single();

  if (error) throw error;
  return data as Baby;
}
