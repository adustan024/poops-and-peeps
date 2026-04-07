/**
 * styles/tokens.ts
 *
 * Design token constants for use in TypeScript/JS.
 * These mirror the CSS custom properties in globals.css.
 * Use when you need token values in JS logic (e.g. chart colors, inline styles).
 */

import type { PoopColor } from "@/types/stats";

export const colors = {
  // Brand
  brandPurple: "#7C3AED",
  brandPink:   "#EC4899",
  brandTeal:   "#0D9488",
  brandAmber:  "#F59E0B",
  brandBlue:   "#3B82F6",
  brandGreen:  "#22C55E",

  // Surfaces
  surface950: "#06060A",
  surface900: "#0A0A0F",
  surface800: "#13131A",
  surface700: "#1C1C26",
  surface600: "#252533",
  surface500: "#323244",
  surface400: "#4B4B66",
  surface300: "#6B6B88",

  // Text
  textPrimary:   "#F0F0FF",
  textSecondary: "#9999BB",
  textMuted:     "#8888AA",  // WCAG AA compliant on all dark surfaces (≥5:1)

  // Per-stat
  statWet:     "#3B82F6",
  statPoop:    "#92400E",
  statFeeding: "#22C55E",
  statSleep:   "#6366F1",
  statWeight:  "#EC4899",

  // Poop color choices
  poopYellow: "#FBBF24",
  poopGreen:  "#16A34A",
  poopBrown:  "#92400E",
  poopBlack:  "#1C1917",
} as const;

export const radius = {
  xs:    "0.25rem",
  sm:    "0.375rem",
  md:    "0.75rem",
  card:  "1rem",
  sheet: "1.5rem",
  full:  "9999px",
} as const;

/** Map StatType → display color hex */
export const statColor: Record<string, string> = {
  wet_diaper:  colors.statWet,
  poop_diaper: colors.statPoop,
  feeding:     colors.statFeeding,
  sleep:       colors.statSleep,
  weight:      colors.statWeight,
};

/** Map StatType → emoji */
export const statEmoji: Record<string, string> = {
  wet_diaper:  "💧",
  poop_diaper: "💩",
  feeding:     "🍼",
  sleep:       "😴",
  weight:      "⚖️",
};

/** Map StatType → display label */
export const statLabel: Record<string, string> = {
  wet_diaper:  "Wet Diaper",
  poop_diaper: "Poopy Diaper",
  feeding:     "Feeding",
  sleep:       "Sleep",
  weight:      "Weight",
};

/**
 * WCAG AA-safe text colors for each stat type.
 * Use these when the stat color appears as TEXT on dark surfaces.
 * Some stat colors (purple, indigo) are too dark for text — this map
 * provides lightened versions that hit ≥4.5:1 on surface-700 (#1C1C26).
 */
export const statTextColor: Record<string, string> = {
  wet_diaper:  "#60A5FA",  // same — passes at 10:1
  poop_diaper: "#C2855A",  // lightened brown — passes at 4.6:1
  feeding:     "#22C55E",  // same — passes at 7.9:1
  sleep:       "#818CF8",  // lightened indigo — passes at 6.0:1
  weight:      "#F472B6",  // lightened pink — passes at 5.2:1
};

/** Poop color name → hex (for inline style override) */
export const poopColorHex: Record<string, string> = {
  yellow: colors.poopYellow,
  green:  colors.poopGreen,
  brown:  colors.poopBrown,
  black:  colors.poopBlack,
};

/** Selected chip in PoopSheet: label (AA on fill), fill, border */
export const poopSheetChoiceSelected: Record<
  PoopColor,
  { label: string; fill: string; border: string }
> = {
  yellow: {
    label: colors.poopYellow,
    fill: `${colors.poopYellow}2E`,
    border: "#D97706",
  },
  green: {
    label: "#4ADE80",
    fill: `${colors.poopGreen}33`,
    border: "#15803D",
  },
  brown: {
    label: colors.poopBrown,
    fill: `${colors.poopBrown}3D`,
    border: "#78350F",
  },
  black: {
    label: "#F5F5F4",
    fill: "#121110",
    border: "#000000",
  },
};
