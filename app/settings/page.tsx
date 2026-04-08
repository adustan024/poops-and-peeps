"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/styles/animations";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import { updateTrackedStat } from "@/lib/supabase/queries/tracked-stats";
import { upsertProfile, updateBaby } from "@/lib/supabase/queries/profiles";
import { useProfileStore } from "@/lib/store/profileStore";
import { useAuthStore } from "@/lib/store/authStore";
import { BabyEmojiPickerSheet } from "@/components/settings/BabyEmojiPickerSheet";
import {
  clearBabyAvatarRingLocal,
  clearBabyAvatarToneLocal,
  writeBabyAvatarRingLocal,
  writeBabyAvatarToneLocal,
} from "@/lib/babyAvatarToneStorage";
import { BabyAvatarRingSurface } from "@/components/shared/BabyAvatarRingSurface";
import { getBabyAvatarEmoji } from "@/lib/babyEmoji";
import { statEmoji, statLabel, statColor } from "@/styles/tokens";
import type { UnitPreference } from "@/types/profile";
import { isSupportedStatType } from "@/types/stats";
import { formatBirthDateUs } from "@/types/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useClearDemoAppTime } from "@/lib/appTimeContext";

export default function SettingsPage() {
  const clearDemoAppTime = useClearDemoAppTime();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, baby, trackedStats, isLoading } = useProfile();
  const profileStore = useProfileStore();
  const { clear: clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [babyEmojiError, setBabyEmojiError] = useState<string | null>(null);

  async function handleToggleStat(statId: string, enabled: boolean) {
    await updateTrackedStat(statId, { enabled });
    queryClient.invalidateQueries({ queryKey: ["trackedStats", baby?.id] });
  }

  async function handleToggleUnits(units: UnitPreference) {
    if (!profile) return;
    setIsSaving(true);
    try {
      await upsertProfile({ ...profile, units });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBabyEmojiTone(tone: number) {
    if (!baby) return;
    setBabyEmojiError(null);
    setIsSaving(true);
    try {
      await updateBaby(baby.id, { avatar_emoji_tone: tone });
      clearBabyAvatarToneLocal(baby.id);
      await queryClient.invalidateQueries({ queryKey: ["baby", user?.id] });
      profileStore.setBaby({
        ...baby,
        avatar_emoji_tone: tone,
      });
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Could not save to server.";
      setBabyEmojiError(msg);
      writeBabyAvatarToneLocal(baby.id, tone);
      profileStore.setBaby({ ...baby, avatar_emoji_tone: tone });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBabyRingStyle(ring: number) {
    if (!baby) return;
    setBabyEmojiError(null);
    setIsSaving(true);
    try {
      await updateBaby(baby.id, { avatar_ring_style: ring });
      clearBabyAvatarRingLocal(baby.id);
      await queryClient.invalidateQueries({ queryKey: ["baby", user?.id] });
      profileStore.setBaby({
        ...baby,
        avatar_ring_style: ring,
      });
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Could not save to server.";
      setBabyEmojiError(msg);
      writeBabyAvatarRingLocal(baby.id, ring);
      profileStore.setBaby({ ...baby, avatar_ring_style: ring });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await clearDemoAppTime();
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    profileStore.clear();
    queryClient.clear();
    router.replace("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F]">
      {/* Header */}
      <div className="flex items-center pt-page-header pb-4 px-4 border-b border-[var(--color-surface-700)]">
        <h1 className="flex-1 type-sheet-title">Settings</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[var(--color-surface-700)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <motion.div
        variants={staggerContainer}
        animate="animate"
        className="px-4 py-5 space-y-6"
      >
        {/* ─── Baby Info ─────────────────────────────────────────────── */}
        <motion.section variants={staggerItem}>
          <h2 className="text-xs text-[#8888AA] uppercase tracking-wider mb-3">
            Baby
          </h2>
          <div className="bg-[#13131A] rounded-2xl p-4 border border-[#1C1C26]">
            <div className="flex items-center gap-3">
              {baby ? (
                <BabyAvatarRingSurface
                  ringIndex={baby.avatar_ring_style ?? 0}
                  innerClassName="w-14 h-14 text-3xl"
                  disabled={isSaving}
                  onClick={() => setEmojiPickerOpen(true)}
                  className="active:scale-95 transition-transform disabled:opacity-50"
                  aria-label="Change baby emoji"
                >
                  {getBabyAvatarEmoji(baby.avatar_emoji_tone)}
                </BabyAvatarRingSurface>
              ) : (
                <span className="w-14 h-14 rounded-full bg-[#1C1C26] border-2 border-[#252533] flex items-center justify-center text-3xl shrink-0">
                  👶
                </span>
              )}
              <div>
                <p className="text-base font-semibold text-[#F0F0FF]">
                  {baby?.name ?? "—"}
                </p>
                <p className="text-sm text-[#9999BB]">
                  Born{" "}
                  {baby?.birth_date
                    ? formatBirthDateUs(baby.birth_date)
                    : "—"}
                </p>
              </div>
            </div>
            {babyEmojiError && (
              <p className="mt-3 text-xs text-amber-400/90 leading-relaxed">
                {babyEmojiError}
                <span className="block mt-1 text-[#8888AA]">
                  Saved on this device only until required{" "}
                  <code className="text-[10px] bg-[#1C1C26] px-1 rounded">
                    babies
                  </code>{" "}
                  columns exist (
                  <code className="text-[10px] bg-[#1C1C26] px-1 rounded">
                    avatar_emoji_tone
                  </code>
                  ,{" "}
                  <code className="text-[10px] bg-[#1C1C26] px-1 rounded">
                    avatar_ring_style
                  </code>
                  ). Run SQL from{" "}
                  <code className="text-[10px] bg-[#1C1C26] px-1 rounded">
                    supabase/migrations/
                  </code>
                  .
                </span>
              </p>
            )}
          </div>
        </motion.section>

        {/* ─── Units ─────────────────────────────────────────────────── */}
        <motion.section variants={staggerItem}>
          <h2 className="text-xs text-[#8888AA] uppercase tracking-wider mb-3">
            Units
          </h2>
          <div className="bg-[#13131A] rounded-2xl border border-[#1C1C26] overflow-hidden">
            {(["imperial", "metric"] as UnitPreference[]).map((u) => (
              <button
                key={u}
                onClick={() => handleToggleUnits(u)}
                disabled={isSaving}
                className="w-full flex items-center justify-between px-4 py-4 border-b last:border-0 border-[#1C1C26] transition-colors"
                style={{
                  background:
                    profile?.units === u ? "rgba(124,58,237,0.1)" : "transparent",
                }}
              >
                <span className="text-sm font-medium text-[#F0F0FF]">
                  {u === "imperial" ? "Imperial (lbs, oz, fl oz)" : "Metric (kg, mL)"}
                </span>
                {profile?.units === u && (
                  <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ─── Tracked Stats ─────────────────────────────────────────── */}
        <motion.section variants={staggerItem}>
          <h2 className="text-xs text-[#8888AA] uppercase tracking-wider mb-3">
            Track These Stats
          </h2>
          <div className="bg-[#13131A] rounded-2xl border border-[#1C1C26] overflow-hidden">
            {trackedStats.filter((ts) => isSupportedStatType(ts.stat_type)).map((ts, i) => (
              <div
                key={ts.id}
                className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0 border-[#1C1C26]"
              >
                <span className="text-xl">{statEmoji[ts.stat_type]}</span>
                <span className="flex-1 text-sm font-medium text-[#F0F0FF]">
                  {statLabel[ts.stat_type]}
                </span>
                {/* Toggle switch */}
                <button
                  onClick={() => handleToggleStat(ts.id, !ts.enabled)}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{
                    background: ts.enabled
                      ? statColor[ts.stat_type]
                      : "#252533",
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{
                      transform: ts.enabled
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── Account ───────────────────────────────────────────────── */}
        <motion.section variants={staggerItem}>
          <h2 className="text-xs text-[#8888AA] uppercase tracking-wider mb-3">
            Account
          </h2>
          <div className="bg-[#13131A] rounded-2xl border border-[#1C1C26] overflow-hidden">
            <div className="px-4 py-4 border-b border-[#1C1C26]">
              <p className="text-xs text-[#9999BB]">Signed in as</p>
              <p className="text-sm font-medium text-[#F0F0FF] mt-0.5">
                {user?.email ?? "—"}
              </p>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-[#9999BB]">
                <span>🔒</span>
                <p>
                  Your data and baby photos are encrypted and stored securely.
                  Only you and your co-parent can access them.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Sign out ──────────────────────────────────────────────── */}
        <motion.section variants={staggerItem}>
          <button
            onClick={handleSignOut}
            className="w-full py-4 rounded-2xl font-semibold text-sm border border-red-500/30 text-red-400 bg-red-900/10"
          >
            Sign Out
          </button>
        </motion.section>

        {/* App info */}
        <motion.section variants={staggerItem}>
          <p className="text-center text-xs text-[#8888AA]">
            Poops & Peeps · v0.1.0
          </p>
        </motion.section>
      </motion.div>

      {baby && (
        <BabyEmojiPickerSheet
          open={emojiPickerOpen}
          selectedTone={baby.avatar_emoji_tone ?? 0}
          selectedRing={baby.avatar_ring_style ?? 0}
          onSelectTone={handleBabyEmojiTone}
          onSelectRing={handleBabyRingStyle}
          onClose={() => setEmojiPickerOpen(false)}
        />
      )}
    </div>
  );
}
