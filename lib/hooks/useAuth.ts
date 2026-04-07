/**
 * lib/hooks/useAuth.ts
 *
 * Sets up the Supabase auth state listener and keeps authStore in sync.
 * Call this once in the root layout or a top-level provider.
 */

"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";

export function useAuthListener() {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    function applySession(session: Parameters<typeof setSession>[0]) {
      setSession(session);
      setLoading(false);
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch(() => applySession(null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    function resyncFromStorage() {
      supabase.auth.getSession().then(({ data: { session } }) => {
        applySession(session);
      });
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") resyncFromStorage();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", resyncFromStorage);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", resyncFromStorage);
    };
  }, [setSession, setLoading]);
}

/** Simple hook to read auth state in components */
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      session: s.session,
      isLoading: s.isLoading,
    }))
  );
}
