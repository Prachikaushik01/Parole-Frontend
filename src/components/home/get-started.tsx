/**
 * Section 4 — Clear 3-Step Conversion Path.
 *
 * Concise, action-oriented closing section at the end of the homepage:
 * 1. Try the interactive sandbox (#quick-tests)
 * 2. Read the setup guide (/setup)
 * 3. Open the Cockpit to inspect available events (/cockpit)
 */

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Play, Terminal } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function GetStarted() {
  return (
    <section aria-labelledby="get-started-title" className="relative">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-[#0d0d10]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-6 py-6 sm:px-8 md:flex-row md:items-center">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs text-safe">Next steps</p>
                <h2
                  id="get-started-title"
                  className="text-xl font-semibold tracking-[-0.025em] text-ink sm:text-2xl"
                >
                  Explore PAROLE from sandbox to live telemetry
                </h2>
              </div>

              <p className="max-w-md text-xs leading-relaxed text-ink-dim sm:text-sm">
                Follow the three-step progression below to test routing
                decisions, review local setup requirements, and inspect events
                in the Governance Cockpit.
              </p>
            </div>

            <ol className="grid divide-y divide-white/[0.06] md:grid-cols-3 md:divide-x md:divide-y-0">
              {/* Step 1: Try the interactive sandbox */}
              <li className="flex flex-col justify-between gap-4 p-6 sm:px-7">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-mono text-xs font-medium text-safe">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-safe/35 bg-safe/10 text-[11px]">
                        1
                      </span>
                      Step 1 · Sandbox
                    </span>
                    <Play
                      className="h-3.5 w-3.5 text-ink-faint"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">
                    Try the interactive sandbox
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-dim">
                    Run any preset command above to see its tier assignment,
                    policy reason, and security principle—and emit a labeled
                    demo event.
                  </p>
                </div>

                <a
                  href="#quick-tests"
                  className="press inline-flex h-8 items-center justify-between rounded-md border border-white/[0.09] bg-white/[0.03] px-3 text-xs font-medium text-ink transition-colors hover:border-white/[0.18] hover:bg-white/[0.06]"
                >
                  <span>Jump to Quick Tests</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>

              {/* Step 2: Read the setup guide */}
              <li className="flex flex-col justify-between gap-4 p-6 sm:px-7">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-mono text-xs font-medium text-tier1">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-tier1/35 bg-tier1/10 text-[11px]">
                        2
                      </span>
                      Step 2 · Setup &amp; Contract
                    </span>
                    <Terminal
                      className="h-3.5 w-3.5 text-ink-faint"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">
                    Read the setup guide
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-dim">
                    Review verified prerequisites, the SSE telemetry contract
                    at <code className="font-mono text-ink">localhost:8000</code>,
                    and a runnable end-to-end verification example.
                  </p>
                </div>

                <Link
                  href="/setup"
                  className="press inline-flex h-8 items-center justify-between rounded-md bg-safe px-3 text-xs font-medium text-canvas transition-colors hover:bg-safe/90"
                >
                  <span>Read the Setup Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>

              {/* Step 3: Open the Cockpit */}
              <li className="flex flex-col justify-between gap-4 p-6 sm:px-7">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-mono text-xs font-medium text-tier2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-tier2/35 bg-tier2/10 text-[11px]">
                        3
                      </span>
                      Step 3 · Observability
                    </span>
                    <LayoutDashboard
                      className="h-3.5 w-3.5 text-ink-faint"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">
                    Open the Cockpit to inspect events
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-dim">
                    Filter the live or simulated activity stream, inspect
                    boundary blocks, and review Nemotron policy synthesis
                    rules.
                  </p>
                </div>

                <Link
                  href="/cockpit"
                  className="press inline-flex h-8 items-center justify-between rounded-md border border-white/[0.09] bg-white/[0.03] px-3 text-xs font-medium text-ink transition-colors hover:border-white/[0.18] hover:bg-white/[0.06]"
                >
                  <span>Open Governance Cockpit</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
