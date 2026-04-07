/**
 * lib/store/profileStore.ts
 *
 * Baby profile + preferences.
 */

import { create } from "zustand";
import type { Profile, Baby } from "@/types/profile";
import type { TrackedStat } from "@/types/stats";

interface ProfileState {
  profile: Profile | null;
  baby: Baby | null;
  trackedStats: TrackedStat[];
  isLoaded: boolean;

  setProfile: (profile: Profile | null) => void;
  setBaby: (baby: Baby | null) => void;
  setTrackedStats: (stats: TrackedStat[]) => void;
  setLoaded: (loaded: boolean) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  baby: null,
  trackedStats: [],
  isLoaded: false,

  setProfile: (profile) => set({ profile }),
  setBaby: (baby) => set({ baby }),
  setTrackedStats: (trackedStats) => set({ trackedStats }),
  setLoaded: (isLoaded) => set({ isLoaded }),
  clear: () =>
    set({ profile: null, baby: null, trackedStats: [], isLoaded: false }),
}));
