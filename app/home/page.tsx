"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { staggerContainer } from "@/styles/animations";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useMonthSummary } from "@/lib/hooks/useMonthSummary";
import { useUIStore } from "@/lib/store/uiStore";
import { BabyHeader } from "@/components/home/BabyHeader";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { StatSummaryRow } from "@/components/home/StatSummaryRow";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { profile, baby, trackedStats, isLoading: profileLoading } = useProfile();
  const { calendarMonth } = useUIStore();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: monthSummary } = useMonthSummary(
    baby?.id,
    calendarMonth.year,
    calendarMonth.month
  );

  // Always fetch the current month so stat cards show today's values
  // regardless of which calendar month the user is browsing
  const todayDate = new Date();
  const { data: currentMonthSummary } = useMonthSummary(
    baby?.id,
    todayDate.getFullYear(),
    todayDate.getMonth() + 1
  );

  const todaySummary = currentMonthSummary?.days.find((d) => d.date === today);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user || !profile || !baby) {
        router.replace("/");
      }
    }
  }, [authLoading, profileLoading, user, profile, baby, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-dvh bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-bounce">💩</div>
          <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile || !baby) return null;

  return (
    <div className="min-h-dvh overflow-y-auto">
      <motion.div
        variants={staggerContainer}
        animate="animate"
        className="flex flex-col gap-5 pb-8"
      >
        <BabyHeader
          babyName={baby.name}
          birthDate={baby.birth_date}
          avatarEmojiTone={baby.avatar_emoji_tone}
          avatarRingStyle={baby.avatar_ring_style}
        />

        <CalendarMonthView babyId={baby.id} birthDate={baby.birth_date} />

        <div className="px-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/day/${today}`)}
            className="w-full py-4 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2"
            style={{ background: "var(--gradient-cta-primary)" }}
          >
            <span className="font-sans not-italic">✏️</span>
            Log Today
          </motion.button>
        </div>

        <StatSummaryRow
          babyId={baby.id}
          babyName={baby.name}
          userId={user?.id ?? null}
          recordDate={today}
          trackedStats={trackedStats}
          todaySummary={todaySummary}
        />
      </motion.div>
    </div>
  );
}
