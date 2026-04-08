"use client";

import { differenceInDays, differenceInWeeks, differenceInMonths, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { staggerItem } from "@/styles/animations";
import { useRouter } from "next/navigation";
import { BabyAvatarRingSurface } from "@/components/shared/BabyAvatarRingSurface";
import { getBabyAvatarEmoji } from "@/lib/babyEmoji";

interface Props {
  babyName: string;
  birthDate: string; // "YYYY-MM-DD"
  photoUrl?: string | null;
  avatarEmojiTone?: number | null;
  avatarRingStyle?: number | null;
}

function getAgeLabel(birthDate: string): string {
  const birth = parseISO(birthDate);
  const now   = new Date();
  const days   = differenceInDays(now, birth);
  const weeks  = differenceInWeeks(now, birth);
  const months = differenceInMonths(now, birth);

  if (days === 0) return "Born today! 🎉";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} old`;
  if (weeks < 25) return `${weeks} week${weeks === 1 ? "" : "s"} old`;
  if (months < 24) return `${months} month${months === 1 ? "" : "s"} old`;

  const years     = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) {
    return `${years} year${years === 1 ? "" : "s"} old`;
  }
  return `${years} year${years === 1 ? "" : "s"} ${remMonths} month${remMonths === 1 ? "" : "s"} old`;
}

export function BabyHeader({
  babyName,
  birthDate,
  photoUrl,
  avatarEmojiTone,
  avatarRingStyle,
}: Props) {
  const router = useRouter();
  const ageLabel = getAgeLabel(birthDate);

  return (
    <motion.div
      variants={staggerItem}
      className="flex items-center gap-4 px-5 pt-page-header pb-4"
    >
      <BabyAvatarRingSurface
        ringIndex={avatarRingStyle ?? 0}
        innerClassName="w-14 h-14"
        onClick={() => router.push("/settings")}
        aria-label={`${babyName} — open settings`}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">{getBabyAvatarEmoji(avatarEmojiTone)}</span>
        )}
      </BabyAvatarRingSurface>

      <div className="flex-1">
        <h1 className="font-display italic leading-tight" style={{ fontSize: "var(--text-2xl)", color: "var(--color-text-primary)" }}>
          {babyName}
        </h1>
        <p className="text-sm text-[#9999BB]">{ageLabel}</p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/settings")}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1C1C26] text-[#9999BB]"
      >
        ⚙️
      </button>
    </motion.div>
  );
}
