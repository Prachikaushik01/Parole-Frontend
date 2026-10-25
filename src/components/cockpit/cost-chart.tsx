"use client";

/**
 * Interactive Cost Comparison — Recharts bar chart.
 *
 * Discoverability & interaction design:
 * - Hovering any bar shows an immediate tooltip and highlights the bar.
 * - Clicking a bar (or using the interactive selector pills) pins its cost
 *   breakdown card below while preserving the $0.28 vs. $3.80 project-specified
 *   comparison.
 */

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COST_COMPARISON } from "@/lib/constants";

const MONO_FONT = "var(--font-geist-mono), ui-monospace, monospace";

const AXIS_TICK = { fill: "#71717a", fontSize: 10, fontFamily: MONO_FONT };
const AXIS_LINE = { stroke: "#27272a" };

const TOOLTIP_STYLE = {
  backgroundColor: "#121215",
  border: "1px solid #3f3f46",
  borderRadius: 6,
  fontFamily: MONO_FONT,
  fontSize: 11,
  padding: "8px 10px",
};

type CostBarId = "PAROLE" | "Baseline";

interface CostBarDatum {
  name: CostBarId;
  cost: number;
  unit: string;
  comparison: string;
  breakdown: string;
}

const COST_DATA: readonly CostBarDatum[] = [
  {
    name: "PAROLE",
    cost: COST_COMPARISON.paroleUsdPer1k,
    unit: "per 1,000 actions",
    comparison: `vs $${COST_COMPARISON.baselineUsdPer1k.toFixed(2)} baseline (${COST_COMPARISON.reductionLabel})`,
    breakdown:
      "84% of actions resolve locally in Tier 0 PicoClaw (<2ms, $0 token cost), 13% use Tier 1 Nemotron Nano scoring, and 3% use Tier 2 Nebius synthesis.",
  },
  {
    name: "Baseline",
    cost: COST_COMPARISON.baselineUsdPer1k,
    unit: "per 1,000 actions",
    comparison: `vs $${COST_COMPARISON.paroleUsdPer1k.toFixed(2)} PAROLE (${COST_COMPARISON.reductionLabel} with PAROLE)`,
    breakdown:
      "Uncached baseline where routine and novel actions alike require full model evaluation without Tier 0 local cache offloading.",
  },
] as const;

export function CostChart() {
  const [selectedBar, setSelectedBar] = useState<CostBarId>("PAROLE");
  const [hoveredBar, setHoveredBar] = useState<CostBarId | null>(null);

  const activeDatum =
    COST_DATA.find((d) => d.name === selectedBar) ?? COST_DATA[0];

  return (
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
      {/* Interactive Bar Toggle Controls */}
      <div
        role="group"
        aria-label="Inspect cost comparison breakdown by bar"
        className="flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          {COST_DATA.map((entry) => {
            const isSelected = selectedBar === entry.name;
            const isParole = entry.name === "PAROLE";
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => setSelectedBar(entry.name)}
                aria-pressed={isSelected}
                className={[
                  "press inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase transition-all",
                  isSelected
                    ? isParole
                      ? "border-safe/60 bg-safe/15 text-safe shadow-[0_0_0_1px_rgb(16_185_129/0.15)]"
                      : "border-edge-strong bg-raised text-ink"
                    : "border-edge bg-canvas/80 text-ink-faint hover:border-edge-strong hover:text-ink-dim",
                ].join(" ")}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-sm ${
                    isParole ? "bg-safe" : "bg-ink-dim"
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {entry.name} (${entry.cost.toFixed(2)})
                </span>
              </button>
            );
          })}
        </div>

        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
          Click a bar to inspect
        </span>
      </div>

      {/* Interactive Recharts Bar Chart */}
      <div
        role="img"
        aria-label={`Interactive bar chart comparing cost per 1,000 actions: PAROLE at $${COST_COMPARISON.paroleUsdPer1k.toFixed(2)} against the baseline at $${COST_COMPARISON.baselineUsdPer1k.toFixed(2)}.`}
        className="h-[200px] w-full min-w-0 cursor-pointer"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[...COST_DATA]}
            margin={{ top: 24, right: 12, bottom: 4, left: 0 }}
            onClick={(state) => {
              if (
                state &&
                (state.activeLabel === "PAROLE" ||
                  state.activeLabel === "Baseline")
              ) {
                setSelectedBar(state.activeLabel);
              }
            }}
            accessibilityLayer
          >
            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={AXIS_TICK}
              axisLine={AXIS_LINE}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              tickFormatter={(value) => `$${value}`}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              isAnimationActive={false}
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#fafafa", marginBottom: 4 }}
              itemStyle={{ color: "#10b981" }}
              cursor={{ fill: "rgb(255 255 255 / 0.05)" }}
              formatter={(value, _name, item) => {
                const payload = item?.payload as CostBarDatum | undefined;
                return [
                  `$${Number(value).toFixed(2)} ${payload?.unit ?? "per 1,000 actions"}`,
                  payload?.comparison ?? "Cost",
                ];
              }}
            />
            <Bar
              dataKey="cost"
              name="Cost per 1,000 actions"
              maxBarSize={80}
              radius={[5, 5, 0, 0]}
              isAnimationActive={false}
              onClick={(data) => {
                const name = (data as unknown as { name?: CostBarId })?.name;
                if (name === "PAROLE" || name === "Baseline") {
                  setSelectedBar(name);
                }
              }}
              onMouseEnter={(data) => {
                const name = (data as unknown as { name?: CostBarId })?.name;
                if (name === "PAROLE" || name === "Baseline") {
                  setHoveredBar(name);
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {COST_DATA.map((entry) => {
                const isSelected = selectedBar === entry.name;
                const isHovered = hoveredBar === entry.name;
                const fill =
                  entry.name === "PAROLE"
                    ? isSelected || isHovered
                      ? "#10b981"
                      : "rgb(16 185 129 / 0.72)"
                    : isSelected || isHovered
                      ? "#a1a1aa"
                      : "#71717a";
                return (
                  <Cell
                    key={entry.name}
                    fill={fill}
                    stroke={isSelected ? "#fafafa" : isHovered ? "#10b981" : "transparent"}
                    strokeWidth={isSelected || isHovered ? 1.5 : 0}
                    className="cursor-pointer transition-opacity"
                  />
                );
              })}
              <LabelList
                dataKey="cost"
                position="top"
                offset={6}
                formatter={(value) => `$${Number(value).toFixed(2)}`}
                fill="#fafafa"
                fontSize={10}
                fontFamily={MONO_FONT}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Bar Cost Breakdown Card */}
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-1.5 rounded-lg border border-edge bg-canvas/85 p-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <span
            className={
              activeDatum.name === "PAROLE"
                ? "font-semibold text-safe"
                : "font-semibold text-ink"
            }
          >
            Selected: {activeDatum.name} (${activeDatum.cost.toFixed(2)} {activeDatum.unit})
          </span>
          <span className="rounded border border-safe/30 bg-safe/10 px-1.5 py-px text-[10px] text-safe">
            {COST_COMPARISON.reductionLabel}
          </span>
        </div>
        <p className="text-xs leading-5 text-ink-dim">
          {activeDatum.breakdown}
        </p>
      </div>
    </div>
  );
}
