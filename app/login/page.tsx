"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useClearDemoAppTime } from "@/lib/appTimeContext";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";

type View = "login" | "forgot" | "forgot-sent";

export default function LoginPage() {
  const clearDemoAppTime = useClearDemoAppTime();
  const router = useRouter();
  const [view, setView] = useState<View>("login");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    await clearDemoAppTime();
    router.replace("/home");
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setIsLoading(false);

    if (resetError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setView("forgot-sent");
  }

  function switchView(next: View) {
    setError(null);
    setView(next);
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0F] flex flex-col">
      {/* Close → back to landing */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C26] text-[#9999BB] hover:text-[#F0F0FF] transition-colors z-10"
        aria-label="Back to home"
      >
        ✕
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── Login ── */}
          {view === "login" && (
            <motion.div
              key="login"
              className="w-full max-w-sm flex flex-col gap-8"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ScreenTitleStack>
                <h1 className="type-page-headline">Welcome back</h1>
                <p className="text-text-secondary">
                  Log in to pick up where you left off.
                </p>
              </ScreenTitleStack>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9999BB] uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#1C1C26] border border-[#252533] text-[#F0F0FF] placeholder-[#4B4B66] outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#9999BB] uppercase tracking-widest">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      className="text-xs text-[#A78BFA] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#1C1C26] border border-[#252533] text-[#F0F0FF] placeholder-[#4B4B66] outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl font-semibold text-base text-white mt-2 disabled:opacity-50"
                  style={{ background: "var(--gradient-cta-primary)" }}
                >
                  {isLoading ? "Logging in…" : "Log In"}
                </motion.button>
              </form>

              <p className="text-center text-sm text-[#9999BB]">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => router.push("/onboarding")}
                  className="text-[#A78BFA] font-semibold hover:underline"
                >
                  Get Started
                </button>
              </p>
            </motion.div>
          )}

          {/* ── Forgot password ── */}
          {view === "forgot" && (
            <motion.div
              key="forgot"
              className="w-full max-w-sm flex flex-col gap-8"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ScreenTitleStack>
                <h1 className="type-page-headline">Reset password</h1>
                <p className="text-text-secondary">
                  Enter your email and we&apos;ll send you a link to set a new
                  password.
                </p>
              </ScreenTitleStack>

              <form onSubmit={handleForgot} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9999BB] uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#1C1C26] border border-[#252533] text-[#F0F0FF] placeholder-[#4B4B66] outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl font-semibold text-base text-white mt-2 disabled:opacity-50"
                  style={{ background: "var(--gradient-cta-primary)" }}
                >
                  {isLoading ? "Sending…" : "Send Reset Link"}
                </motion.button>
              </form>

              <p className="text-center text-sm text-[#9999BB]">
                Remember it?{" "}
                <button
                  onClick={() => switchView("login")}
                  className="text-[#A78BFA] font-semibold hover:underline"
                >
                  Back to log in
                </button>
              </p>
            </motion.div>
          )}

          {/* ── Sent confirmation ── */}
          {view === "forgot-sent" && (
            <motion.div
              key="forgot-sent"
              className="w-full max-w-sm flex flex-col items-center gap-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg, #7C3AED22, #EC489922)", border: "1px solid #7C3AED44" }}>
                📬
              </div>
              <ScreenTitleStack>
                <h1 className="type-page-headline">Check your inbox</h1>
                <p className="text-text-secondary leading-relaxed">
                  We sent a reset link to{" "}
                  <span className="text-text-primary font-medium">
                    {resetEmail}
                  </span>
                  . Follow the link to set a new password.
                </p>
              </ScreenTitleStack>
              <button
                onClick={() => switchView("login")}
                className="text-sm text-[#A78BFA] font-semibold hover:underline mt-2"
              >
                Back to log in
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
