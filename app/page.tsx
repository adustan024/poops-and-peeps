"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LANDING_FLOATING_EMOJIS } from "@/lib/landingFloatingEmojis";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative">
      {/* Full-bleed backdrop — escapes the 430px container via fixed positioning */}
      <div className="fixed inset-0 landing-ob-bg pointer-events-none overflow-hidden z-0" aria-hidden>
        {LANDING_FLOATING_EMOJIS.map((f) => (
          <motion.span
            key={`${f.emoji}-${f.x}-${f.y}`}
            className="absolute select-none"
            style={{ left: f.x, top: f.y, fontSize: f.size, opacity: 0.12 }}
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: f.dur,
              delay: f.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {f.emoji}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span
            className="text-display-mark font-sans text-text-primary leading-none"
            aria-hidden
          >
            💩
          </span>
          <h1
            className="text-display-hero font-display italic text-text-primary tracking-[var(--tracking-display-hero)] leading-none whitespace-pre-wrap"
          >
            <span className="block">Poops </span>
            <span className="block">& Peeps</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-md text-text-secondary max-w-[21.5rem] mt-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          Track every feed, nap, diaper, and milestone —
          <br />
          so you can worry less and wonder more.
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 w-full mt-14"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/onboarding")}
            className="btn-cta-primary w-full py-4 rounded-2xl text-md"
          >
            Get Started
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/login")}
            className="btn-cta-secondary w-full py-4 rounded-2xl text-md box-border"
          >
            Log In
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
