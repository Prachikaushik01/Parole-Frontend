/**
 * PAROLE Role 2 — shared type definitions.
 *
 * These types describe the shape of every data structure used across the
 * Executive Home and the Cybernetic Sentinel Cockpit. They carry NO values of
 * their own — all benchmark figures and strings live in `constants.ts`.
 *
 * Scope note: this is a *frontend presentation* layer. Nothing here enforces
 * security; it only renders and labels data.
 */

/** The three routing tiers. `0` = local fast path, `2` = deep synthesis. */
export type Tier = 0 | 1 | 2;

/**
 * Where an action was resolved. Tiered actions flow through Tiers 0–2; a
 * `hard-block` never reaches a model and is stopped by the separate hard
 * security boundary (e.g. poisoned README exfiltration attempts).
 */
export type RouteTarget = Tier | "hard-block";

/** Visual tone, mapped to the PAROLE design-system colors. */
export type Tone = "safe" | "tier1" | "tier2" | "threat";

/** Verdict rendered for an action. */
export type Outcome = "granted" | "blocked";

/** Provenance / taint classification of a command's origin. */
export type TaintLevel = "clean" | "tainted" | "unknown";

/** Which chart the cockpit is currently displaying. */
export type ChartKind = "escalation" | "cost";

/** Telemetry data origin. `sse` = real backend stream; `simulated` = fallback. */
export type TelemetrySource = "sse" | "simulated";

/** Lifecycle of the Nemotron policy-diff approval flow. */
export type PolicyStatus = "pending" | "promoted";

/* -------------------------------------------------------------------------- */
/* Telemetry                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A single governance decision as shown in the cockpit's event stream.
 *
 * When `source` is `"simulated"`, the event is produced by the deterministic
 * fallback generator and must be labeled as simulated — never as live data.
 */
export interface TelemetryEvent {
  /** Stable unique id (used for React keys and detail-panel lookup). */
  id: string;
  /** Epoch milliseconds the decision was recorded. */
  timestamp: number;
  /** Node that requested the action, e.g. `opencode-01`. */
  node: string;
  /** The command the agent attempted to run. */
  command: string;
  /** Provenance / taint summary, e.g. `local:workspace` or `tainted:README.md`. */
  provenance: string;
  /** Taint classification driving the display chip. */
  taint: TaintLevel;
  /** Routing outcome: a tier, or `hard-block` for the security boundary. */
  route: RouteTarget;
  /** Decision latency in milliseconds. */
  latencyMs: number;
  /** Final verdict. */
  outcome: Outcome;
  /** Human-readable explanation shown in the clickable detail panel. */
  detail: string;
}

/* -------------------------------------------------------------------------- */
/* Tier definitions                                                           */
/* -------------------------------------------------------------------------- */

/** Static description of one routing tier. */
export interface TierDefinition {
  id: Tier;
  /** Short display name, e.g. `PicoClaw`. */
  name: string;
  /** Underlying engine, e.g. `Go local in-memory cache`. */
  engine: string;
  /** Display latency band, e.g. `under 2ms`. */
  latencyLabel: string;
  /** Approximate share of traffic, in whole percent (84 / 13 / 3). */
  trafficSharePercent: number;
  /** One-line description of when this tier handles an action. */
  description: string;
  /** Design-system tone used to color this tier's chips and chart slices. */
  tone: Tone;
}

/** A row in the tier-routing distribution visualization. */
export interface TierRoutingShare {
  tier: Tier;
  /** Approximate percentage of total traffic (84 / 13 / 3). */
  percent: number;
  tone: Tone;
}

/* -------------------------------------------------------------------------- */
/* KPI cards                                                                  */
/* -------------------------------------------------------------------------- */

/** One KPI card in the cockpit header row. */
export interface KpiCard {
  id: string;
  label: string;
  /** Primary figure, already formatted for display (e.g. `100%`, `1.8ms`). */
  value: string;
  /** Secondary supporting figure (e.g. `150/150 blocked`). */
  sublabel?: string;
  /** Baseline comparison text (e.g. `vs 2100ms baseline`). */
  comparison?: string;
  tone: Tone;
}

/* -------------------------------------------------------------------------- */
/* Charts                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One x-position on the escalation chart.
 *
 * `parole` values are the project-specified escalation series. `naiveSandbox`
 * is a *linear interpolation* between the two specified baseline endpoints
 * (100% at 0 min, 95% at 20 min) so the dashed line renders as described — it
 * is a drawing of that specified line, not an additional benchmark claim.
 */
export interface EscalationPoint {
  minute: number;
  /** PAROLE escalation rate at this minute (%). */
  parole: number;
  /** Naive-sandbox baseline rate at this minute (%). */
  naiveSandbox: number;
}

/** Cost-comparison figures backing the alternate chart view. */
export interface CostComparison {
  /** PAROLE cost per 1000 actions, in USD. */
  paroleUsdPer1k: number;
  /** Baseline cost per 1000 actions, in USD. */
  baselineUsdPer1k: number;
  /** Display string for the reduction, e.g. `approximately 91% lower`. */
  reductionLabel: string;
}

/* -------------------------------------------------------------------------- */
/* Quick-test presets                                                         */
/* -------------------------------------------------------------------------- */

/** An interactive quick-test button shown on the Executive Home. */
export interface QuickTestPreset {
  id: string;
  /** Human label on the button, e.g. `git status`. */
  label: string;
  /** The exact command executed by the preset. */
  command: string;
  /** Where the action resolves: a tier, or `hard-block` for the boundary. */
  routeTarget: RouteTarget;
  /** Expected verdict. */
  expectedOutcome: Outcome;
  /** Expected latency, formatted (e.g. `under 2ms`, `1.5–3s`, `0.3ms`). */
  expectedLatencyLabel: string;
  /** Explanation of what this preset demonstrates. */
  description: string;
  /** True for the simulated poisoned-README attack preset. */
  isAttack: boolean;
}

/** Result of running a single preset, rendered inline on the Home view. */
export interface PresetResult {
  presetId: string;
  outcome: Outcome;
  routeTarget: RouteTarget;
  latencyLabel: string;
  /** Explanation shown beneath the result. */
  detail: string;
  /** Always true for preset output — preset results are simulated demo data. */
  simulated: true;
}

/* -------------------------------------------------------------------------- */
/* Sensitive targets (hard security boundary)                                 */
/* -------------------------------------------------------------------------- */

/** A target category stopped by the hard security boundary, outside the tiers. */
export interface SensitiveTarget {
  id: string;
  /** The protected pattern, e.g. `169.254.169.254` or `~/.ssh/*`. */
  pattern: string;
  /** Why it is protected. */
  description: string;
  category: "metadata" | "credentials" | "egress";
}

/* -------------------------------------------------------------------------- */
/* Policy diff & approval                                                     */
/* -------------------------------------------------------------------------- */

/** The Nemotron policy-diff studio proposal (before approval). */
export interface PolicyDiff {
  /** The broad rule being removed (rendered as a `-` line). */
  removed: string;
  /** The least-privilege rule being added (rendered as a `+` line). */
  added: string;
  /** Message shown after a successful promotion. */
  promotedMessage: string;
  /** Cache lookup latency claimed on promotion, in ms (spec: 0.9). */
  cacheLatencyMs: number;
}

/** A rule present in the active PicoClaw cache strip. */
export interface CacheRule {
  id: string;
  /** The rule text, e.g. `PERMIT 10.0.4.0/24 ON /api/v1/*`. */
  rule: string;
  /** Epoch milliseconds the rule was promoted. */
  addedAt: number;
}
