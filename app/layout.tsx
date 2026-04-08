import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Barlow, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

/** Body + UI text — Barlow, multiple weights */
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
});

/** Headline / display — Instrument Serif (normal + italic) */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Monospace — time labels, numeric readouts */
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Poops and Peeps",
  description: "Track your newborn's feeds, diapers, sleep, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poops & Peeps",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0F",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialDemoAppNowIso = cookieStore.get("demo_app_now")?.value ?? null;

  return (
    <html
      lang="en"
      className={`dark ${barlow.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <body className="bg-[#0A0A0F] text-[#F0F0FF] antialiased min-h-dvh overflow-x-hidden">
        <Providers initialDemoAppNowIso={initialDemoAppNowIso}>
          <div
            className="relative mx-auto w-full min-h-dvh"
            style={{ maxWidth: "var(--layout-content-max-width)" }}
          >
            {children}
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
