/**
 * styles/animations.ts
 *
 * All Framer Motion variant presets for the app.
 * Import from here — never define variants inline in components.
 * Update this file when design system animation spec changes.
 */

import type { Variants, Transition } from "framer-motion";

// ─── Shared Transitions ──────────────────────────────────────────────────────

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 38,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 32,
};

export const easeOut: Transition = {
  duration: 0.25,
  ease: [0.0, 0.0, 0.2, 1.0],
};

export const easeIn: Transition = {
  duration: 0.2,
  ease: [0.4, 0.0, 1.0, 1.0],
};

// ─── Page Transitions ────────────────────────────────────────────────────────

/** Slide in from right — forward navigation */
export const slideInRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springSnappy,
  },
  exit: {
    x: "-25%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

/** Slide in from left — back navigation */
export const slideInLeft: Variants = {
  initial: { x: "-100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: springSnappy,
  },
  exit: {
    x: "25%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

/** Fade up — modals and overlays */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

/** Simple fade — backdrop overlays */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

export const bottomSheet: Variants = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 42 },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Flip Card ───────────────────────────────────────────────────────────────

const flipTransition: Transition = {
  duration: 0.52,
  ease: [0.22, 1, 0.36, 1],
};

export const flipCardFront: Variants = {
  front: { rotateY: 0, transition: flipTransition },
  back: { rotateY: -180, transition: flipTransition },
};

export const flipCardBack: Variants = {
  front: { rotateY: 180, transition: flipTransition },
  back: { rotateY: 0, transition: flipTransition },
};

// ─── Onboarding ──────────────────────────────────────────────────────────────

/** Step forward — new step slides in from right */
export const onboardingStepForward: Variants = {
  initial: { opacity: 0, x: 48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0,
    x: -32,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

/** Step back — new step slides in from left */
export const onboardingStepBack: Variants = {
  initial: { opacity: 0, x: -48 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0,
    x: 32,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Stat Cell ───────────────────────────────────────────────────────────────

/** Tap feedback for grid cells */
export const cellTapFeedback = {
  whileTap: { scale: 0.88, transition: { duration: 0.08 } },
};

/** Pop animation when a cell gets filled */
export const cellFillPop: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 28 },
  },
};

// ─── List Stagger ────────────────────────────────────────────────────────────

/** Parent: apply to wrapping container */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Child: apply to each item */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.0, 0.0, 0.2, 1.0] },
  },
};

// ─── Confirm Delete Modal ────────────────────────────────────────────────────

export const confirmModal: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 480, damping: 36 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.16 },
  },
};

// ─── Skeleton Pulse ──────────────────────────────────────────────────────────

export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
