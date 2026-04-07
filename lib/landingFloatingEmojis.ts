export type LandingFloatingEmoji = {
  emoji: string;
  x: string;
  y: string;
  size: string;
  delay: number;
  dur: number;
};

export const LANDING_FLOATING_EMOJIS: LandingFloatingEmoji[] = [
  { emoji: "💩", x: "12%", y: "calc(55% + 32px)", size: "1.8rem", delay: 2, dur: 8 },
  { emoji: "🍼", x: "82%", y: "8%", size: "2rem", delay: 1.2, dur: 7 },
  { emoji: "😴", x: "8%", y: "12%", size: "2.5rem", delay: 0, dur: 6 },
  { emoji: "💧", x: "75%", y: "38%", size: "2.2rem", delay: 0.5, dur: 5 },
  { emoji: "⚖️", x: "88%", y: "calc(65% - 8px)", size: "1.8rem", delay: 0.8, dur: 6.5 },
  { emoji: "📷", x: "5%", y: "calc(80% + 24px)", size: "2rem", delay: 1.5, dur: 7.5 },
  { emoji: "⏱️", x: "78%", y: "calc(82% + 24px)", size: "1.8rem", delay: 0.3, dur: 5.5 },
];
