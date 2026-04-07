export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Surface fill for stat cards (Home, flip cards, onboarding tiles) */
export function statCardRadialFill(hex: string): string {
  return `radial-gradient(farthest-corner at 0% 0%, ${hexToRgba(hex, 0.12)}, ${hexToRgba(hex, 0.03)})`;
}

/** Border for stat cards */
export function statCardHomeBorder(hex: string): string {
  return hexToRgba(hex, 0.25);
}

/** Surface fill for sheet action buttons (save / delete) */
export function sheetButtonRadialFill(hex: string): string {
  return `radial-gradient(farthest-corner at 0% 0%, ${hexToRgba(hex, 0.50)}, ${hexToRgba(hex, 0.07)})`;
}

/** Border for sheet action buttons */
export function sheetButtonBorder(hex: string): string {
  return hexToRgba(hex, 0.35);
}

const SURFACE_CALENDAR_SHELL = "#13131A";

export function calendarMonthShellRadial(): string {
  return `radial-gradient(farthest-corner at 0% 0%, ${hexToRgba(SURFACE_CALENDAR_SHELL, 1)}, ${hexToRgba(SURFACE_CALENDAR_SHELL, 0.4)})`;
}
