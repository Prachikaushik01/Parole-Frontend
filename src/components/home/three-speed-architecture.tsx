/**
 * Section 2 — Three-Speed Security Architecture & Hard Security Boundary.
 *
 * Restrained, Linear-inspired specification layout:
 * - Three columns separated by 1px hairlines rather than separate floating
 *   colored cards.
 * - Restores the distinct visual symbols (`TierIcon`: PicoClaw emerald,
 *   TypeSafe Jev cyan, Nebius Synthesis amber) consistently aligned beside each
 *   tier heading, plus the red indicator on the Hard Security Boundary.
 * - Explicitly labeled as specification-based illustrative figures, not live
 *   measurements.
 */

import { ShieldX } from "lucide-react";
import { TierIcon } from "@/components/ui/tier-icon";
import type { Tone } from "@/lib/types";
import { SENSITIVE_TARGETS, TIER_DEFINITIONS } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

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
  threat: "border-threat/35 bg-threat/10 text-threat",
};

export function ThreeSpeedArchitecture() {
  return (
    <section
      id="three-speed"
      aria-labelledby="three-speed-title"
      className="relative border-b border-white/[0.06] scroll-mt-16"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <SectionHeading
            id="three-speed-title"
            eyebrow="Architecture"
            title="Match the decision speed to the risk"
            description="Routine commands resolve locally in milliseconds; unfamiliar actions receive risk scoring or deep policy synthesis."
          />

          <p className="shrink-0 font-mono text-xs text-ink-faint">
            Specification-based illustrative figures, not live measurements
          </p>
        </div>

        <Reveal>
          <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-[#0d0d10]">
            {/* Three-speed hairline grid */}
            <div className="grid divide-y divide-white/[0.06] md:grid-cols-3 md:divide-x md:divide-y-0">
              {TIER_DEFINITIONS.map((tier) => (
                <div
                  key={tier.id}
                  className="flex flex-col justify-between gap-6 p-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${TONE_BADGE[tier.tone]}`}
                        >
                          <TierIcon
                            tier={tier.id}
                            stroke={tier.id === 0 ? "#10b981" : undefined}
                            className={`h-4 w-4 shrink-0 ${TONE_TEXT[tier.tone]}`}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[tier.tone]}`}
                          />
                          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                            Tier {tier.id} — {tier.name}
                          </h3>
                        </span>
                      </span>
                      <span className="font-mono text-xs text-ink-faint">
                        {tier.engine}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-ink-dim">
                      {tier.description}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-4">
                    <div>
                      <dt className="text-xs text-ink-faint">Latency</dt>
                      <dd
                        className={`mt-0.5 font-mono text-base font-medium tabular-nums ${TONE_TEXT[tier.tone]}`}
                      >
                        {tier.latencyLabel}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-ink-faint">Spec share</dt>
                      <dd className="mt-0.5 font-mono text-base font-medium text-ink tabular-nums">
                        {tier.trafficSharePercent}%
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            {/* Hard Security Boundary — integrated pre-routing band */}
            <div className="flex flex-col gap-4 border-t border-white/[0.07] bg-[#0b0b0e] p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${TONE_BADGE.threat}`}
                  >
                    <ShieldX
                      className="h-4 w-4 shrink-0 text-threat"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-threat"
                  />
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    Hard Security Boundary
                  </h3>
                  <span className="font-mono text-xs text-threat">
                    · Blocked before tier routing
                  </span>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-ink-dim">
                  Prohibited targets and untrusted prompt-injection payloads are
                  stopped before reaching Tier 0, Tier 1, or Tier 2—no model is
                  consulted and no human prompt is shown.
                </p>
              </div>

              <ul
                aria-label="Examples of prohibited targets"
                className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end"
              >
                {SENSITIVE_TARGETS.map((target) => (
                  <li
                    key={target.id}
                    className="inline-flex items-center gap-1.5 rounded border border-white/[0.07] bg-[#121216] px-2.5 py-1 text-xs"
                  >
                    <code className="font-mono text-ink">{target.pattern}</code>
                    <span className="text-ink-faint">
                      · {target.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scope & Verification Matrix — distinguishes Spec Targets vs. Browser Sandbox vs. Live SSE Contract */}
            <div
              aria-label="Product scope and verification matrix"
              className="grid divide-y divide-white/[0.06] border-t border-white/[0.07] bg-[#09090c] text-xs md:grid-cols-3 md:divide-x md:divide-y-0"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                <span className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                  1 · Specification targets
                </span>
                <p className="leading-relaxed text-ink-dim">
                  The <span className="text-ink">84% / 13% / 3%</span> routing
                  split and <span className="text-ink">&lt;2ms / 95–100ms / 1.5–3s</span>{" "}
                  latencies represent architecture design targets, not live host
                  benchmarks.
                </p>
              </div>

              <div className="flex flex-col gap-1 px-6 py-4">
                <span className="font-mono text-[10px] tracking-wider text-tier2 uppercase">
                  2 · Simulated demo sandbox
                </span>
                <p className="leading-relaxed text-ink-dim">
                  Interactive presets on the Home and Setup pages evaluate
                  safely in your browser without executing shell commands, and
                  push labeled demo events to the Cockpit.
                </p>
              </div>

              <div className="flex flex-col gap-1 px-6 py-4">
                <span className="font-mono text-[10px] tracking-wider text-safe uppercase">
                  3 · Verified SSE telemetry contract
                </span>
                <p className="leading-relaxed text-ink-dim">
                  The Governance Cockpit connects to{" "}
                  <code className="font-mono text-[11px] text-ink">
                    localhost:8000/v1/policy/stream
                  </code>{" "}
                  when available and falls back to labeled simulated telemetry
                  when offline.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
