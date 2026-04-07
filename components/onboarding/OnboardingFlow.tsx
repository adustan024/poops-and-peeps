"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { upsertProfile, createBaby } from "@/lib/supabase/queries/profiles";
import { createDefaultTrackedStats } from "@/lib/supabase/queries/tracked-stats";
import { onboardingStepForward, onboardingStepBack } from "@/styles/animations";
import type { StatType } from "@/types/stats";
import type { UnitPreference } from "@/types/profile";

import { StepBabyName } from "./StepBabyName";
import { StepBirthDate } from "./StepBirthDate";
import { StepUnits } from "./StepUnits";
import { StepStatPicker } from "./StepStatPicker";
import { StepAccount } from "./StepAccount";

export interface OnboardingData {
  babyName: string;
  birthDate: string;
  units: UnitPreference;
  enabledStats: StatType[];
  email: string;
  password: string;
}

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<Partial<OnboardingData>>({
    units: "imperial",
    enabledStats: [
      "wet_diaper",
      "poop_diaper",
      "feeding",
      "sleep",
      "weight",
    ],
  });

  function goNext(updates: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...updates }));
    setDirection("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setDirection("back");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish(accountData: {
    email: string;
    password: string;
  }) {
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      // 1. Create Supabase auth account
      const { data: authData, error: signUpError } =
        await supabase.auth.signUp({
          email: accountData.email,
          password: accountData.password,
        });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("No user returned from sign up");

      const userId = authData.user.id;
      const babyName = data.babyName ?? "Baby";
      const birthDate = data.birthDate ?? new Date().toISOString().split("T")[0];

      // 2. Create profile
      await upsertProfile({
        id: userId,
        baby_name: babyName,
        birth_date: birthDate,
        units: data.units ?? "imperial",
      });

      // 3. Create baby record
      const baby = await createBaby({
        owner_id: userId,
        name: babyName,
        birth_date: birthDate,
      });

      // 4. Create tracked stats preferences
      await createDefaultTrackedStats(
        userId,
        baby.id,
        data.enabledStats ?? []
      );

      // 5. Navigate home
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  const variants =
    direction === "forward" ? onboardingStepForward : onboardingStepBack;

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex flex-col">
      {/* Close button → back to landing */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C26] text-[#9999BB] hover:text-[#F0F0FF] transition-colors z-10"
        aria-label="Exit to home"
      >
        ✕
      </button>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-14 pb-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 24 : 8,
              opacity: i <= step ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-2 rounded-full bg-[#7C3AED]"
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex flex-col overflow-y-auto"
          >
            {step === 0 && (
              <StepBabyName
                initialValue={data.babyName ?? ""}
                onNext={(babyName) => goNext({ babyName })}
              />
            )}
            {step === 1 && (
              <StepBirthDate
                initialValue={data.birthDate ?? ""}
                onNext={(birthDate) => goNext({ birthDate })}
                onBack={goBack}
              />
            )}
            {step === 2 && (
              <StepUnits
                initialValue={data.units ?? "imperial"}
                onNext={(units) => goNext({ units })}
                onBack={goBack}
              />
            )}
            {step === 3 && (
              <StepStatPicker
                initialValue={data.enabledStats ?? []}
                onNext={(enabledStats) => goNext({ enabledStats })}
                onBack={goBack}
              />
            )}
            {step === 4 && (
              <StepAccount
                onFinish={handleFinish}
                onBack={goBack}
                isSubmitting={isSubmitting}
                error={error}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
