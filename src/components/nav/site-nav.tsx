"use client";

/**
 * Sticky primary navigation shared across Home, Setup, and Cockpit.
 *
 * - Quiet Linear-inspired surface treatment: subtle bottom hairline,
 *   clean sans-serif route items without borders around every link,
 *   and a restrained telemetry status indicator.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ParoleLogo } from "@/components/ui/parole-logo";
import { TelemetryStatusBadge } from "@/components/cockpit/telemetry-status";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/setup", label: "Setup" },
  { href: "/cockpit", label: "Cockpit" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-canvas/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6"
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center rounded py-1 transition-opacity hover:opacity-90"
            aria-label="PAROLE home"
          >
            <ParoleLogo size="md" />
          </Link>

          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-white/[0.08] sm:inline-block"
          />

          <ul className="flex items-center gap-1">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "inline-flex h-8 items-center rounded-md px-3 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? "bg-white/[0.07] text-ink"
                        : "text-ink-dim hover:bg-white/[0.035] hover:text-ink",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <TelemetryStatusBadge />
        </div>
      </nav>
    </header>
  );
}
