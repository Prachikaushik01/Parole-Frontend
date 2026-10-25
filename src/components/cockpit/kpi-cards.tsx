"use client";

/**
 * Interactive Cockpit KPI row — four project-specified benchmark cards.
 *
 * Discoverability & interaction design:
 * - Each entire card is a single accessible <button> with a clear hover lift,
 *   emerald border highlight, and a "View details →" action cue.
 * - Clicking anywhere on a card (or its cue) opens a polished detail drawer
 *   with the metric's meaning, baseline comparison, visual breakdown (with
 *   tier symbols), and a shortcut to filter the Activity Stream.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CircleDollarSign,
  Crosshair,
  Filter,
  Gauge,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { TierIcon } from "@/components/ui/tier-icon";
import type { Tone } from "@/lib/types";
import {
  COST_COMPARISON,
  KPI_CARDS,
  SENSITIVE_TARGETS,
  TIER_DEFINITIONS,
} from "@/lib/constants";
import { useCockpit, type TierFilter } from "./cockpit-context";

const TONE_STYLES: Record<Tone, { text: string; bar: string; icon: string }> = {
  safe: { text: "text-safe", bar: "bg-safe", icon: "text-safe" },
  tier1: { text: "text-tier1", bar: "bg-tier1", icon: "text-tier1" },
  tier2: { text: "text-tier2", bar: "bg-tier2", icon: "text-tier2" },
  threat: { text: "text-threat", bar: "bg-threat", icon: "text-threat" },
};

const KPI_ICONS: Record<string, typeof Gauge> = {
  "injection-containment": ShieldCheck,
  "p95-latency": Gauge,
  cost: CircleDollarSign,
  "safe-auto-grant": Crosshair,
};

interface BreakdownRow {
  label: string;
  value: string;
  note: string;
  barPercent: number;
  barTone: "safe" | "tier1" | "tier2" | "threat" | "neutral";
  tierId?: number;
  isBoundary?: boolean;
}

interface KpiBreakdownMeta {
  title: string;
  specBadge: string;
  meaning: string;
  baselineContext: string;
  breakdownRows: readonly BreakdownRow[];
  streamFilterTarget: {
    filter: TierFilter;
    buttonLabel: string;
  };
}

const KPI_BREAKDOWNS: Record<string, KpiBreakdownMeta> = {
  "injection-containment": {
    title: "Injection Containment Breakdown",
    specBadge: "Project-specified · 1,000-trace benchmark",
    meaning:
      "Percentage of adversarial exfiltration commands stopped by the hard security boundary before reaching execution or model routing.",
    baselineContext:
      "150/150 adversarial exfiltration commands blocked across 1,000 traces (0.3ms spec boundary intercept).",
    breakdownRows: SENSITIVE_TARGETS.map((target) => ({
      label: target.pattern,
      value: `Blocked · ${target.category}`,
      note: target.description,
      barPercent: 100,
      barTone: "threat",
      isBoundary: true,
    })),
    streamFilterTarget: {
      filter: "hard-block",
      buttonLabel: "Filter Activity Stream to Blocked threats",
    },
  },
  "p95-latency": {
    title: "P95 Routing Latency Breakdown",
    specBadge: "Project-specified · vs 2100ms baseline",
    meaning:
      "95th-percentile decision latency across PAROLE's three-speed routing architecture. Because 84% of actions resolve in Tier 0 (<2ms), P95 remains at 1.8ms.",
    baselineContext:
      "1.8ms with PAROLE vs. 2100ms uncached model-evaluation baseline.",
    breakdownRows: TIER_DEFINITIONS.map((tier) => ({
      label: `Tier ${tier.id} · ${tier.name}`,
      value: `${tier.latencyLabel} (${tier.trafficSharePercent}% traffic)`,
      note: `${tier.engine} — ${tier.description}`,
      barPercent: tier.trafficSharePercent,
      barTone: tier.tone,
      tierId: tier.id,
    })),
    streamFilterTarget: {
      filter: 0,
      buttonLabel: "Filter Activity Stream to Tier 0 (<2ms) events",
    },
  },
  cost: {
    title: "Cost per 1,000 Actions Breakdown",
    specBadge: "Project-specified · ~91% reduction",
    meaning:
      "Total evaluation cost per 1,000 governed agent actions. Local Tier 0 cache hits (84%) cost $0 in model tokens, reserving cloud synthesis for 3% of actions.",
    baselineContext: `$${COST_COMPARISON.paroleUsdPer1k.toFixed(2)} per 1,000 actions with PAROLE vs. $${COST_COMPARISON.baselineUsdPer1k.toFixed(2)} baseline (${COST_COMPARISON.reductionLabel}).`,
    breakdownRows: [
      {
        label: "PAROLE Three-Speed Architecture",
        value: `$${COST_COMPARISON.paroleUsdPer1k.toFixed(2)} / 1k actions`,
        note: "84% Tier 0 local cache · 13% Tier 1 Nemotron Nano · 3% Tier 2 Nebius synthesis",
        barPercent: Math.round(
          (COST_COMPARISON.paroleUsdPer1k / COST_COMPARISON.baselineUsdPer1k) *
            100,
        ),
        barTone: "safe",
        tierId: 0,
      },
      {
        label: "Uncached Model Baseline",
        value: `$${COST_COMPARISON.baselineUsdPer1k.toFixed(2)} / 1k actions`,
        note: "Every command evaluated by a full model pass without local caching",
        barPercent: 100,
        barTone: "neutral",
      },
    ],
    streamFilterTarget: {
      filter: 2,
      buttonLabel: "Filter Activity Stream to Tier 2 escalated events",
    },
  },
  "safe-auto-grant": {
    title: "Safe Auto-Grant Accuracy Breakdown",
    specBadge: "Project-specified · <1.8% false positives",
    meaning:
      "Percentage of benign developer actions automatically permitted without interrupting the user with unnecessary approval prompts.",
    baselineContext:
      "98.2% safe auto-grant accuracy with false positives below 1.8%.",
    breakdownRows: [
      {
        label: "Safe Auto-Granted Actions",
        value: "98.2%",
        note: "Routine allowlisted (Tier 0) and clean risk-scored (Tier 1) commands permitted automatically",
        barPercent: 98.2,
        barTone: "safe",
        tierId: 0,
      },
      {
        label: "False-Positive Ceiling",
        value: "< 1.8%",
        note: "Upper bound on benign developer commands flagged for extra review",
        barPercent: 1.8,
        barTone: "tier2",
        tierId: 1,
      },
    ],
    streamFilterTarget: {
      filter: 1,
      buttonLabel: "Filter Activity Stream to Tier 1 risk-scored events",
    },
  },
};

const ROW_BAR_COLOR: Record<BreakdownRow["barTone"], string> = {
  safe: "bg-safe",
  tier1: "bg-tier1",
  tier2: "bg-tier2",
  threat: "bg-threat",
  neutral: "bg-ink-faint",
};

function CardMicroIndicator({ cardId }: { cardId: string }) {
  if (cardId === "injection-containment") {
    return (
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        <div className="flex items-center justify-between font-mono text-[10px] text-ink-faint">
          <span>150 / 150 blocked</span>
          <span className="text-safe">100% contained</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="h-1.5 rounded-sm bg-safe/85" />
          ))}
        </div>
      </div>
    );
  }

  if (cardId === "p95-latency") {
    return (
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        <div className="flex items-center justify-between font-mono text-[10px] text-ink-faint">
          <span className="text-safe">PAROLE 1.8ms</span>
          <span>2100ms baseline</span>
        </div>
        <div className="flex h-1.5 w-full items-center gap-1 overflow-hidden rounded-full bg-canvas p-px ring-1 ring-edge">
          <span className="h-full w-3 rounded-full bg-safe" />
          <span className="h-full flex-1 rounded-full bg-ink-faint/35" />
        </div>
      </div>
    );
  }

  if (cardId === "cost") {
    return (
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        <div className="flex items-center justify-between font-mono text-[10px] text-ink-faint">
          <span className="text-safe">$0.28 / 1k</span>
          <span>$3.80 baseline (−91%)</span>
        </div>
        <div className="flex h-1.5 w-full items-center gap-1 overflow-hidden rounded-full bg-canvas p-px ring-1 ring-edge">
          <span className="h-full w-[8%] min-w-2.5 rounded-full bg-safe" />
          <span className="h-full flex-1 rounded-full bg-ink-faint/35" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      <div className="flex items-center justify-between font-mono text-[10px] text-ink-faint">
        <span className="text-safe">98.2% auto-grant</span>
        <span>&lt;1.8% false pos.</span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-canvas p-px ring-1 ring-edge">
        <span className="h-full w-[98%] rounded-l-full bg-safe/85" />
        <span className="h-full w-[2%] rounded-r-full bg-tier2/80" />
      </div>
    </div>
  );
}

export function KpiCards() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { tierFilter, setTierFilter } = useCockpit();

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  const activeCard = KPI_CARDS.find((c) => c.id === selectedId) ?? null;
  const activeBreakdown = selectedId ? KPI_BREAKDOWNS[selectedId] : null;

  return (
    <section aria-label="Key benchmark metrics" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <span className="font-mono text-[11px] tracking-[0.14em] text-ink-dim uppercase">
          Benchmark Overview · <span className="text-safe">Click any card to inspect details</span>
        </span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
          Project-specified figures
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {KPI_CARDS.map((card) => {
          const tone = TONE_STYLES[card.tone];
          const Icon = KPI_ICONS[card.id] ?? Gauge;
          const isSelected = selectedId === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() =>
                setSelectedId((prev) => (prev === card.id ? null : card.id))
              }
              aria-expanded={isSelected}
              aria-controls="kpi-detail-drawer"
              className={[
                "group relative flex h-full min-w-0 cursor-pointer flex-col justify-between gap-3.5 overflow-hidden rounded-lg border p-4 text-left transition-all duration-200 sm:p-5",
                isSelected
                  ? "border-safe bg-raised/95 shadow-[0_0_0_1px_rgb(16_185_129/0.35),0_18px_42px_-24px_rgb(16_185_129/0.4)]"
                  : "border-edge bg-surface shadow-[inset_0_1px_0_rgb(255_255_255/0.03),0_16px_38px_-32px_rgb(0_0_0/0.85)] hover:-translate-y-0.5 hover:border-safe/60 hover:bg-raised/65 hover:shadow-[0_0_0_1px_rgb(16_185_129/0.2),0_18px_38px_-24px_rgb(16_185_129/0.35)]",
              ].join(" ")}
            >
              {/* Tone hairline across the card's top edge */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-0.5 ${tone.bar} transition-opacity ${
                  isSelected
                    ? "opacity-100"
                    : "opacity-65 group-hover:opacity-100"
                }`}
              />

              <div className="flex w-full flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] tracking-[0.14em] text-ink-dim uppercase">
                  <span className="truncate group-hover:text-ink">
                    {card.label}
                  </span>
                  <span
                    className={[
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isSelected
                        ? "border-safe/60 bg-safe/20"
                        : "border-edge bg-raised/80 group-hover:border-safe/50 group-hover:bg-safe/10",
                    ].join(" ")}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${tone.icon}`}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <span
                  className={`text-3xl leading-none font-semibold tracking-tight tabular-nums sm:text-[34px] ${tone.text}`}
                >
                  {card.value}
                </span>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-edge/70 pt-3">
                <CardMicroIndicator cardId={card.id} />

                <p className="line-clamp-2 font-mono text-[11px] leading-4 text-ink-dim">
                  {card.sublabel ?? card.comparison}
                </p>

                {/* Obvious interactive footer cue */}
                <div
                  className={[
                    "mt-auto flex items-center justify-between border-t pt-2.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
                    isSelected
                      ? "border-safe/30 text-safe"
                      : "border-edge/50 text-ink-faint group-hover:border-safe/30 group-hover:text-safe",
                  ].join(" ")}
                >
                  <span>
                    {isSelected ? "Showing details" : "View details"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span>{isSelected ? "Close" : "Inspect"}</span>
                    <ArrowRight
                      className={[
                        "h-3 w-3 transition-transform duration-200",
                        isSelected
                          ? "rotate-90 text-safe"
                          : "group-hover:translate-x-1 group-hover:text-safe",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expandable KPI Detail Drawer */}
      <AnimatePresence initial={false}>
        {activeCard && activeBreakdown ? (
          <motion.div
            id="kpi-detail-drawer"
            role="region"
            aria-label={activeBreakdown.title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden rounded-lg border border-safe/50 bg-surface shadow-[0_22px_55px_-28px_rgb(0_0_0/0.92)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge bg-raised/80 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded border border-safe/40 bg-safe/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-safe uppercase">
                  {activeCard.value}
                </span>
                <h2 className="font-mono text-xs font-semibold tracking-[0.15em] text-ink uppercase">
                  {activeBreakdown.title}
                </h2>
                <span className="rounded border border-edge bg-canvas/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
                  {activeBreakdown.specBadge}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close metric inspection drawer"
                className="press ring-neutral inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-edge bg-canvas px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase hover:border-edge-strong hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Close
              </button>
            </div>

            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-12">
              {/* Left Column: Explanation, Baseline, and Filter Action */}
              <div className="flex flex-col justify-between gap-4 lg:col-span-5">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                      What this metric measures
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ink-dim">
                      {activeBreakdown.meaning}
                    </p>
                  </div>

                  <div className="rounded-md border border-edge bg-canvas/70 p-3">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                      Baseline &amp; Specification Context
                    </p>
                    <p className="mt-1 font-mono text-xs leading-5 text-ink">
                      {activeBreakdown.baselineContext}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = activeBreakdown.streamFilterTarget.filter;
                    setTierFilter(tierFilter === target ? "all" : target);
                  }}
                  className={[
                    "press ring-emerald inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase",
                    tierFilter === activeBreakdown.streamFilterTarget.filter
                      ? "border-safe bg-safe/20 text-safe"
                      : "border-safe/40 bg-safe/10 text-safe hover:bg-safe/20",
                  ].join(" ")}
                >
                  <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                  {tierFilter === activeBreakdown.streamFilterTarget.filter
                    ? "Stream filter active · Click to show All"
                    : activeBreakdown.streamFilterTarget.buttonLabel}
                </button>
              </div>

              {/* Right Column: Visual Breakdown Rows with Tier Symbols */}
              <div className="flex flex-col gap-2.5 lg:col-span-7">
                <p className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                  Visual Breakdown
                </p>
                <div className="grid gap-2">
                  {activeBreakdown.breakdownRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col gap-2 rounded-md border border-edge bg-canvas/75 px-3.5 py-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {typeof row.tierId === "number" ? (
                            <TierIcon
                              tier={row.tierId}
                              className="h-4 w-4 shrink-0 text-safe"
                              aria-hidden="true"
                            />
                          ) : row.isBoundary ? (
                            <ShieldX
                              className="h-4 w-4 shrink-0 text-threat"
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="font-mono text-xs font-medium text-ink">
                            {row.label}
                          </span>
                        </div>
                        <span className="rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[11px] tabular-nums text-safe">
                          {row.value}
                        </span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className={`h-full rounded-full ${ROW_BAR_COLOR[row.barTone]}`}
                          style={{ width: `${Math.max(row.barPercent, 4)}%` }}
                        />
                      </div>

                      <p className="text-[11px] leading-4 text-ink-faint">
                        {row.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
