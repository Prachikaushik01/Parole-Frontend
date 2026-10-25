"use client";

/**
 * Interactive Tier Routing panel — the spec's 84 / 13 / 3 distribution with
 * official PAROLE tier symbols (PicoClaw, TypeSafe Jev, Nebius Synthesis).
 *
 * Discoverability & interaction design:
 * - Clear prompt: "Select a tier to filter events".
 * - Both the 84% / 13% / 3% stacked bar segments and the tier rows are
 *   interactive buttons with distinct hover highlights and active filter chips.
 * - Includes all PAROLE tier symbols (<TierIcon tier={0|1|2} />) alongside
 *   T0 / T1 / T2 badges and documented latency ranges.
 * - Hovering or selecting a tier updates the live inspection card below.
 */

import { useState } from "react";
import { ArrowRight, Filter, RotateCcw } from "lucide-react";
import { TierIcon } from "@/components/ui/tier-icon";
import { TIER_DEFINITIONS, TIER_ROUTING } from "@/lib/constants";
import type { Tier, Tone } from "@/lib/types";
import { useCockpit } from "./cockpit-context";
import { CockpitPanel } from "./panel";

const TONE_STYLES: Record<
  Tone,
  {
    text: string;
    bar: string;
    border: string;
    activeBg: string;
    chip: string;
    ring: string;
    strokeHex: string;
  }
> = {
  safe: {
    text: "text-safe",
    bar: "bg-safe",
    border: "border-safe/65",
    activeBg: "bg-safe/15",
    chip: "border-safe/40 bg-safe/10 text-safe",
    ring: "ring-emerald",
    strokeHex: "#10b981",
  },
  tier1: {
    text: "text-tier1",
    bar: "bg-tier1",
    border: "border-tier1/65",
    activeBg: "bg-tier1/15",
    chip: "border-tier1/40 bg-tier1/10 text-tier1",
    ring: "ring-cyan",
    strokeHex: "#06b6d4",
  },
  tier2: {
    text: "text-tier2",
    bar: "bg-tier2",
    border: "border-tier2/65",
    activeBg: "bg-tier2/15",
    chip: "border-tier2/40 bg-tier2/10 text-tier2",
    ring: "ring-amber",
    strokeHex: "#f59e0b",
  },
  threat: {
    text: "text-threat",
    bar: "bg-threat",
    border: "border-threat/65",
    activeBg: "bg-threat/15",
    chip: "border-threat/40 bg-threat/10 text-threat",
    ring: "ring-red",
    strokeHex: "#ef4444",
  },
};

