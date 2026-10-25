"use client";

/**
 * Step 1 — Prepare your PC checklist & OS selector.
 *
 * Designed as a calm, beginner-friendly wizard step:
 * - OS selector: Windows, macOS, Linux.
 * - Three essential checklist items, collapsed by default until opened.
 * - Progress shown as "X of 3 reviewed" (manual user review, never fake auto-detection).
 * - Inline explanations for unfamiliar terms (WSL2, OpenCode) where they first appear.
 */

import { useState } from "react";
import {
  AppWindow,
  CheckSquare,
  ChevronDown,
  Command,
  Square,
  TerminalSquare,
} from "lucide-react";
import { CopyButton } from "@/components/home/copy-button";

export type PlatformId = "windows" | "macos" | "linux";

export interface PlatformGuide {
  id: PlatformId;
  label: string;
  badge: string;
  terminalSummary: string;
  terminalDetails: string;
  howToOpenTerminal: string;
  manualCheckCommand?: string;
  unconfirmedNote: string;
}

export const PLATFORM_GUIDES: readonly PlatformGuide[] = [
  {
    id: "windows",
    label: "Windows",
    badge: "WSL2",
    terminalSummary:
      "Use WSL2 (Windows Subsystem for Linux 2 — a built-in Windows feature that provides a Linux terminal).",
    terminalDetails:
      "PAROLE's sandbox is designed for a Linux environment. On Windows, open your WSL2 Ubuntu/Linux terminal rather than standard Command Prompt.",
    howToOpenTerminal:
      "Open WSL / Ubuntu from the Start Menu (or run `wsl` inside PowerShell).",
    manualCheckCommand: "wsl --status",
    unconfirmedNote:
      "If WSL2 is not installed, run `wsl --install` in an Administrator PowerShell window. Native Windows CMD/PowerShell without WSL2 is not documented.",
  },
  {
    id: "macos",
    label: "macOS",
    badge: "Terminal",
    terminalSummary: "Use your standard macOS Terminal app.",
    terminalDetails:
      "Open the built-in macOS Terminal (or iTerm2) where you normally run developer commands.",
    howToOpenTerminal:
      "Press Cmd + Space, type Terminal, and press Enter.",
    manualCheckCommand: "uname -sm",
    unconfirmedNote:
      "Platform-specific macOS sandbox details are not specified in the current project documentation.",
  },
  {
    id: "linux",
    label: "Linux",
    badge: "Standard Shell",
    terminalSummary: "Use your standard Linux terminal.",
    terminalDetails:
      "Open your regular Linux shell where your coding agent and project files live.",
    howToOpenTerminal:
      "Open your terminal app (Ctrl + Alt + T on most Linux desktops).",
    manualCheckCommand: "uname -r",
    unconfirmedNote:
      "Specific Linux distribution requirements are not listed in the current documentation.",
  },
] as const;

export function platformIcon(id: PlatformId, className: string) {
  switch (id) {
    case "windows":
      return <AppWindow className={className} aria-hidden="true" />;
    case "macos":
      return <Command className={className} aria-hidden="true" />;
    case "linux":
      return <TerminalSquare className={className} aria-hidden="true" />;
  }
}

interface ChecklistItem {
  id: string;
  title: string;
  summary: string;
  details: string;
  checkCommand?: string;
  extraNote?: string;
}

interface Step1PrepareProps {
  selectedPlatform: PlatformId;
  onSelectPlatform: (id: PlatformId) => void;
}

