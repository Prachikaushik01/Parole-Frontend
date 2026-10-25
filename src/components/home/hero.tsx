"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  RoutingVisual,
  SCENARIOS,
  type ScenarioKey,
} from "./routing-visual";

export type SelectedPhrase = "permission-fatigue" | "trap";

export function Hero() {
  const [displayedScenarioKey, setDisplayedScenarioKey] =
    useState<ScenarioKey>("routine");

  const isFatigueSelected = SCENARIOS[displayedScenarioKey].lens === "fatigue";
  const isTrapSelected = SCENARIOS[displayedScenarioKey].lens === "trap";

  const scenario = SCENARIOS[displayedScenarioKey];

  const handleScenarioChange = useCallback((key: ScenarioKey) => {
    setDisplayedScenarioKey(key);
  }, []);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-white/[0.06]"
    >
      {/* Whisper-quiet structural grid and top ambient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-home grid-fade opacity-35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 glow-field-home"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-12 xl:gap-16">
        {/* Left column — interactive editorial headline + contextual status + CTAs */}
        <div className="flex flex-col gap-5">
          <p className="inline-flex items-center gap-2 font-mono text-xs text-ink-dim">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-safe"
            />
            Autonomous least-privilege governor
          </p>

          <div className="flex flex-col gap-2.5">
            
<h1
  id="hero-title"
  className="hero-headline text-[clamp(2.15rem,3.6vw,3.1rem)] leading-[1.15] font-semibold tracking-[-0.045em] text-ink"
>
  <span className="hero-headline-intro">End the </span>
  <span
    className={`headline-phrase ${isFatigueSelected ? "headline-phrase-active" : ""}`}
    data-phrase="permission-fatigue"
  >
    Permission Fatigue
  </span>{" "}
  <span
    className={`headline-phrase ${isTrapSelected ? "headline-phrase-active" : ""}`}
    data-phrase="trap"
  >
    Trap
  </span>
  .
</h1>

          </div>

          <p className="max-w-[34rem] text-[15px] leading-relaxed text-ink-dim text-pretty">
            Repeated permission prompts train humans to{" "}
            <span className="font-medium text-ink">approve on reflex</span> or
            grant broad standing access just to keep an AI agent moving. PAROLE
            governs every command automatically—matching latency to risk and
            blocking prohibited targets before a human ever sees a prompt.
          </p>

          {/* Scenario Details Panel — updates with the active scenario */}
          <div
            role="region"
            aria-label="Selected scenario details"
            aria-live="polite"
            className="max-w-[34rem] rounded-md border bg-[#0d0d10] px-4 py-3.5 transition-colors duration-200"
            style={{
              borderColor: `rgb(${scenario.rgb} / 0.42)`,
            }}
          >
            <div className="flex flex-col gap-2.5">
              {/* Clear scenario heading */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: scenario.hex }}
                  />
                  <h2 className="text-sm font-semibold text-ink">
                    {isFatigueSelected
                      ? "Permission Fatigue — Repetitive approvals"
                      : "The Trap — Broad permissions & untrusted input"}
                  </h2>
                </div>
              </div>

              {/* Terminal command & synchronized PAROLE tier decision line */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-y border-white/[0.06] py-2 font-mono text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <code
                    className="truncate text-ink"
                    title={scenario.commandFull}
                  >
                    <span className="text-ink-faint select-none">$ </span>
                    {scenario.commandLabel}
                  </code>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className="font-semibold transition-colors duration-200"
                    style={{ color: scenario.hex }}
                  >
                    {scenario.decisionLabel}
                  </span>
                  <span className="text-ink-faint">
                    · {scenario.latencyLabel}
                  </span>
                </div>
              </div>

              {/* Explanation, Fatigue Consequence / Security Risk, and PAROLE Decision */}
              <div className="flex flex-col gap-1.5 text-xs leading-relaxed">
                <p className="text-ink-dim">
                  <span className="font-medium text-ink">Explanation: </span>
                  {scenario.withoutParole}
                </p>
                <p className="text-ink-dim">
                  <span className="font-medium text-ink">
                    {isFatigueSelected
                      ? "Fatigue consequence: "
                      : "Security risk: "}
                  </span>
                  {scenario.consequence}
                </p>
                <p className="text-ink-dim">
                  <span className="font-medium text-safe">
                    PAROLE decision:{" "}
                  </span>
                  {scenario.explanation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <Link
              href="/cockpit"
              className="press inline-flex h-9 items-center gap-2 rounded-md bg-safe px-4 text-[13px] font-medium text-canvas hover:bg-safe/90"
            >
              Open Governance Cockpit
            </Link>
            <Link
              href="/setup"
              className="press group inline-flex h-9 items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.03] px-4 text-[13px] font-medium text-ink transition-colors hover:border-white/[0.18] hover:bg-white/[0.06]"
            >
              PC Setup Guide
              <ArrowRight
                className="h-3.5 w-3.5 text-ink-dim transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Right column — purposeful technical workflow visualization */}
        <div className="min-w-0">
          <RoutingVisual onScenarioChange={handleScenarioChange} />
        </div>
      </div>
    </section>
  );
}
