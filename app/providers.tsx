"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppTimeProvider } from "@/lib/appTimeContext";
import { useAuthListener } from "@/lib/hooks/useAuth";

function AuthListenerInner({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

export function Providers({
  children,
  initialDemoAppNowIso,
}: {
  children: React.ReactNode;
  initialDemoAppNowIso: string | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppTimeProvider initialDemoAppNowIso={initialDemoAppNowIso}>
        <AuthListenerInner>{children}</AuthListenerInner>
      </AppTimeProvider>
    </QueryClientProvider>
  );
}
