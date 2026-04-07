"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { statEmoji, statLabel, statColor, statTextColor } from "@/styles/tokens";
import { useProfileStore } from "@/lib/store/profileStore";
import { useDailyRecord } from "@/lib/hooks/useDailyRecord";
import { upsertDailyRecordMerge, clearDailyRecordWeight, getLatestWeight } from "@/lib/supabase/queries/daily-records";
import { WeightSheet } from "@/components/sheets/WeightSheet";
import { CardFaceFront } from "@/components/shared/CardFaceFront";
import { CardFaceBack } from "@/components/shared/CardFaceBack";
import { WeightChart } from "./WeightChart";
import { formatWeight } from "@/types/profile";

interface Props {
  babyId: string;
  userId: string;
  recordDate: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function WeightFlipCard({
  babyId,
  userId,
  recordDate,
  isExpanded = false,
  onToggleExpand,
}: Props) {
  const [isFlipped,  setIsFlipped]  = useState(false);
  const [sheetOpen,  setSheetOpen]  = useState(false);

  const units       = useProfileStore((s) => s.profile?.units ?? "imperial");
  const queryClient = useQueryClient();
  const { data: record } = useDailyRecord(babyId, recordDate);

  const { data: latestWeight } = useQuery({
    queryKey: ["latestWeight", babyId],
    queryFn: () => getLatestWeight(babyId),
    staleTime: 60 * 1000,
  });

  const statType  = "weight" as const;
  const color     = statColor[statType];
  const textColor = statTextColor[statType];
  const emoji     = statEmoji[statType];
  const label     = statLabel[statType];

  const displayValue = latestWeight?.weight_grams
    ? formatWeight(latestWeight.weight_grams, units)
    : "—";

  const dateLabel = useMemo(
    () => latestWeight?.record_date
      ? format(parseISO(latestWeight.record_date), "MMM d, yyyy")
      : "no weight yet",
    [latestWeight?.record_date]
  );

  const mergeMutation = useMutation({
    mutationFn: upsertDailyRecordMerge,
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["dailyRecord", v.babyId, v.date] });
      queryClient.invalidateQueries({ queryKey: ["weightChart", babyId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["latestWeight", babyId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => clearDailyRecordWeight(babyId, recordDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyRecord", babyId, recordDate] });
      queryClient.invalidateQueries({ queryKey: ["weightChart", babyId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["latestWeight", babyId] });
    },
  });

  const openSheet = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSheetOpen(true);
  }, []);

  return (
    <>
      <motion.div
        layout
        className="flip-card-container w-full cursor-pointer"
        style={{ height: isExpanded ? 300 : 156 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        onClick={() => setIsFlipped((v) => !v)}
      >
        <motion.div
          className="flip-card-inner w-full h-full"
          animate={isFlipped ? "back" : "front"}
        >
          <CardFaceFront
            color={color}
            textColor={textColor}
            label={label}
            emoji={emoji}
            isExpanded={isExpanded}
            leftLabel={dateLabel}
          >
            <div className="flex items-end justify-between">
              <div className="font-bold" style={{ fontSize: "var(--text-3xl)", color: textColor }}>
                {displayValue}
              </div>
              <button
                type="button"
                onClick={openSheet}
                className="flex items-center font-bold rounded-full shrink-0 uppercase tracking-wide"
                style={{
                  fontSize:      "var(--text-2xs)",
                  gap:           "var(--space-4)",
                  paddingTop:    "0px",
                  paddingBottom: "0px",
                  paddingLeft:   "var(--space-12)",
                  paddingRight:  "var(--space-12)",
                  background:    `${color}28`,
                  color:         textColor,
                  border:        `1px solid ${color}50`,
                  transform:     "translateY(4px)",
                }}
              >
                add weight <span aria-hidden style={{ fontSize: "var(--text-sm)", lineHeight: 1 }}>+</span>
              </button>
            </div>
          </CardFaceFront>

          <CardFaceBack
            color={color}
          >
            <WeightChart babyId={babyId} period="month" />
          </CardFaceBack>
        </motion.div>
      </motion.div>

      <WeightSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initialWeightGrams={record?.weight_grams}
        initialDate={recordDate}
        isEditing={!!record?.weight_grams}
        onSave={(grams, date) => {
          mergeMutation.mutate({ userId, babyId, date, weightGrams: grams });
        }}
        onDelete={() => deleteMutation.mutate()}
      />
    </>
  );
}
