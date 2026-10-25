"use client";

/**
 * Section 3 — Interactive Quick Tests Sandbox.
 *
 * Educates developers on how PAROLE makes routing and boundary decisions:
 * - For each preset, displays test name, representative command, what the test
 *   demonstrates, selected tier or hard boundary, decision (allowed, escalated,
 *   or blocked), concise policy reason, security principle, and illustrative
 *   simulated latency.
 * - Clicking "Run test" or "Rerun test" provides immediate deterministic
 *   evaluation feedback, updates the result panel cleanly without timer leaks
 *   or race conditions, and emits a labeled demo event (`origin: "preset"`)
 *   into the shared telemetry store so `/cockpit` reflects the run.
 * - Never executes shell commands or network calls.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type {
  PresetResult,
  QuickTestPreset,
  RouteTarget,
  TelemetryEvent,
  Tone,
} from "@/lib/types";
import { QUICK_TEST_PRESETS, TIER_DEFINITIONS } from "@/lib/constants";
import { useTelemetry } from "@/lib/telemetry/store";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

interface RouteStyle {
  label: string;
  tone: Tone;
}

function routeStyle(route: RouteTarget): RouteStyle {
  if (route === "hard-block") {
    return { label: "Hard Security Boundary", tone: "threat" };
  }
  const tier = TIER_DEFINITIONS.find((t) => t.id === route);
  return {
    label: `Tier ${route} · ${tier?.name ?? ""}`.trim(),
    tone: tier?.tone ?? "safe",
  };
}

const TONE_DOT: Record<Tone, string> = {
  safe: "bg-safe",
  tier1: "bg-tier1",
  tier2: "bg-tier2",
  threat: "bg-threat",
};

const TONE_TEXT: Record<Tone, string> = {
  safe: "text-safe",
  tier1: "text-tier1",
  tier2: "text-tier2",
  threat: "text-threat",
};

const TONE_BADGE: Record<Tone, string> = {
  safe: "border-safe/35 bg-safe/10 text-safe",
  tier1: "border-tier1/35 bg-tier1/10 text-tier1",
  tier2: "border-tier2/35 bg-tier2/10 text-tier2",
  threat: "border-threat/40 bg-threat/10 text-threat",
};

interface SandboxTeachingMetadata {
  whatItDemonstrates: string;
  decisionCategory: "Allowed" | "Escalated · Risk Score" | "Escalated · Synthesis" | "Blocked";
  policyReason: string;
  securityPrinciple: string;
  simulatedLatencyMs: number;
}

const SANDBOX_METADATA: Record<string, SandboxTeachingMetadata> = {
  "git-status": {
    whatItDemonstrates:
      "How a read-only, everyday repository check bypasses model inference and human approval dialogs.",
    decisionCategory: "Allowed",
    policyReason:
      "Command matches the local PicoClaw deterministic allowlist (`git status`) with clean workspace provenance.",
    securityPrinciple:
      "Zero-prompt least privilege: known-safe read operations should execute in <2ms so developers are not trained to click 'Approve' out of habit.",
    simulatedLatencyMs: 1.6,
  },
  "pytest-tests": {
    whatItDemonstrates:
      "How routine local test execution is permitted automatically without granting blanket shell access.",
    decisionCategory: "Allowed",
    policyReason:
      "Scoped test runner (`pytest tests/`) is cached in the local allowlist and touches no prohibited paths or external hosts.",
    securityPrinciple:
      "Scoped capability caching: recurring developer workflows stay fast while keeping permissions restricted to the project test directory.",
    simulatedLatencyMs: 1.4,
  },
  "rg-todo": {
    whatItDemonstrates:
      "How an uncached local repository scan is evaluated by the fast Tier 1 risk scorer before execution.",
    decisionCategory: "Escalated · Risk Score",
    policyReason:
      "Command is not yet in the Tier 0 cache; Tier 1 (TypeSafe Jev) scores command structure and target scope (`src/`) as low-risk.",
    securityPrinciple:
      "Proportional verification: unfamiliar local commands receive a ~95–100ms automated risk check rather than interrupting the human operator.",
    simulatedLatencyMs: 97,
  },
  "curl-users": {
    whatItDemonstrates:
      "How a sensitive outbound request to a private RFC1918 subnet escalates to Tier 2 for deep policy synthesis.",
    decisionCategory: "Escalated · Synthesis",
    policyReason:
      "Network call targets internal subnet `10.0.4.12/api/v1/users`; escalated to Nebius Synthesis to draft a narrow, auditable policy rule.",
    securityPrinciple:
      "Context-aware escalation: high-consequence network or state-changing actions require deep policy synthesis instead of a binary 'Allow All' toggle.",
    simulatedLatencyMs: 2000,
  },
  "poisoned-readme": {
    whatItDemonstrates:
      "How a prompt-injected shell payload triggered after reading untrusted content is stopped before tier routing.",
    decisionCategory: "Blocked",
    policyReason:
      "Provenance tracker flagged `tainted:README.md` attempting remote command substitution (`$(curl -s ...)`). Stopped at the Hard Security Boundary.",
    securityPrinciple:
      "Pre-routing taint containment: untrusted data must never exercise shell execution privileges, regardless of model reasoning or user fatigue.",
    simulatedLatencyMs: 0.3,
  },
};

interface SandboxRunRecord extends PresetResult {
  runCount: number;
  simulatedLatencyMs: number;
}

let presetEventSeq = 0;

function buildDemoEvent(preset: QuickTestPreset): TelemetryEvent {
  const attack = preset.isAttack;
  const now = Date.now();
  const meta = SANDBOX_METADATA[preset.id];
  presetEventSeq += 1;
  return {
    id: `preset-${preset.id}-${now}-${presetEventSeq}`,
    timestamp: now,
    node: "quick-test-console",
    command: preset.command,
    provenance: attack ? "tainted:README.md" : "local:workspace",
    taint: attack ? "tainted" : "clean",
    route: preset.routeTarget,
    latencyMs: meta?.simulatedLatencyMs ?? 1.5,
    outcome: preset.expectedOutcome,
    detail: `${preset.description} (simulated quick-test — not live enforcement)`,
  };
}

export function QuickTestPresets() {
  const { pushEvent, events } = useTelemetry();
  const [results, setResults] = useState<Record<string, SandboxRunRecord>>({});
  const [evaluatingIds, setEvaluatingIds] = useState<Record<string, boolean>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const reduceMotion = useReducedMotion();

  // Clean up any pending evaluation timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of Object.keys(timers)) {
        clearTimeout(timers[id]);
      }
    };
  }, []);

  const executePreset = useCallback(
    (preset: QuickTestPreset) => {
      // Clear any existing timer for this preset to prevent race conditions or duplicate events
      if (timersRef.current[preset.id]) {
        clearTimeout(timersRef.current[preset.id]);
        delete timersRef.current[preset.id];
      }

      const meta = SANDBOX_METADATA[preset.id];
      const completeRun = () => {
        delete timersRef.current[preset.id];
        setEvaluatingIds((prev) => {
          if (!prev[preset.id]) return prev;
          const next = { ...prev };
          delete next[preset.id];
          return next;
        });
        pushEvent({ event: buildDemoEvent(preset), origin: "preset" });
        setResults((prev) => {
          const prevCount = prev[preset.id]?.runCount ?? 0;
          return {
            ...prev,
            [preset.id]: {
              presetId: preset.id,
              outcome: preset.expectedOutcome,
              routeTarget: preset.routeTarget,
              latencyLabel: preset.expectedLatencyLabel,
              detail: preset.description,
              simulated: true,
              runCount: prevCount + 1,
              simulatedLatencyMs: meta?.simulatedLatencyMs ?? 1.5,
            },
          };
        });
      };

      if (reduceMotion) {
        completeRun();
        return;
      }

      setEvaluatingIds((prev) => ({ ...prev, [preset.id]: true }));
      timersRef.current[preset.id] = setTimeout(completeRun, 220);
    },
    [pushEvent, reduceMotion],
  );

  const clearResults = useCallback(() => {
    for (const id of Object.keys(timersRef.current)) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setEvaluatingIds({});
    setResults({});
  }, []);

  const hasResults =
    Object.keys(results).length > 0 || Object.keys(evaluatingIds).length > 0;
  const sandboxCockpitCount = events.filter((e) => e.origin === "preset").length;

  return (
    <section
      id="quick-tests"
      aria-labelledby="quick-tests-title"
      className="relative border-b border-white/[0.06] scroll-mt-16"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            id="quick-tests-title"
            eyebrow="Interactive policy sandbox"
            title="Test a routing decision and inspect the policy reason"
            description="Run any preset command to see how PAROLE evaluates intent, selects a routing tier or boundary, and explains the governing security principle. Safe browser simulation—never executes shell commands."
          />

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {sandboxCockpitCount > 0 ? (
              <Link
                href="/cockpit"
                className="press inline-flex h-8 items-center gap-1.5 rounded-md border border-safe/35 bg-safe/10 px-3 font-mono text-xs text-safe transition-colors hover:bg-safe/15"
              >
                <span>
                  {sandboxCockpitCount} sandbox{" "}
                  {sandboxCockpitCount === 1 ? "event" : "events"} in Cockpit
                </span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ) : null}

            <button
              type="button"
              onClick={clearResults}
              disabled={!hasResults}
              className="press inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-ink-dim transition-colors hover:border-white/[0.15] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Clear results
            </button>
          </div>
        </div>

        <Reveal>
          <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-lg border border-white/[0.07] bg-[#0d0d10]">
            {QUICK_TEST_PRESETS.map((preset) => {
              const style = routeStyle(preset.routeTarget);
              const meta = SANDBOX_METADATA[preset.id];
              const result = results[preset.id];
              const isEvaluating = Boolean(evaluatingIds[preset.id]);
              const isActive = Boolean(result);

              return (
                <li key={preset.id} className="flex flex-col">
                  {/* Preset Summary & Action Row */}
                  <div
                    className={[
                      "flex w-full flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-6",
                      isActive ? "bg-white/[0.025]" : "hover:bg-white/[0.015]",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={[
                            "h-2 w-2 shrink-0 rounded-full transition-opacity",
                            TONE_DOT[style.tone],
                            isActive || isEvaluating ? "opacity-100" : "opacity-65",
                          ].join(" ")}
                        />
                        <span className="text-sm font-semibold text-ink">
                          {preset.label}
                        </span>
                        <span className="font-mono text-xs text-ink-faint">
                          · {style.label}
                        </span>
                        {meta ? (
                          <span
                            className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${TONE_BADGE[style.tone]}`}
                          >
                            {meta.decisionCategory}
                          </span>
                        ) : null}
                      </div>

                      <code className="truncate font-mono text-xs text-ink">
                        <span className="text-ink-faint select-none">$ </span>
                        {preset.command}
                      </code>

                      {meta ? (
                        <p className="text-xs leading-relaxed text-ink-dim">
                          <span className="font-medium text-ink">
                            Demonstrates:{" "}
                          </span>
                          {meta.whatItDemonstrates}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                      <div className="flex flex-col items-end font-mono text-[11px]">
                        <span className="text-ink-dim tabular-nums">
                          {preset.expectedLatencyLabel}
                        </span>
                        <span className="text-[10px] text-ink-faint">
                          Illustrative spec
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => executePreset(preset)}
                        disabled={isEvaluating}
                        aria-label={
                          isActive
                            ? `Rerun simulated test for ${preset.label}`
                            : `Run simulated test for ${preset.label}`
                        }
                        className={[
                          "press inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors disabled:cursor-wait",
                          isEvaluating
                            ? "border-white/[0.16] bg-white/[0.06] text-ink"
                            : isActive
                              ? "border-safe/40 bg-safe/15 text-safe hover:bg-safe/20"
                              : "border-white/[0.1] bg-white/[0.04] text-ink hover:border-white/[0.2] hover:bg-white/[0.08]",
                        ].join(" ")}
                      >
                        {isEvaluating ? (
                          <>
                            <LoaderCircle
                              className="h-3.5 w-3.5 animate-spin text-safe"
                              aria-hidden="true"
                            />
                            <span>Evaluating…</span>
                          </>
                        ) : isActive ? (
                          <>
                            <RefreshCw className="h-3 w-3" aria-hidden="true" />
                            <span>Rerun test</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" aria-hidden="true" />
                            <span>Run test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Result Panel */}
                  <AnimatePresence initial={false}>
                    {result && meta ? (
                      <motion.div
                        key={result.presetId}
                        role="region"
                        aria-label={`${preset.label} evaluation result`}
                        aria-live="polite"
                        initial={
                          reduceMotion ? false : { opacity: 0, height: 0 }
                        }
                        animate={{ opacity: 1, height: "auto" }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, height: 0 }
                        }
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-[#0a0a0c] px-5 py-4">
                          {/* Top decision summary bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-semibold ${TONE_BADGE[style.tone]}`}
                              >
                                {result.outcome === "blocked" ? (
                                  <ShieldAlert
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                ) : result.routeTarget === 0 ? (
                                  <CheckCircle2
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ShieldCheck
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                )}
                                {meta.decisionCategory}
                              </span>

                              <span
                                className={`font-mono font-medium ${TONE_TEXT[style.tone]}`}
                              >
                                {style.label}
                              </span>

                              <span className="font-mono text-ink-faint">
                                · Simulated latency: {result.simulatedLatencyMs}ms
                                (spec target: {result.latencyLabel})
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                              {result.runCount > 1 ? (
                                <span>Run #{result.runCount} ·</span>
                              ) : null}
                              <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-ink-dim">
                                Simulated demo · Sent to Cockpit
                              </span>
                            </div>
                          </div>

                          {/* Two-column teaching breakdown: Policy reason + Security principle */}
                          <div className="grid gap-3 pt-0.5 md:grid-cols-2">
                            <div className="rounded-md border border-white/[0.06] bg-[#0f0f13] p-3">
                              <p className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                                Why this decision was selected (Policy reason)
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                                {meta.policyReason}
                              </p>
                            </div>

                            <div className="rounded-md border border-white/[0.06] bg-[#0f0f13] p-3">
                              <p className="font-mono text-[10px] tracking-wider text-safe uppercase">
                                Developer security principle
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                                {meta.securityPrinciple}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
