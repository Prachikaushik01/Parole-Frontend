"use client";

/**
 * Troubleshooting FAQ for the PC Setup Guide (/setup).
 *
 * Kept out of the main setup flow in one collapsed section titled:
 * "Need help? Troubleshooting and common questions".
 * Individual answers are shown only when the user expands a question.
 */

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SETUP_COMMAND, SSE_ENDPOINT } from "@/lib/constants";

interface TroubleshootingItem {
  id: string;
  question: string;
  answer: string;
  actionTip?: string;
}

const TROUBLESHOOTING_ITEMS: readonly TroubleshootingItem[] = [
  {
    id: "where-to-paste",
    question: "Where do I paste the installation command?",
    answer:
      "Paste it inside your computer's terminal app (not inside a web browser). On Windows, open your WSL2 Linux terminal (such as Ubuntu). On macOS, open the Terminal app. On Linux, open your standard shell. Navigate (`cd`) into your project folder before pressing Enter.",
    actionTip: `Command: ${SETUP_COMMAND}`,
  },
  {
    id: "npx-not-recognized",
    question: "What if `npx` is not recognized?",
    answer:
      "`npx` comes included with Node.js and npm. If your terminal says `npx: command not found`, install Node.js inside that terminal environment (on Windows, make sure Node.js is installed inside WSL2, not only on Windows desktop).",
    actionTip: "Check with: node -v && npx -v",
  },
  {
    id: "installation-fails",
    question: "What if installation fails?",
    answer:
      "This repository contains the standalone PAROLE Next.js frontend. The command `npx @parole/governor init --agent=opencode --sandbox=nemoclaw` is the project's proposed specification command, and `@parole/governor` is not verified as published on npm from this repository. If `npx` returns a 404 error, you can still use the simulated demo above and the Governance Cockpit.",
  },
  {
    id: "does-copy-install",
    question: "Does copying the command install PAROLE?",
    answer:
      "No. Clicking Copy only places the command text on your clipboard. A web page cannot run terminal commands on your computer.",
  },
  {
    id: "how-to-know-running",
    question: "How do I know whether PAROLE is actually running?",
    answer:
      `This web app checks whether a local policy stream is reachable at ${SSE_ENDPOINT}. When connected, the status badge shows "LIVE SSE TELEMETRY". When no local backend is running, the app shows "SIMULATED DEMO DATA".`,
  },
  {
    id: "are-simulator-results-real",
    question: "Are the terminal simulator results real?",
    answer:
      "No. The simulator is a safe browser preview. It never executes shell commands, accesses local files, or proves that a local installation is running — all simulator outputs are predefined simulated examples.",
  },
] as const;

export function TroubleshootingFaq() {
  const [sectionOpen, setSectionOpen] = useState<boolean>(false);
  // All individual questions start collapsed by default
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="troubleshooting"
      aria-labelledby="troubleshooting-title"
      className="scroll-mt-20 overflow-hidden rounded-xl border border-edge bg-surface/80 shadow-[0_18px_44px_-32px_rgb(0_0_0/0.85)]"
    >
      <button
        type="button"
        onClick={() => setSectionOpen((prev) => !prev)}
        aria-expanded={sectionOpen}
        aria-controls="troubleshooting-body"
        className="press flex w-full items-center justify-between gap-3 p-5 text-left hover:bg-raised/40 sm:px-6"
      >
        <div className="flex items-center gap-2.5">
          <HelpCircle className="h-4 w-4 shrink-0 text-safe" aria-hidden="true" />
          <h2
            id="troubleshooting-title"
            className="text-base font-semibold tracking-[-0.01em] text-ink sm:text-lg"
          >
            Need help? Troubleshooting and common questions
          </h2>
        </div>

        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-dim">
          <span>{sectionOpen ? "Hide" : "Show"}</span>
          <ChevronDown
            className={[
              "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-150",
              sectionOpen ? "rotate-180 text-safe" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </span>
      </button>

      {sectionOpen ? (
        <div
          id="troubleshooting-body"
          className="border-t border-edge p-5 pt-4 sm:px-6"
        >
          <ul className="flex flex-col gap-2">
            {TROUBLESHOOTING_ITEMS.map((item) => {
              const isOpen = Boolean(openIds[item.id]);
              const panelId = `faq-panel-${item.id}`;
              return (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-edge bg-canvas/85"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="press flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-raised/40"
                  >
                    <span className="text-sm font-medium text-ink">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={[
                        "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-150",
                        isOpen ? "rotate-180 text-safe" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <div
                      id={panelId}
                      className="flex flex-col gap-2 border-t border-edge/70 bg-surface/50 px-4 py-3 text-xs leading-6 text-ink-dim"
                    >
                      <p>{item.answer}</p>
                      {item.actionTip ? (
                        <p className="rounded border border-edge bg-canvas px-2.5 py-1.5 font-mono text-[11px] leading-5 text-ink">
                          {item.actionTip}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