export function TierRouting() {
  const { tierFilter, setTierFilter } = useCockpit();
  const [hoveredTier, setHoveredTier] = useState<Tier | null>(null);

  const selectedTier: Tier | null =
    tierFilter === 0 || tierFilter === 1 || tierFilter === 2 ? tierFilter : null;

  const inspectedTierId: Tier = hoveredTier ?? selectedTier ?? 0;
  const inspectedDef =
    TIER_DEFINITIONS.find((t) => t.id === inspectedTierId) ??
    TIER_DEFINITIONS[0];
  const inspectedTone = TONE_STYLES[inspectedDef.tone];

  const handleToggleTier = (tier: Tier) => {
    setTierFilter(tierFilter === tier ? "all" : tier);
  };

  return (
    <CockpitPanel
      title="Tier Routing"
      eyebrow="84 / 13 / 3"
      className="h-full"
      meta={
        selectedTier !== null ? (
          <button
            type="button"
            onClick={() => setTierFilter("all")}
            className="press ring-emerald inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-safe/50 bg-safe/15 px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.12em] text-safe uppercase hover:bg-safe/25"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Clear filter (T{selectedTier})
          </button>
        ) : (
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            Select a tier to filter events
          </span>
        )
      }
    >
      {/* Interactive Stacked Distribution Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.12em] uppercase">
          <span className="text-ink-dim">
            {selectedTier !== null ? (
              <span className="inline-flex items-center gap-1.5 text-safe">
                <Filter className="h-3 w-3" aria-hidden="true" />
                Active filter: Tier {selectedTier} ·{" "}
                {TIER_DEFINITIONS.find((t) => t.id === selectedTier)?.name}
              </span>
            ) : (
              "Hover for details · Click any segment or row to filter"
            )}
          </span>
          <span className="text-ink-faint tabular-nums">84% / 13% / 3%</span>
        </div>

        <div
          role="group"
          aria-label="Interactive traffic distribution bar: 84% Tier 0, 13% Tier 1, 3% Tier 2"
          className="flex h-6 w-full gap-1 rounded-md bg-canvas p-1 ring-1 ring-edge"
        >
          {TIER_ROUTING.map((share) => {
            const def = TIER_DEFINITIONS.find((t) => t.id === share.tier);
            const tone = TONE_STYLES[share.tone];
            const isSelected = selectedTier === share.tier;
            const isHovered = hoveredTier === share.tier;
            const isDimmed = selectedTier !== null && !isSelected;

            return (
              <button
                key={share.tier}
                type="button"
                onClick={() => handleToggleTier(share.tier)}
                onMouseEnter={() => setHoveredTier(share.tier)}
                onMouseLeave={() => setHoveredTier(null)}
                onFocus={() => setHoveredTier(share.tier)}
                onBlur={() => setHoveredTier(null)}
                aria-pressed={isSelected}
                aria-label={`Filter Activity Stream by Tier ${share.tier} (${def?.name ?? ""}, ${share.percent}% traffic share, ${def?.latencyLabel ?? ""})`}
                title={`Tier ${share.tier} · ${def?.name}: ${share.percent}% (${def?.latencyLabel}) — Click to filter events`}
                style={{ width: `${Math.max(share.percent, 7)}%` }}
                className={[
                  "press relative flex h-full cursor-pointer items-center justify-center rounded-sm font-mono text-[9px] font-semibold tracking-wider text-canvas transition-all",
                  tone.bar,
                  isSelected
                    ? "opacity-100 ring-2 ring-white"
                    : isHovered
                      ? "opacity-100 ring-1 ring-white/70"
                      : isDimmed
                        ? "opacity-30 hover:opacity-80"
                        : "opacity-85 hover:opacity-100",
                ].join(" ")}
              >
                {share.percent >= 12 ? `T${share.tier} · ${share.percent}%` : `T${share.tier}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clickable Tier Rows with All Tier Symbols */}
      <div
        role="group"
        aria-label="Select a routing tier to filter Activity Stream"
        className="mt-4 flex flex-col gap-2.5"
      >
        {TIER_ROUTING.map((share) => {
          const def = TIER_DEFINITIONS.find((t) => t.id === share.tier);
          const tone = TONE_STYLES[share.tone];
          const isSelected = selectedTier === share.tier;
          const isHovered = hoveredTier === share.tier;

          return (
            <button
              key={share.tier}
              type="button"
              onClick={() => handleToggleTier(share.tier)}
              onMouseEnter={() => setHoveredTier(share.tier)}
              onMouseLeave={() => setHoveredTier(null)}
              onFocus={() => setHoveredTier(share.tier)}
              onBlur={() => setHoveredTier(null)}
              aria-pressed={isSelected}
              className={[
                `press ${tone.ring} group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-150`,
                isSelected
                  ? `${tone.border} ${tone.activeBg} shadow-[0_0_0_1px_rgb(255_255_255/0.06)]`
                  : isHovered
                    ? "border-edge-strong bg-raised/85"
                    : "border-edge bg-canvas/65 hover:border-edge-strong hover:bg-raised/70",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-3">
                {/* Tier badge + Official Tier Symbol */}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${tone.chip}`}
                >
                  <TierIcon
                    tier={share.tier}
                    stroke={share.tier === 0 ? tone.strokeHex : "currentColor"}
                    className={`h-4 w-4 ${tone.text}`}
                    aria-hidden="true"
                  />
                </span>

                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-px font-mono text-[10px] font-semibold tabular-nums ${tone.chip}`}
                    >
                      T{share.tier}
                    </span>
                    <span className="truncate font-mono text-xs font-semibold text-ink">
                      {def?.name}
                    </span>
                  </span>
                  <span className="truncate font-mono text-[10px] text-ink-faint">
                    {def?.engine}
                  </span>
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2.5">
                <span className="flex flex-col items-end">
                  <span
                    className={`font-mono text-sm font-semibold tabular-nums ${tone.text}`}
                  >
                    {share.percent}%
                  </span>
                  <span className="font-mono text-[10px] text-ink-dim tabular-nums">
                    {def?.latencyLabel}
                  </span>
                </span>

                <ArrowRight
                  className={[
                    "h-3.5 w-3.5 shrink-0 transition-transform",
                    isSelected
                      ? `${tone.text} translate-x-0.5`
                      : "text-ink-faint group-hover:translate-x-0.5 group-hover:text-ink",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Hover / Active Tier Details Card */}
      <div
        role="status"
        aria-live="polite"
        className={`mt-4 rounded-lg border p-3.5 transition-colors ${inspectedTone.border} bg-canvas/90`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TierIcon
              tier={inspectedDef.id}
              stroke={
                inspectedDef.id === 0 ? inspectedTone.strokeHex : "currentColor"
              }
              className={`h-4 w-4 shrink-0 ${inspectedTone.text}`}
              aria-hidden="true"
            />
            <span
              className={`font-mono text-xs font-semibold tracking-[0.12em] uppercase ${inspectedTone.text}`}
            >
              Tier {inspectedDef.id} · {inspectedDef.name}
            </span>
          </div>
          <span className="rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[10px] text-ink tabular-nums">
            Latency: {inspectedDef.latencyLabel} · {inspectedDef.trafficSharePercent}% share
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-ink-dim">
          {inspectedDef.description}
        </p>

        <div className="mt-2.5 flex items-center justify-between border-t border-edge/70 pt-2 font-mono text-[10px] text-ink-faint">
          <span>Spec shares · illustrative</span>
          {selectedTier !== null ? (
            <button
              type="button"
              onClick={() => setTierFilter("all")}
              className="cursor-pointer font-medium text-safe uppercase hover:underline"
            >
              Show all events
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleToggleTier(inspectedDef.id)}
              className={`cursor-pointer font-medium uppercase hover:underline ${inspectedTone.text}`}
            >
              Filter stream by Tier {inspectedDef.id} →
            </button>
          )}
        </div>
      </div>
    </CockpitPanel>
  );
}
