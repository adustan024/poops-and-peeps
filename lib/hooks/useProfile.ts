/**
 * lib/hooks/useProfile.ts
 *
 * Fetches and caches baby profile data.
 */

"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { mergeBabyWithLocalAvatarPrefs } from "@/lib/babyAvatarToneStorage";
import { getProfile, getBabyForUser } from "@/lib/supabase/queries/profiles";
import { getTrackedStats } from "@/lib/supabase/queries/tracked-stats";
import { useProfileStore } from "@/lib/store/profileStore";

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const babyQuery = useQuery({
    queryKey: ["baby", user?.id],
    queryFn: () => getBabyForUser(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const trackedStatsQuery = useQuery({
    queryKey: ["trackedStats", babyQuery.data?.id],
    queryFn: () => getTrackedStats(babyQuery.data!.id),
    enabled: !!babyQuery.data?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Sync to Zustand store for global access
  const { setProfile, setBaby, setTrackedStats, setLoaded } = useProfileStore();

  useEffect(() => {
    if (profileQuery.data !== undefined) setProfile(profileQuery.data);
  }, [profileQuery.data, setProfile]);

  useEffect(() => {
    if (babyQuery.data === undefined) return;
    if (babyQuery.data === null) {
      setBaby(null);
      return;
    }
    setBaby(mergeBabyWithLocalAvatarPrefs(babyQuery.data));
  }, [babyQuery.data, setBaby]);

  useEffect(() => {
    if (trackedStatsQuery.data !== undefined) {
      setTrackedStats(trackedStatsQuery.data);
    }
  }, [trackedStatsQuery.data, setTrackedStats]);

  useEffect(() => {
    const loaded =
      !authLoading &&
      !!user &&
      !profileQuery.isLoading &&
      !babyQuery.isLoading &&
      (!babyQuery.data?.id || !trackedStatsQuery.isLoading);
    setLoaded(loaded);
  }, [
    authLoading,
    user,
    profileQuery.isLoading,
    babyQuery.isLoading,
    babyQuery.data?.id,
    trackedStatsQuery.isLoading,
    setLoaded,
  ]);

  const profileGatesLoading =
    !!user &&
    (profileQuery.isLoading ||
      babyQuery.isLoading ||
      (!!babyQuery.data?.id && trackedStatsQuery.isLoading));

  return {
    profile: profileQuery.data ?? null,
    baby:
      babyQuery.data != null
        ? mergeBabyWithLocalAvatarPrefs(babyQuery.data)
        : null,
    trackedStats: trackedStatsQuery.data ?? [],
    isLoading: authLoading || profileGatesLoading,
  };
}

/** Returns only the enabled tracked stats in sort order (from store) */
export function useEnabledStats() {
  return useProfileStore(
    useShallow((s) =>
      s.trackedStats.filter((ts) => ts.enabled).sort((a, b) => a.sort_order - b.sort_order)
    )
  );
}
