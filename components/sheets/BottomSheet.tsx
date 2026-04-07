"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { fadeIn } from "@/styles/animations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

function splitSheetTitle(title: string): { text: string; emoji: string } {
  const cluster =
    /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu;
  const emojiChunks = [...title.matchAll(cluster)].map((m) => m[0]);
  const textOnly = title
    .replace(
      /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu,
      ""
    )
    .trim();
  return { text: textOnly, emoji: emojiChunks.join("") };
}

export function BottomSheet({ isOpen, onClose, title, children }: Props) {
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
            <motion.div
              ref={sheetRef}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) {
                  onClose();
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0, transition: { type: "spring", stiffness: 420, damping: 42 } }}
              exit={{ y: "100%", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
              className="pointer-events-auto w-full bg-[#13131A] rounded-t-[24px] overflow-hidden"
              style={{
                maxWidth:  "var(--layout-content-max-width)",
                maxHeight: "85dvh",
              }}
            >
              <div
                className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-[#252533]" />
              </div>

              {title && (() => {
                const { text, emoji } = splitSheetTitle(title);
                return (
                  <div className="px-5 py-3 border-b border-[var(--color-surface-700)]">
                    <h2 className="type-sheet-title">
                      {text}
                      {emoji ? (
                        <span className="font-sans not-italic ml-2" aria-hidden>
                          {emoji}
                        </span>
                      ) : null}
                    </h2>
                  </div>
                );
              })()}

              <div
                className="overflow-y-auto"
                style={{
                  maxHeight: "75dvh",
                  paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
                }}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
