"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { useUIStore } from "@/lib/store/uiStore";

type Ctx = {
  appNow: Date;
  clearDemoAppTimeCookie: () => Promise<void>;
};

const AppTimeContext = createContext<Ctx | null>(null);

function readDemoAppNowFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    if (name !== "demo_app_now") continue;
    let value = trimmed.slice(eq + 1).trim();
    if (!value) return null;
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep raw */
    }
    return value;
  }
  return null;
}

function syncCalendarToNow(now: Date) {
  const ymd = format(now, "yyyy-MM-dd");
  useUIStore.setState({
    selectedDate: ymd,
    calendarMonth: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });
}

export function AppTimeProvider({
  children,
  initialDemoAppNowIso,
}: {
  children: ReactNode;
  initialDemoAppNowIso: string | null;
}) {
  const pathname = usePathname();
  const [frozenIso, setFrozenIso] = useState<string | null>(initialDemoAppNowIso);
  const [liveTick, setLiveTick] = useState(0);
  const demoTimeClearedRef = useRef(false);

  useEffect(() => {
    const fromCookie = readDemoAppNowFromDocumentCookie();
    if (fromCookie) {
      const d = new Date(fromCookie);
      if (!Number.isNaN(d.getTime())) {
        demoTimeClearedRef.current = false;
        setFrozenIso(d.toISOString());
        return;
      }
    }
    if (demoTimeClearedRef.current) {
      setFrozenIso(null);
      return;
    }
    setFrozenIso(initialDemoAppNowIso);
  }, [pathname, initialDemoAppNowIso]);

  useEffect(() => {
    if (frozenIso) return;
    const id = window.setInterval(() => setLiveTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, [frozenIso]);

  const appNow = useMemo(() => {
    if (frozenIso) return new Date(frozenIso);
    return new Date();
  }, [frozenIso, liveTick]);

  useEffect(() => {
    const now = frozenIso ? new Date(frozenIso) : new Date();
    syncCalendarToNow(now);
  }, [frozenIso]);

  const clearDemoAppTimeCookie = useCallback(async () => {
    demoTimeClearedRef.current = true;
    await fetch("/api/clear-demo-time", { method: "POST" });
    setFrozenIso(null);
  }, []);

  const value = useMemo(
    () => ({ appNow, clearDemoAppTimeCookie }),
    [appNow, clearDemoAppTimeCookie]
  );

  return (
    <AppTimeContext.Provider value={value}>{children}</AppTimeContext.Provider>
  );
}

export function useAppNow(): Date {
  const ctx = useContext(AppTimeContext);
  return ctx?.appNow ?? new Date();
}

export function useClearDemoAppTime() {
  const ctx = useContext(AppTimeContext);
  return ctx?.clearDemoAppTimeCookie ?? (async () => {});
}
