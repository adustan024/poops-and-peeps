"use client";

import type { ComponentProps, ReactNode } from "react";
import { getBabyAvatarRingSurfaceStyle } from "@/lib/babyAvatarRingStyles";

type ButtonProps = ComponentProps<"button">;

interface Props extends Omit<ButtonProps, "style" | "children"> {
  ringIndex: number;
  innerClassName: string;
  children?: ReactNode;
}

export function BabyAvatarRingSurface({
  ringIndex,
  innerClassName,
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  const surfaceStyle = getBabyAvatarRingSurfaceStyle(ringIndex);
  return (
    <button
      type={type}
      className={`rounded-full shrink-0 box-border flex items-center justify-center overflow-hidden cursor-pointer ${innerClassName} ${className}`}
      style={surfaceStyle}
      {...rest}
    >
      {children}
    </button>
  );
}
