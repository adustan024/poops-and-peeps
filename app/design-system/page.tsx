"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ScreenTitleStack } from "@/components/shared/ScreenTitleStack";

/* ─────────────────────────────────────────────
   TOKEN REGISTRY
   Single source of truth for the DS page.
   Keys match the CSS custom property names.
   ───────────────────────────────────────────── */
const COLOR_TOKENS: Record<string, { label: string; groups: Record<string, { var: string; default: string; description?: string }[]> }> = {
  brand: {
    label: "Brand",
    groups: {
      "": [
        { var: "--color-brand-purple", default: "#7C3AED", description: "Primary — buttons, active states" },
        { var: "--color-brand-pink",   default: "#EC4899", description: "Secondary — gradients, weight stat" },
        { var: "--color-brand-teal",   default: "#0D9488", description: "Teal — tummy time, accent" },
        { var: "--color-brand-amber",  default: "#F59E0B", description: "Amber — general accent" },
        { var: "--color-brand-blue",   default: "#3B82F6", description: "Blue — spit-up stat" },
        { var: "--color-brand-green",  default: "#22C55E", description: "Green — feeding stat" },
      ],
    },
  },
  surface: {
    label: "Surfaces",
    groups: {
      "": [
        { var: "--color-surface-950", default: "#06060A", description: "Deepest background" },
        { var: "--color-surface-900", default: "#0A0A0F", description: "Primary page background" },
        { var: "--color-surface-800", default: "#13131A", description: "Card & sheet background" },
        { var: "--color-surface-700", default: "#1C1C26", description: "Elevated card / input" },
        { var: "--color-surface-600", default: "#252533", description: "Dividers, subtle borders" },
        { var: "--color-surface-500", default: "#323244", description: "Inactive toggle background" },
        { var: "--color-surface-400", default: "#4B4B66", description: "Borders only (fails WCAG as text)" },
        { var: "--color-surface-300", default: "#6B6B88", description: "Placeholder, subtle chrome" },
      ],
    },
  },
  text: {
    label: "Text",
    groups: {
      "": [
        { var: "--color-text-primary",   default: "#F0F0FF", description: "17.5:1 on surface-900" },
        { var: "--color-text-secondary", default: "#9999BB", description: "7.2:1 on surface-900" },
        { var: "--color-text-muted",     default: "#8888AA", description: "6.2:1 on surface-900 — WCAG AA" },
        { var: "--color-text-inverse",   default: "#0A0A0F", description: "On light surfaces" },
      ],
    },
  },
  stats: {
    label: "Stats",
    groups: {
      "Fill (backgrounds, borders)": [
        { var: "--color-stat-wet",     default: "#FBBF24" },
        { var: "--color-stat-poop",    default: "#92400E" },
        { var: "--color-stat-feeding", default: "#22C55E" },
        { var: "--color-stat-spitup",  default: "#3B82F6" },
        { var: "--color-stat-sleep",   default: "#6366F1" },
        { var: "--color-stat-tummy",   default: "#0D9488" },
        { var: "--color-stat-weight",  default: "#EC4899" },
        { var: "--color-stat-photo",   default: "#7C3AED" },
      ],
    },
  },
  poop: {
    label: "Poop Palette",
    groups: {
      "": [
        { var: "--color-poop-yellow", default: "#FBBF24", description: "Yellow / mustard" },
        { var: "--color-poop-green",  default: "#16A34A", description: "Green" },
        { var: "--color-poop-brown",  default: "#92400E", description: "Brown (default)" },
        { var: "--color-poop-black",  default: "#1C1917", description: "Black / meconium" },
      ],
    },
  },
};

const STAT_LABELS: Record<string, string> = {
  "--color-stat-wet":     "Wet Diaper",
  "--color-stat-poop":    "Poopy Diaper",
  "--color-stat-feeding": "Feeding",
  "--color-stat-spitup":  "Spit-Up",
  "--color-stat-sleep":   "Sleep",
  "--color-stat-tummy":   "Tummy Time",
  "--color-stat-weight":  "Weight",
  "--color-stat-photo":   "Photo",
};

const STAT_TEXT_COLORS: Record<string, string> = {
  "--color-stat-wet":     "#FBBF24",
  "--color-stat-poop":    "#C2855A",
  "--color-stat-feeding": "#22C55E",
  "--color-stat-spitup":  "#60A5FA",
  "--color-stat-sleep":   "#818CF8",
  "--color-stat-tummy":   "#2DD4BF",
  "--color-stat-weight":  "#F472B6",
  "--color-stat-photo":   "#A78BFA",
};

