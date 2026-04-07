import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

export function ScreenTitleStack({ children, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>{children}</div>
  );
}