export function Step1PrepareContent({
  selectedPlatform,
  onSelectPlatform,
}: Step1PrepareProps) {
  const activeGuide =
    PLATFORM_GUIDES.find((p) => p.id === selectedPlatform) ?? PLATFORM_GUIDES[0];

  const [reviewedIds, setReviewedIds] = useState<Record<string, boolean>>({});
  // All checklist items start collapsed so the user only sees details when they ask
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({});

  const items: readonly ChecklistItem[] = [
    {
      id: "terminal-os",
      title: `1. Your terminal and operating system (${activeGuide.label})`,
      summary: activeGuide.terminalSummary,
      details: `${activeGuide.terminalDetails} How to open: ${activeGuide.howToOpenTerminal}`,
      checkCommand: activeGuide.manualCheckCommand,
      extraNote: activeGuide.unconfirmedNote,
    },
    {
      id: "node-npx",
      title: "2. Node.js and npm/npx",
      summary:
        "The setup command uses `npx`, which comes included with Node.js and npm.",
      details:
        selectedPlatform === "windows"
          ? "Run the command below inside your WSL2 Linux terminal to confirm Node.js and `npx` are available there (installing Node on Windows desktop does not automatically add it to WSL2)."
          : "Run the command below in your terminal to confirm both `node` and `npx` print version numbers.",
      checkCommand: "node -v && npx -v",
      extraNote:
        "Exact minimum Node.js version numbers are not specified in the project documentation.",
    },
    {
      id: "project-folder",
      title: "3. Your project folder",
      summary:
        "Open your terminal in the project folder where you use your coding agent (such as OpenCode, an AI assistant that runs terminal commands).",
      details:
        "Navigate into your project directory (for example `cd ~/your-project`) before running the install command in Step 2. If you only want to preview PAROLE today, you can skip straight to the simulated browser demo below.",
      checkCommand: "pwd",
    },
  ];

  const reviewedCount = items.filter((item) => Boolean(reviewedIds[item.id])).length;

  const toggleReviewed = (id: string) => {
    setReviewedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOpen = (id: string) => {
    setOpenItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Operating System Selector */}
      <div className="flex flex-col gap-3 rounded-lg border border-edge bg-canvas/85 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] tracking-[0.2em] text-safe uppercase">
            Environment
          </span>
          <span className="text-sm font-medium text-ink">
            Choose your operating system
          </span>
        </div>

        <div
          role="group"
          aria-label="Operating system selector"
          className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-edge bg-surface p-1"
        >
          {PLATFORM_GUIDES.map((platform) => {
            const active = platform.id === selectedPlatform;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onSelectPlatform(platform.id)}
                aria-pressed={active}
                className={[
                  "press inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs tracking-wider uppercase",
                  active
                    ? "border-safe/50 bg-safe/15 text-safe"
                    : "border-transparent text-ink-dim hover:border-edge hover:bg-raised/60 hover:text-ink",
                ].join(" ")}
              >
                {platformIcon(platform.id, "h-3.5 w-3.5")}
                <span>{platform.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact 3-Item Prerequisite Checklist */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-dim">
            Manual checklist — tick each item as you review it (your browser cannot
            inspect your PC).
          </p>
          <span
            role="status"
            aria-live="polite"
            className={[
              "rounded border px-2.5 py-0.5 font-mono text-[11px] tracking-wider uppercase",
              reviewedCount === items.length
                ? "border-safe/45 bg-safe/10 text-safe"
                : "border-edge bg-canvas text-ink-dim",
            ].join(" ")}
          >
            {reviewedCount} of {items.length} reviewed
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const isReviewed = Boolean(reviewedIds[item.id]);
            const isOpen = Boolean(openItemIds[item.id]);
            const panelId = `step1-item-${item.id}`;

            return (
              <li
                key={item.id}
                className={[
                  "overflow-hidden rounded-lg border transition-colors",
                  isReviewed
                    ? "border-safe/40 bg-safe/[0.03]"
                    : "border-edge bg-canvas/85",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3 p-3.5">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleReviewed(item.id)}
                      aria-pressed={isReviewed}
                      aria-label={`Mark "${item.title}" as reviewed`}
                      className="press mt-0.5 inline-flex shrink-0 items-center justify-center rounded text-safe focus-visible:outline-2"
                    >
                      {isReviewed ? (
                        <CheckSquare className="h-4 w-4 text-safe" aria-hidden="true" />
                      ) : (
                        <Square
                          className="h-4 w-4 text-ink-faint hover:text-ink"
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-ink sm:text-sm">
                        {item.title}
                      </span>
                      <p className="text-xs leading-5 text-ink-dim">{item.summary}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleOpen(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="press ring-neutral inline-flex shrink-0 items-center gap-1 rounded border border-edge bg-surface px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink-dim uppercase hover:border-edge-strong hover:text-ink"
                  >
                    <span>{isOpen ? "Hide" : "Details"}</span>
                    <ChevronDown
                      className={[
                        "h-3 w-3 transition-transform duration-150",
                        isOpen ? "rotate-180 text-safe" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {isOpen ? (
                  <div
                    id={panelId}
                    className="flex flex-col gap-2.5 border-t border-edge/70 bg-surface/60 px-4 py-3 text-xs leading-5 text-ink-dim"
                  >
                    <p>{item.details}</p>

                    {item.checkCommand ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-edge bg-canvas px-3 py-2">
                        <code className="font-mono text-xs text-ink">
                          <span className="text-safe select-none">$ </span>
                          {item.checkCommand}
                        </code>
                        <CopyButton
                          text={item.checkCommand}
                          label={`Copy command ${item.checkCommand}`}
                        />
                      </div>
                    ) : null}

                    {item.extraNote ? (
                      <p className="font-mono text-[11px] text-ink-faint">
                        Note: {item.extraNote}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