const STAT_EMOJIS: Record<string, string> = {
  "--color-stat-wet":     "💧",
  "--color-stat-poop":    "💩",
  "--color-stat-feeding": "🍼",
  "--color-stat-spitup":  "🤢",
  "--color-stat-sleep":   "😴",
  "--color-stat-tummy":   "⏱️",
  "--color-stat-weight":  "⚖️",
  "--color-stat-photo":   "📷",
};

const RADIUS_TOKENS = [
  { var: "--radius-xs",    default: "0.25rem", label: "xs",    desc: "Micro (4px)" },
  { var: "--radius-sm",    default: "0.375rem", label: "sm",   desc: "Cell (6px)" },
  { var: "--radius-md",    default: "0.75rem",  label: "md",   desc: "Inputs (12px)" },
  { var: "--radius-card",  default: "1rem",     label: "card", desc: "Cards (16px)" },
  { var: "--radius-sheet", default: "1.5rem",   label: "sheet",desc: "Sheets (24px)" },
  { var: "--radius-full",  default: "9999px",   label: "full", desc: "Pills" },
];

const SPACING_TOKENS = [
  { var: "--space-4",  default: "0.25rem",  px: 4  },
  { var: "--space-8",  default: "0.5rem",   px: 8  },
  { var: "--space-12", default: "0.75rem",  px: 12 },
  { var: "--space-16", default: "1rem",     px: 16 },
  { var: "--space-20", default: "1.25rem",  px: 20 },
  { var: "--space-24", default: "1.5rem",   px: 24 },
  { var: "--space-32", default: "2rem",     px: 32 },
  { var: "--space-40", default: "2.5rem",   px: 40 },
  { var: "--space-48", default: "3rem",     px: 48 },
  { var: "--space-64", default: "4rem",     px: 64 },
  { var: "--space-80", default: "5rem",     px: 80 },
  { var: "--space-96", default: "6rem",     px: 96 },
];

const FONT_SIZE_TOKENS = [
  { var: "--text-2xs", default: "0.625rem", px: 10, label: "2xs", usage: "Time labels, tiny hints" },
  { var: "--text-xs",  default: "0.75rem",  px: 12, label: "xs",  usage: "Captions, badges, section headers" },
  { var: "--text-sm",  default: "0.875rem", px: 14, label: "sm",  usage: "Body small, labels" },
  {
    var: "--text-md",
    default: "1rem",
    px: 16,
    label: "md",
    usage: "Body default — Barlow 400, 24px line, --tracking-body",
  },
  { var: "--text-lg",  default: "1.125rem", px: 18, label: "lg",  usage: "Subheadings" },
  { var: "--text-xl",  default: "1.25rem",  px: 20, label: "xl",  usage: "Headings" },
  { var: "--text-2xl", default: "1.5rem",   px: 24, label: "2xl", usage: "Page titles" },
  { var: "--text-3xl", default: "1.875rem", px: 30, label: "3xl", usage: "Section display" },
  {
    var: "--text-display-mark",
    default: "4rem",
    px: 64,
    label: "display-mark",
    usage: "Landing hero mark — Instrument Serif regular",
  },
  {
    var: "--text-display-hero",
    default: "6rem",
    px: 96,
    label: "display-hero",
    usage: "Landing only — Instrument Serif italic; --tracking-display-hero",
  },
  {
    var: "--text-page-headline",
    default: "2.5rem",
    px: 40,
    label: "page-headline",
    usage: "Screen titles — use inside ScreenTitleStack with .type-page-headline + subtitle (40/48, Instrument Serif italic)",
  },
];

const FONT_WEIGHT_TOKENS = [
  { var: "--font-weight-regular",  default: "400", label: "Regular" },
  { var: "--font-weight-medium",   default: "500", label: "Medium" },
  { var: "--font-weight-semibold", default: "600", label: "Semibold" },
  { var: "--font-weight-bold",     default: "700", label: "Bold" },
];

