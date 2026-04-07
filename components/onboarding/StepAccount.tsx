"use client";

import { useState } from "react";
import { IconChevronLeft } from "@/components/shared/IconChevronLeft";
import { motion } from "framer-motion";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";
import { staggerContainer, staggerItem } from "@/styles/animations";

interface Props {
  onFinish: (data: { email: string; password: string }) => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export function StepAccount({ onFinish, onBack, isSubmitting, error }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValid = email.includes("@") && password.length >= 8;

  return (
    <motion.div
      variants={staggerContainer}
      animate="animate"
      className="flex-1 flex flex-col px-6 pt-8"
    >
      <motion.div variants={staggerItem} className="text-center mb-8">
        <div className="text-6xl mb-4">🔐</div>
        <ScreenTitleStack>
          <h1 className="type-page-headline">Secure your account</h1>
          <p className="text-text-secondary text-base leading-relaxed">
            Share these credentials with your co-parent so you can both log in
            and track together. Your baby&apos;s data and photos are encrypted
            and private.
          </p>
        </ScreenTitleStack>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#9999BB] uppercase tracking-wider"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-4 text-base text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#9999BB] uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="w-full bg-[#1C1C26] border border-[#252533] rounded-xl px-4 py-4 text-base text-[#F0F0FF] placeholder-[#6B6B88] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888AA] hover:text-[#9999BB]"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p className="text-xs text-amber-400">
              Password must be at least 8 characters
            </p>
          )}
        </div>

        {/* Security note */}
        <div className="bg-[#1C1C26] border border-[#252533] rounded-xl p-4 flex gap-3">
          <span className="text-xl">🔒</span>
          <p className="text-xs text-[#9999BB] leading-relaxed">
            Your account is protected with Supabase&apos;s enterprise-grade security. Baby photos are stored in an encrypted, private bucket. Only you and your co-parent can access your data.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 space-y-1">
            <p className="text-sm font-medium text-red-300">Sign up failed</p>
            <p className="text-xs text-red-400 opacity-80">{error}</p>
          </div>
        )}
      </motion.div>

      <div className="flex-1" />

      <motion.div variants={staggerItem} className="flex gap-3 pb-8">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-4 rounded-2xl font-semibold text-base bg-[#1C1C26] text-[#9999BB] border border-[#252533] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <IconChevronLeft className="w-5 h-5 shrink-0" />
          Back
        </button>
        <button
          onClick={() => onFinish({ email, password })}
          disabled={!isValid || isSubmitting}
          className="flex-[2] py-4 rounded-2xl font-semibold text-base disabled:opacity-40 relative"
          style={{ background: "var(--gradient-cta-primary)", color: "var(--color-text-primary)" }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up…
            </span>
          ) : (
            "Let's go! 🎉"
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
