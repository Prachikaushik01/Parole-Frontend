import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/lib/telemetry/store";
import { SiteNav } from "@/components/nav/site-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAROLE — Autonomous Least-Privilege Governor for AI Agents",
  description:
    "PAROLE resolves routine agent actions in under 2ms, scores unfamiliar actions, and hard-blocks prohibited targets. Executive overview and Cybernetic Sentinel governance cockpit.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Mounted once at the root so both views share a single SSE
            subscription (no duplicate connections across navigation). */}
        <TelemetryProvider>
          <SiteNav />
          <main className="flex flex-1 flex-col">{children}</main>
        </TelemetryProvider>
      </body>
    </html>
  );
}
