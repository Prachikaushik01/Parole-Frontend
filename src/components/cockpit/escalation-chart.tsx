"use client";

/**
 * Interactive Escalation Curve — Recharts line chart.
 *
 * Discoverability & interaction design:
 * - Legend items look and behave like real toggle switches with visible ON/OFF
 *   state indicators.
 * - Hovering any point shows an immediate tooltip and highlights the point.
 * - Clicking a point on the chart (or a minute button) pins a vertical
 *   selected-time ReferenceLine + ReferenceDot and updates the detail panel
 *   below.
 */

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ESCALATION_CHART_DATA } from "@/lib/constants";

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

export function EscalationChart() {
  const [showParole, setShowParole] = useState(true);
  const [showBaseline, setShowBaseline] = useState(true);
  const [selectedMinute, setSelectedMinute] = useState<number>(20);

  const selectedPoint =
    ESCALATION_CHART_DATA.find((p) => p.minute === selectedMinute) ??
    ESCALATION_CHART_DATA[ESCALATION_CHART_DATA.length - 1];

  const bothHidden = !showParole && !showBaseline;
  const deltaPercent = Number(
    (selectedPoint.naiveSandbox - selectedPoint.parole).toFixed(1),
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
      {/* Legend Toggle Switches */}
      <div
        role="group"
        aria-label="Toggle escalation chart series"
        className="flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowParole((prev) => !prev)}
            aria-pressed={showParole}
            className={[
              "press inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase transition-all",
              showParole
                ? "border-safe/60 bg-safe/15 text-safe shadow-[0_0_0_1px_rgb(16_185_129/0.15)]"
                : "border-edge bg-canvas/80 text-ink-faint hover:border-edge-strong hover:text-ink-dim",
            ].join(" ")}
          >
            {/* Switch pill */}
            <span
              className={[
                "inline-flex h-3.5 w-6 items-center rounded-full p-0.5 transition-colors",
                showParole ? "justify-end bg-safe" : "justify-start bg-edge-strong",
              ].join(" ")}
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-canvas" />
            </span>
            <span>PAROLE</span>
            <span className="rounded bg-canvas/80 px-1 py-px text-[9px]">
              {showParole ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowBaseline((prev) => !prev)}
            aria-pressed={showBaseline}
            className={[
              "press inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase transition-all",
              showBaseline
                ? "border-edge-strong bg-raised text-ink"
                : "border-edge bg-canvas/80 text-ink-faint hover:border-edge-strong hover:text-ink-dim",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex h-3.5 w-6 items-center rounded-full p-0.5 transition-colors",
                showBaseline
                  ? "justify-end bg-ink-dim"
                  : "justify-start bg-edge-strong",
              ].join(" ")}
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-canvas" />
            </span>
            <span>Naive Baseline</span>
            <span className="rounded bg-canvas/80 px-1 py-px text-[9px]">
              {showBaseline ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
          Hover or click a point
        </span>
      </div>

      {/* Chart or Empty/Hidden-Series State */}
      {bothHidden ? (
        <div
          role="status"
          aria-live="polite"
          className="flex h-[200px] w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-edge bg-canvas/60 p-4 text-center"
        >
          <p className="font-mono text-xs text-ink-dim">
            Both chart series are toggled off.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowParole(true);
              setShowBaseline(true);
            }}
            className="press ring-emerald inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-safe/40 bg-safe/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-safe uppercase"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Show both series
          </button>
        </div>
      ) : (
        <div
          role="img"
          aria-label="Interactive line chart of the specified PAROLE escalation series from 100 percent at minute 0 to 3.8 percent at minute 20, against the naive-sandbox baseline declining from 100 percent to 95 percent."
          className="h-[200px] w-full min-w-0 cursor-crosshair"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...ESCALATION_CHART_DATA]}
              margin={{ top: 12, right: 14, bottom: 4, left: 0 }}
              onClick={(state) => {
                if (
                  state &&
                  typeof state.activeLabel !== "undefined" &&
                  state.activeLabel !== null
                ) {
                  const clickedMin = Number(state.activeLabel);
                  if (!Number.isNaN(clickedMin)) {
                    setSelectedMinute(clickedMin);
                  }
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
                dataKey="minute"
                tickFormatter={(value) => `${value}m`}
                tick={AXIS_TICK}
                axisLine={AXIS_LINE}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
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
                cursor={{ stroke: "#10b981", strokeOpacity: 0.45, strokeDasharray: "3 3" }}
                labelFormatter={(label) => `Minute ${label} (click to pin)`}
                formatter={(value, name) => [`${Number(value)}%`, name]}
              />

              {/* Selected time vertical indicator */}
              <ReferenceLine
                x={selectedPoint.minute}
                stroke="#10b981"
                strokeOpacity={0.45}
                strokeDasharray="3 3"
              />

              {showParole ? (
                <Line
                  type="monotone"
                  dataKey="parole"
                  name="PAROLE escalation"
                  stroke="#10b981"
                  strokeWidth={2.25}
                  dot={{
                    r: 3.5,
                    fill: "#10b981",
                    stroke: "#09090b",
                    strokeWidth: 1.5,
                    cursor: "pointer",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#10b981",
                    stroke: "#fafafa",
                    strokeWidth: 2,
                    cursor: "pointer",
                    onClick: (_e, payload) => {
                      const pt = (
                        payload as { payload?: { minute?: number } }
                      )?.payload;
                      if (pt && typeof pt.minute === "number") {
                        setSelectedMinute(pt.minute);
                      }
                    },
                  }}
                  isAnimationActive={false}
                />
              ) : null}

              {showBaseline ? (
                <Line
                  type="linear"
                  dataKey="naiveSandbox"
                  name="Naive sandbox baseline"
                  stroke="#a1a1aa"
                  strokeWidth={1.75}
                  strokeDasharray="5 4"
                  dot={{
                    r: 3,
                    fill: "#71717a",
                    stroke: "#09090b",
                    strokeWidth: 1,
                    cursor: "pointer",
                  }}
                  activeDot={{
                    r: 5.5,
                    fill: "#fafafa",
                    stroke: "#27272a",
                    strokeWidth: 2,
                    cursor: "pointer",
                  }}
                  isAnimationActive={false}
                />
              ) : null}

              {showParole && selectedPoint ? (
                <ReferenceDot
                  x={selectedPoint.minute}
                  y={selectedPoint.parole}
                  r={6}
                  fill="#10b981"
                  stroke="#fafafa"
                  strokeWidth={2}
                />
              ) : null}

              {showBaseline && selectedPoint ? (
                <ReferenceDot
                  x={selectedPoint.minute}
                  y={selectedPoint.naiveSandbox}
                  r={5}
                  fill="#a1a1aa"
                  stroke="#09090b"
                  strokeWidth={1.5}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Selected Timepoint Selector & Pinned Detail Panel */}
      <div className="flex flex-col gap-2.5 rounded-lg border border-edge bg-canvas/85 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase">
            Select time point:
          </span>
          <div
            role="group"
            aria-label="Select minute on escalation curve"
            className="flex flex-wrap items-center gap-1.5"
          >
            {ESCALATION_CHART_DATA.map((pt) => {
              const isSelected = pt.minute === selectedMinute;
              return (
                <button
                  key={pt.minute}
                  type="button"
                  onClick={() => setSelectedMinute(pt.minute)}
                  aria-pressed={isSelected}
                  className={[
                    "press cursor-pointer rounded border px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums transition-colors",
                    isSelected
                      ? "border-safe/60 bg-safe/20 text-safe"
                      : "border-edge bg-surface text-ink-dim hover:border-edge-strong hover:text-ink",
                  ].join(" ")}
                >
                  {pt.minute}m
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge/70 pt-2 font-mono text-[11px]">
          <span className="text-ink">
            Pinned at <strong className="text-safe">{selectedPoint.minute} min</strong>
          </span>
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="text-safe">
              PAROLE: <strong>{selectedPoint.parole}%</strong>
            </span>
            <span className="text-ink-dim">
              Baseline: <strong>{selectedPoint.naiveSandbox}%</strong>
            </span>
            <span className="rounded border border-safe/30 bg-safe/10 px-1.5 py-px text-[10px] text-safe">
              −{deltaPercent} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
