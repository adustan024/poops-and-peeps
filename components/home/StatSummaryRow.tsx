"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/styles/animations";
import { FlipCard } from "@/components/stats/FlipCard";
import { SleepStripCard } from "@/components/stats/SleepStripCard";
import { WeightFlipCard } from "@/components/stats/WeightFlipCard";
import { WetDiaperFlipCard } from "@/components/stats/WetDiaperFlipCard";
import { PoopDiaperCard } from "@/components/stats/PoopDiaperCard";
import { FeedingCard } from "@/components/stats/FeedingCard";
import type { TrackedStat, StatType } from "@/types/stats";
import type { DaySummary } from "@/types/stats";
import { GRID_STAT_TYPES } from "@/types/stats";

interface Props {
  babyId: string;
  babyName: string;
  userId: string | null;
  recordDate: string;
  trackedStats: TrackedStat[];
  todaySummary?: DaySummary;
}

const ORDER_STORAGE_KEY = "stat-card-order";

function isHomeStatCard(statType: StatType): boolean {
  return GRID_STAT_TYPES.includes(statType) || statType === "weight";
}

function loadOrder(stats: TrackedStat[]): StatType[] {
  try {
    const saved = localStorage.getItem(ORDER_STORAGE_KEY);
    if (saved) {
      const parsed: StatType[] = JSON.parse(saved);
      const enabled = new Set(stats.map((s) => s.stat_type));
      const filtered = parsed.filter((t) => enabled.has(t));
      const missing = stats.map((s) => s.stat_type).filter((t) => !filtered.includes(t));
      return [...filtered, ...missing];
    }
  } catch {}
  return stats.map((s) => s.stat_type);
}

function saveOrder(order: StatType[]) {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {}
}

function SortableCard({
  statType,
  babyId,
  userId,
  recordDate,
  todayCount,
  isExpanded,
  onToggleExpand,
}: {
  statType: StatType;
  babyId: string;
  userId: string | null;
  recordDate: string;
  todayCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: statType });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={staggerItem}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      {...attributes}
      {...listeners}
    >
      {statType === "sleep" ? (
        <SleepStripCard
          babyId={babyId}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      ) : statType === "weight" && userId ? (
        <WeightFlipCard
          babyId={babyId}
          userId={userId}
          recordDate={recordDate}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      ) : statType === "weight" ? null : statType === "wet_diaper" ? (
        <WetDiaperFlipCard
          babyId={babyId}
          todayCount={todayCount}
        />
      ) : statType === "poop_diaper" ? (
        <PoopDiaperCard
          babyId={babyId}
          todayCount={todayCount}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      ) : statType === "feeding" ? (
        <FeedingCard
          babyId={babyId}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      ) : (
        <FlipCard
          babyId={babyId}
          statType={statType}
          todayCount={todayCount}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      )}
    </motion.div>
  );
}

export function StatSummaryRow({
  babyId,
  babyName,
  userId,
  recordDate,
  trackedStats,
  todaySummary,
}: Props) {
  const [expandedStat, setExpandedStat] = useState<StatType | null>(null);

  const enabledHomeStats = useMemo(
    () =>
      trackedStats.filter((ts) => {
        if (!ts.enabled || !isHomeStatCard(ts.stat_type)) return false;
        if (ts.stat_type === "weight" && !userId) return false;
        return true;
      }),
    [trackedStats, userId]
  );

  const [order, setOrder] = useState<StatType[]>(() =>
    enabledHomeStats.map((s) => s.stat_type)
  );

  useEffect(() => {
    setOrder(loadOrder(enabledHomeStats));
  }, [enabledHomeStats]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as StatType);
      const newIndex = prev.indexOf(over.id as StatType);
      const next = arrayMove(prev, oldIndex, newIndex);
      saveOrder(next);
      return next;
    });
  }

  function toggleExpand(statType: StatType) {
    setExpandedStat((prev) => (prev === statType ? null : statType));
  }

  if (enabledHomeStats.length === 0) return null;

  const statMap = Object.fromEntries(enabledHomeStats.map((s) => [s.stat_type, s]));
  const orderedStats = order.filter((t) => statMap[t]);

  return (
    <div className="px-4 mt-8">
      <h3 className="type-sheet-title mb-4">
        {babyName}’s Stats
      </h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedStats} strategy={verticalListSortingStrategy}>
          <motion.div
            variants={staggerContainer}
            animate="animate"
            className="flex flex-col gap-3"
          >
            {orderedStats.map((statType) => (
              <SortableCard
                key={statType}
                statType={statType}
                babyId={babyId}
                userId={userId}
                recordDate={recordDate}
                todayCount={todaySummary?.counts[statType] ?? 0}
                isExpanded={expandedStat === statType}
                onToggleExpand={() => toggleExpand(statType)}
              />
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