const LEADING_TOKENS = [
  { var: "--leading-tight",   default: "1.2",   label: "Tight" },
  { var: "--leading-normal",  default: "1.5",   label: "Normal" },
  { var: "--leading-relaxed", default: "1.625", label: "Relaxed" },
  { var: "--leading-display-tight", default: "1", label: "Display 1:1" },
  { var: "--leading-body-md", default: "1.5rem", label: "Body md (24px)" },
  { var: "--leading-page-headline", default: "3rem", label: "Page headline (48px)" },
];

const FONT_FAMILY_TOKENS = [
  { var: "--font-sans",    default: "Barlow, ui-sans-serif, system-ui",                  label: "Sans",    style: {} as React.CSSProperties,           usage: "Body / UI text" },
  { var: "--font-display", default: "Instrument Serif, Georgia, serif",                  label: "Display", style: { fontStyle: "italic" } as React.CSSProperties, usage: "Headlines / accent (italic)" },
  { var: "--font-mono",    default: "ui-monospace, monospace",                           label: "Mono",    style: {} as React.CSSProperties,           usage: "Time labels, numeric readouts" },
];

const SHADOW_TOKENS = [
  { label: "card",         value: "0 4px 24px rgba(0,0,0,0.5)",        desc: "Standard card" },
  { label: "card-hover",   value: "0 8px 32px rgba(0,0,0,0.6)",        desc: "Card on press" },
  { label: "glow-purple",  value: "0 0 24px rgba(124,58,237,0.35)",    desc: "Active/focus purple" },
  { label: "glow-pink",    value: "0 0 24px rgba(236,72,153,0.35)",    desc: "Pink glow" },
  { label: "glow-teal",    value: "0 0 24px rgba(13,148,136,0.35)",    desc: "Teal glow" },
];

const STORAGE_KEY = "ds-token-overrides";

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */
function varName(cssVar: string) {
  // "--color-brand-purple" → "brand-purple"
  return cssVar.replace(/^--color-/, "").replace(/^--/, "");
}

function shortName(cssVar: string) {
  const parts = cssVar.replace(/^--color-/, "").split("-");
  return parts[parts.length - 1];
}

function getLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string) {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker  = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(1);
  } catch { return "—"; }
}

function textColorFor(bg: string) {
  try {
    const l = getLuminance(bg);
    return l > 0.18 ? "#0A0A0F" : "#F0F0FF";
  } catch { return "#F0F0FF"; }
}

/* ─────────────────────────────────────────────
   EDITABLE TOKEN — click any value to edit it
   Handles: px sizes, weights, line-heights, font families
   ───────────────────────────────────────────── */
function EditableToken({
  cssVar,
  defaultVal,
  display,
  type = "text",
  overrides,
  onUpdate,
  className = "",
}: {
  cssVar: string;
  defaultVal: string;
  display?: string;
  type?: "px" | "number" | "text";
  overrides: Record<string, string>;
  onUpdate: (cssVar: string, val: string) => void;
  className?: string;
}) {
  const stored = overrides[cssVar] ?? defaultVal;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isModified = overrides[cssVar] && overrides[cssVar] !== defaultVal;

  function startEdit() {
    if (type === "px") {
      // Convert rem → px for editing
      const rem = parseFloat(stored);
      setDraft(String(Math.round(rem * 16)));
    } else {
      setDraft(stored);
    }
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  }

  function commit() {
    setEditing(false);
    if (!draft.trim()) return;
    if (type === "px") {
      const px = parseFloat(draft);
      if (isNaN(px) || px <= 0) return;
      onUpdate(cssVar, `${(px / 16).toFixed(4).replace(/\.?0+$/, "")}rem`);
    } else if (type === "number") {
      const n = parseFloat(draft);
      if (isNaN(n)) return;
      onUpdate(cssVar, String(n));
    } else {
      onUpdate(cssVar, draft.trim());
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
    if (type === "px" || type === "number") {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setDraft(d => String((parseFloat(d) || 0) + 1));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDraft(d => String(Math.max(1, (parseFloat(d) || 0) - 1)));
      }
    }
  }

  const shown = display ?? stored;

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className={`bg-[#252533] text-[#F0F0FF] font-mono rounded px-2 py-0.5 outline-none border border-[#7C3AED] ${className}`}
        style={{ width: type === "text" ? "100%" : "5em" }}
      />
    );
  }

  return (
    <button
      onClick={startEdit}
      title="Click to edit"
      className={`font-mono rounded px-2 py-0.5 transition-colors hover:bg-[#252533] active:scale-95 text-left ${
        isModified ? "text-[#EC4899]" : "text-[#9999BB]"
      } ${className}`}
    >
      {shown}
      {isModified && <span className="ml-1 text-[#EC4899] text-[9px]">●</span>}
    </button>
  );
}

/* ─────────────────────────────────────────────
   COLOR SWATCH — click to open picker
   ───────────────────────────────────────────── */
function ColorSwatch({
  cssVar,
  defaultHex,
  description,
  overrides,
  onUpdate,
}: {
  cssVar: string;
  defaultHex: string;
  description?: string;
  overrides: Record<string, string>;
  onUpdate: (cssVar: string, hex: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hex = overrides[cssVar] ?? defaultHex;
  const isModified = overrides[cssVar] && overrides[cssVar] !== defaultHex;
  const textCol = textColorFor(hex);
  const label = varName(cssVar);

  return (
    <div className="group flex flex-col gap-2">
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-20 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 flex items-end p-2"
        style={{
          background: hex,
          borderColor: isModified ? "#EC4899" : "transparent",
          boxShadow: isModified ? "0 0 12px rgba(236,72,153,0.4)" : "none",
        }}
        title="Click to edit"
      >
        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(0,0,0,0.35)", color: "#fff" }}>
          {hex.toUpperCase()}
        </span>
        <input
          ref={inputRef}
          type="color"
          value={hex}
          onChange={(e) => onUpdate(cssVar, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {isModified && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EC4899]" />
        )}
      </button>
      <div>
        <p className="text-xs font-mono text-[#9999BB] truncate">{label}</p>
        {description && (
          <p className="text-[10px] text-[#6B6B88] leading-tight mt-0.5 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD — shows fill + text variant + WCAG
   ───────────────────────────────────────────── */
function StatCard({ cssVar, fillHex }: { cssVar: string; fillHex: string }) {
  const textHex = STAT_TEXT_COLORS[cssVar] ?? fillHex;
  const label = STAT_LABELS[cssVar] ?? cssVar;
  const emoji = STAT_EMOJIS[cssVar] ?? "●";
  const contrast = contrastRatio(textHex, "#1C1C26");
  const passes = parseFloat(contrast) >= 4.5;

  return (
    <div className="rounded-xl border border-[#252533] overflow-hidden">
      {/* Filled cell demo */}
      <div className="h-14 flex items-center justify-center gap-2" style={{ background: fillHex + "28" }}>
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-semibold" style={{ color: textHex }}>{label}</span>
      </div>
      {/* Meta */}
      <div className="bg-[#13131A] px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#6B6B88]">text</span>
          <span className="text-[10px] font-mono text-[#9999BB]">{textHex}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-[#6B6B88]">fill</span>
          <span className="text-[10px] font-mono text-[#9999BB]">{fillHex.toUpperCase()}</span>
        </div>
        <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${passes ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
          {contrast}:1 {passes ? "AA✓" : "✗"}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION WRAPPER
   ───────────────────────────────────────────── */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-bold text-[#F0F0FF] mb-6 pb-3 border-b border-[#252533] flex items-center gap-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────
   EXPORT MODAL
   ───────────────────────────────────────────── */
function ExportModal({ overrides, onClose }: { overrides: Record<string, string>; onClose: () => void }) {
  const modifiedEntries = Object.entries(overrides).filter(([, v]) => v);
  const allTokens = [
    ...Object.values(COLOR_TOKENS).flatMap(g => Object.values(g.groups).flat()),
    ...RADIUS_TOKENS,
    ...SPACING_TOKENS.map(t => ({ var: t.var, default: t.default })),
    ...FONT_SIZE_TOKENS.map(t => ({ var: t.var, default: t.default })),
    ...FONT_WEIGHT_TOKENS.map(t => ({ var: t.var, default: t.default })),
    ...LEADING_TOKENS.map(t => ({ var: t.var, default: t.default })),
    ...FONT_FAMILY_TOKENS.map(t => ({ var: t.var, default: t.default })),
  ];

  const css = allTokens.map(t => {
    const val = overrides[t.var] ?? t.default;
    return `  ${t.var}: ${val};`;
  }).join("\n");

  const snippet = `@theme inline {\n${css}\n}`;
  const [copied, setCopied] = useState(false);

  function copy() {
    // navigator.clipboard requires permissions that may be blocked in iframes/previews.
    // Fall back to the legacy execCommand approach if needed.
    const tryClipboard = navigator.clipboard?.writeText(snippet).catch(() => {
      const el = document.createElement("textarea");
      el.value = snippet;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    if (!tryClipboard) {
      const el = document.createElement("textarea");
      el.value = snippet;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="bg-[#13131A] border border-[#252533] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252533]">
          <div>
            <h3 className="text-lg font-bold text-[#F0F0FF]">Export CSS Tokens</h3>
            {modifiedEntries.length > 0 && (
              <p className="text-xs text-[#EC4899] mt-0.5">{modifiedEntries.length} token{modifiedEntries.length !== 1 ? "s" : ""} modified</p>
            )}
          </div>
          <button onClick={onClose} className="text-[#6B6B88] hover:text-[#F0F0FF] text-xl">✕</button>
        </div>
        <pre className="flex-1 overflow-y-auto p-6 text-xs font-mono text-[#9999BB] leading-relaxed whitespace-pre-wrap">
          {snippet}
        </pre>
        <div className="px-6 py-4 border-t border-[#252533] flex gap-3">
          <button
            onClick={copy}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: copied ? "#22C55E" : "var(--gradient-cta-primary)" }}
          >
            {copied ? "✓ Copied!" : "Copy to clipboard"}
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#1C1C26] text-[#9999BB] border border-[#252533]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */
export default function DesignSystemPage() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [showExport, setShowExport] = useState(false);
  const [activeNav, setActiveNav] = useState("colors");

  // Load persisted overrides
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOverrides(JSON.parse(saved));
    } catch {}
  }, []);

  // Apply overrides to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(overrides).forEach(([cssVar, val]) => {
      if (val) root.style.setProperty(cssVar, val);
    });
  }, [overrides]);

  const handleUpdate = useCallback((cssVar: string, hex: string) => {
    setOverrides(prev => {
      const next = { ...prev, [cssVar]: hex };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      document.documentElement.style.setProperty(cssVar, hex);
      return next;
    });
  }, []);

  function resetAll() {
    const allVars = [
      ...Object.values(COLOR_TOKENS).flatMap(g => Object.values(g.groups).flat()).map(t => t.var),
      ...RADIUS_TOKENS.map(t => t.var),
      ...SPACING_TOKENS.map(t => t.var),
    ];
    const root = document.documentElement;
    allVars.forEach(v => root.style.removeProperty(v));
    setOverrides({});
    localStorage.removeItem(STORAGE_KEY);
  }

  const modifiedCount = Object.values(overrides).filter(Boolean).length;

  const NAV = [
    { id: "colors",     label: "Colors" },
    { id: "stats",      label: "Stats" },
    { id: "typography", label: "Type" },
    { id: "spacing",    label: "Spacing" },
    { id: "radius",     label: "Radius" },
    { id: "shadows",    label: "Shadows" },
    { id: "components", label: "Components" },
  ];

  return (
    <div className="min-h-dvh bg-[#06060A]">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-[#1C1C26]" style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍼</span>
            <div>
              <span className="text-sm font-bold text-[#F0F0FF]">Poops & Peeps</span>
              <span className="text-xs text-[#6B6B88] ml-2">Design System</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setActiveNav(n.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: activeNav === n.id ? "#F0F0FF" : "#6B6B88", background: activeNav === n.id ? "#252533" : "transparent" }}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {modifiedCount > 0 && (
              <button onClick={resetAll} className="text-xs text-[#9999BB] hover:text-[#F0F0FF] px-3 py-1.5 rounded-lg border border-[#252533] transition-colors">
                Reset ({modifiedCount})
              </button>
            )}
            <button
              onClick={() => setShowExport(true)}
              className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg"
              style={{ background: "var(--gradient-cta-primary)" }}
            >
              Export CSS
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-20">

        {/* ── Hero ── */}
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold text-[#F0F0FF] mb-3">Design Tokens</h1>
          <p className="text-[#9999BB] text-lg max-w-xl mx-auto">
            Click any swatch to edit it live. Changes apply instantly across the page and persist between sessions. Export the updated <code className="text-[#7C3AED] text-sm">@theme</code> block when you&apos;re done.
          </p>
        </div>

        {/* ── Colors ── */}
        <Section id="colors" title="Colors">
          {Object.entries(COLOR_TOKENS).filter(([k]) => k !== "stats").map(([groupKey, group]) => (
            <div key={groupKey} className="mb-10">
              <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">{group.label}</h3>
              {Object.entries(group.groups).map(([subLabel, tokens]) => (
                <div key={subLabel}>
                  {subLabel && <p className="text-xs text-[#6B6B88] mb-3">{subLabel}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tokens.map(t => (
                      <ColorSwatch
                        key={t.var}
                        cssVar={t.var}
                        defaultHex={t.default}
                        description={t.description}
                        overrides={overrides}
                        onUpdate={handleUpdate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* ── Stats ── */}
        <Section id="stats" title="Stat Colors">
          <p className="text-sm text-[#9999BB] mb-6">Each stat has a <strong className="text-[#F0F0FF]">fill color</strong> (backgrounds, borders) and a lighter <strong className="text-[#F0F0FF]">text color</strong> that meets WCAG AA on dark surfaces. The card below shows both with the live contrast ratio.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {COLOR_TOKENS.stats.groups["Fill (backgrounds, borders)"].map(t => (
              <StatCard key={t.var} cssVar={t.var} fillHex={overrides[t.var] ?? t.default} />
            ))}
          </div>

          {/* Stat color pickers */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mt-10 mb-4">Edit Fill Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {COLOR_TOKENS.stats.groups["Fill (backgrounds, borders)"].map(t => (
              <ColorSwatch
                key={t.var}
                cssVar={t.var}
                defaultHex={t.default}
                description={STAT_LABELS[t.var]}
                overrides={overrides}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {/* Poop palette */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mt-10 mb-4">Poop Palette</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COLOR_TOKENS.poop.groups[""].map(t => (
              <ColorSwatch
                key={t.var}
                cssVar={t.var}
                defaultHex={t.default}
                description={t.description}
                overrides={overrides}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section id="typography" title="Typography">
          <p className="text-sm text-[#9999BB] mb-6">Click any value to edit it live. Use <kbd className="bg-[#1C1C26] border border-[#252533] rounded px-1.5 py-0.5 text-xs font-mono">↑ ↓</kbd> arrow keys on numeric fields to nudge by 1.</p>

          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-3">ScreenTitleStack</h3>
          <p className="text-sm text-[#9999BB] mb-4 max-w-2xl">
            Login, forgot-password, and onboarding steps pair{" "}
            <span className="font-mono text-[#F0F0FF] text-xs">type-page-headline</span>{" "}
            with body copy inside{" "}
            <span className="font-mono text-[#F0F0FF] text-xs">ScreenTitleStack</span>{" "}
            so headline → subtitle spacing is always{" "}
            <span className="font-mono text-[#F0F0FF] text-xs">gap-2</span>.
          </p>
          <div className="bg-[#13131A] border border-[#252533] rounded-xl p-6 mb-10 max-w-md">
            <ScreenTitleStack className="text-left">
              <h1 className="type-page-headline">Example screen title</h1>
              <p className="text-text-secondary text-base">Supporting description in body default.</p>
            </ScreenTitleStack>
          </div>

          {/* Font families */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Families</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {FONT_FAMILY_TOKENS.map(f => {
              const family = overrides[f.var] ?? f.default;
              return (
                <div key={f.var} className="bg-[#13131A] border border-[#252533] rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#6B6B88]">{f.label}</span>
                    <span className="text-[10px] text-[#9999BB]">{f.usage}</span>
                  </div>
                  <p className="text-4xl text-[#F0F0FF] leading-tight" style={{ fontFamily: family, ...f.style }}>
                    AaBbCc 0123
                  </p>
                  <EditableToken
                    cssVar={f.var}
                    defaultVal={f.default}
                    type="text"
                    overrides={overrides}
                    onUpdate={handleUpdate}
                    className="text-xs w-full"
                  />
                </div>
              );
            })}
          </div>

          {/* Font size scale */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Size Scale</h3>
          <div className="rounded-xl border border-[#252533] overflow-hidden mb-12">
            {FONT_SIZE_TOKENS.map((f, i) => {
              const rem = overrides[f.var] ?? f.default;
              const px = Math.round(parseFloat(rem) * 16);
              return (
                <div
                  key={f.var}
                  className="flex items-center gap-4 px-4 py-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid #1C1C26" }}
                >
                  <span className="w-8 text-[10px] font-mono text-[#6B6B88] shrink-0">{f.label}</span>
                  <span className="flex-1 text-[#F0F0FF] leading-none" style={{ fontSize: rem }}>
                    The quick brown fox
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <EditableToken
                      cssVar={f.var}
                      defaultVal={f.default}
                      display={`${px}px`}
                      type="px"
                      overrides={overrides}
                      onUpdate={handleUpdate}
                      className="text-xs"
                    />
                    <span className="text-[10px] text-[#6B6B88] hidden md:block w-32 truncate">{f.usage}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Font weights */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Weights</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {FONT_WEIGHT_TOKENS.map(w => {
              const weight = overrides[w.var] ?? w.default;
              return (
                <div key={w.var} className="bg-[#13131A] border border-[#252533] rounded-xl p-4 flex flex-col gap-2">
                  <p className="text-2xl text-[#F0F0FF]" style={{ fontWeight: parseInt(weight) }}>Barlow</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6B88]">{w.label}</span>
                    <EditableToken
                      cssVar={w.var}
                      defaultVal={w.default}
                      type="number"
                      overrides={overrides}
                      onUpdate={handleUpdate}
                      className="text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Line heights */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Line Heights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEADING_TOKENS.map(l => {
              const leading = overrides[l.var] ?? l.default;
              return (
                <div key={l.var} className="bg-[#13131A] border border-[#252533] rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6B88]">{l.label}</span>
                    <EditableToken
                      cssVar={l.var}
                      defaultVal={l.default}
                      type="number"
                      overrides={overrides}
                      onUpdate={handleUpdate}
                      className="text-xs"
                    />
                  </div>
                  <p className="text-sm text-[#F0F0FF]" style={{ lineHeight: parseFloat(leading) }}>
                    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Spacing ── */}
        <Section id="spacing" title="Spacing — 8px Grid">
          <p className="text-sm text-[#9999BB] mb-6">All layout uses multiples of 8px. The 4px unit exists for hairline gaps only.</p>
          <div className="space-y-3">
            {SPACING_TOKENS.map(t => (
              <div key={t.var} className="flex items-center gap-4">
                <span className="w-20 text-xs font-mono text-[#6B6B88] shrink-0">{t.var.replace("--space-", "")}px</span>
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className="bg-[#7C3AED] rounded-sm shrink-0"
                    style={{ width: t.default, height: "24px", minWidth: "2px" }}
                  />
                  <span className="text-xs font-mono text-[#9999BB]">{t.default} / {t.px}px</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Border Radius ── */}
        <Section id="radius" title="Border Radius">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {RADIUS_TOKENS.map(t => (
              <div key={t.var} className="flex flex-col items-center gap-3">
                <div
                  className="w-16 h-16 bg-[#1C1C26] border-2 border-[#7C3AED]"
                  style={{ borderRadius: t.default }}
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#F0F0FF]">{t.label}</p>
                  <p className="text-xs font-mono text-[#9999BB]">{t.default}</p>
                  <p className="text-[10px] text-[#6B6B88]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Shadows ── */}
        <Section id="shadows" title="Shadows">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {SHADOW_TOKENS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-4 py-8 px-6 bg-[#0A0A0F] rounded-xl">
                <div
                  className="w-20 h-20 bg-[#1C1C26] rounded-xl"
                  style={{ boxShadow: s.value }}
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#F0F0FF]">{s.label}</p>
                  <p className="text-[10px] text-[#6B6B88] mt-1">{s.desc}</p>
                  <p className="text-[9px] font-mono text-[#6B6B88] mt-1">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Components ── */}
        <Section id="components" title="Component Kitchen Sink">

          {/* Buttons */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Buttons</h3>
          <div className="flex flex-wrap gap-3 mb-10">
            <button className="px-6 py-3 rounded-2xl font-semibold text-sm text-white"
              style={{ background: "var(--gradient-cta-primary)" }}>
              Primary CTA
            </button>
            <button className="px-6 py-3 rounded-2xl font-semibold text-sm bg-[#1C1C26] text-[#9999BB] border border-[#252533]">
              Secondary
            </button>
            <button className="px-6 py-3 rounded-2xl font-semibold text-sm text-white opacity-40 cursor-not-allowed"
              style={{ background: "var(--gradient-cta-primary)" }}>
              Disabled
            </button>
            <button className="px-6 py-3 rounded-full font-semibold text-sm text-white"
              style={{ background: "linear-gradient(135deg, var(--color-brand-teal), var(--color-brand-blue))" }}>
              Pill Teal
            </button>
          </div>

          {/* Stat cells */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Stat Cells (Day Grid)</h3>
          <div className="bg-[#13131A] border border-[#252533] rounded-xl p-4 mb-10">
            <div className="grid gap-1" style={{ gridTemplateColumns: "80px repeat(4, 1fr)" }}>
              <div className="text-[10px] font-mono text-[#6B6B88] py-2 px-2">Time</div>
              {["💧 Wet", "💩 Poop", "🍼 Feed", "😴 Sleep"].map(h => (
                <div key={h} className="text-[10px] font-semibold text-[#9999BB] py-2 px-2 text-center">{h}</div>
              ))}
              {/* Empty row */}
              <div className="text-[10px] font-mono text-[#6B6B88] py-3 px-2 border-t border-[#252533]">9:00 AM</div>
              <div className="border-t border-[#252533] m-0.5 rounded-sm" />
              <div className="border-t border-[#252533] m-0.5 rounded-sm" />
              <div className="border-t border-[#252533] m-0.5 rounded-sm" />
              <div className="border-t border-[#252533] m-0.5 rounded-sm" />
              {/* Filled row */}
              <div className="text-[10px] font-mono text-[#6B6B88] py-3 px-2 border-t border-[#252533]">9:15 AM</div>
              <div className="border-t border-[#252533] m-0.5 rounded-sm flex items-center justify-center" style={{ background: "#FBBF2440" }}>
                <span className="text-sm">💧</span>
              </div>
              <div className="border-t border-[#252533] m-0.5 rounded-sm flex items-center justify-center" style={{ background: "#92400E40" }}>
                <span className="text-sm">💩</span>
              </div>
              <div className="border-t border-[#252533] m-0.5 rounded-sm" />
              <div className="border-t border-[#252533] m-0.5 rounded-sm flex items-center justify-center" style={{ background: "#6366F140" }}>
                <span className="text-sm">😴</span>
              </div>
            </div>
          </div>

          {/* Cards */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">Cards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="card-gradient rounded-[var(--radius-card)] p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-xs text-[#9999BB] mb-1">Card default</p>
              <p className="text-2xl font-bold text-[#F0F0FF]">42</p>
              <p className="text-sm text-[#9999BB]">feedings today</p>
            </div>
            <div className="rounded-[var(--radius-card)] p-5 border border-[#7C3AED]/40"
              style={{ background: "linear-gradient(135deg, #7C3AED18, #EC489918)", boxShadow: "var(--shadow-glow-purple)" }}>
              <p className="text-xs text-[#9999BB] mb-1">Card glow purple</p>
              <p className="text-2xl font-bold text-[#F0F0FF]">8h 23m</p>
              <p className="text-sm text-[#9999BB]">total sleep</p>
            </div>
            <div className="rounded-[var(--radius-card)] p-5 border border-[#0D9488]/40"
              style={{ background: "linear-gradient(135deg, #0D948818, #3B82F618)", boxShadow: "var(--shadow-glow-teal)" }}>
              <p className="text-xs text-[#9999BB] mb-1">Card glow teal</p>
              <p className="text-2xl font-bold text-[#F0F0FF]">12 min</p>
              <p className="text-sm text-[#9999BB]">tummy time</p>
            </div>
          </div>

          {/* Display hero + gradient text */}
          <h3 className="text-sm font-semibold text-[#9999BB] uppercase tracking-widest mb-4">
            Display &amp; gradient text
          </h3>
          <div className="space-y-6">
            <p
              className="text-display-hero font-display italic text-[#F0F0FF] tracking-[var(--tracking-display-hero)] leading-none max-w-[22rem]"
              style={{ textWrap: "balance" }}
            >
              <span className="block">Poops </span>
              <span className="block">&amp; Peeps</span>
            </p>
            <div className="space-y-2">
              <p className="text-4xl font-bold gradient-text-purple-pink">Poops & Peeps</p>
              <p className="text-4xl font-bold gradient-text-teal-blue">Tummy Time</p>
            </div>
          </div>
        </Section>

      </main>

      {/* ── Export modal ── */}
      {showExport && (
        <ExportModal overrides={overrides} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
