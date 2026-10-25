"use client";

/**
 * Interactive Security Alert panel — crimson "INJECTION: INTERCEPTED" surface
 * for the poisoned README scenario.
 *
 * Interactive capabilities:
 * - Clicking the alert card (or "Inspect Boundary Details") opens a detailed
 *   view showing the intercepted command, provenance, blocked decision,
 *   latency, and matching hard security boundary rules from SENSITIVE_TARGETS.
 * - Functional Dismiss / Restore control for the demo alert without deleting
 *   any underlying telemetry events.
 * - One-click shortcut to filter the Activity Stream to Blocked events.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { QUICK_TEST_PRESETS, SENSITIVE_TARGETS } from "@/lib/constants";
import { useCockpit } from "./cockpit-context";
import { CockpitPanel } from "./panel";

const POISON_PRESET =
  QUICK_TEST_PRESETS.find((p) => p.id === "poisoned-readme") ??
  QUICK_TEST_PRESETS[0];

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function matchBoundaryTarget(command: string, provenance: string) {
  if (command.includes("169.254.169.254")) {
    return SENSITIVE_TARGETS.find((t) => t.id === "metadata-endpoint");
  }
  if (command.includes(".ssh")) {
    return SENSITIVE_TARGETS.find((t) => t.id === "ssh-keys");
  }
  if (command.includes(".aws")) {
    return SENSITIVE_TARGETS.find((t) => t.id === "aws-credentials");
  }
  if (provenance.startsWith("tainted:") || command.includes("curl")) {
    return SENSITIVE_TARGETS.find((t) => t.id === "tainted-egress");
  }
  return SENSITIVE_TARGETS[0];
}

export function SecurityAlert() {
  const {
    events,
    alertDismissed,
    setAlertDismissed,
    alertDetailOpen,
    setAlertDetailOpen,
    tierFilter,
    setTierFilter,
    setSelectedEventId,
  } = useCockpit();

  const latestBlock = events.find((e) => e.route === "hard-block");

  const detail = latestBlock
    ? {
        id: latestBlock.id,
        command: latestBlock.command,
        provenance: latestBlock.provenance,
        decision: "BLOCKED · Hard security boundary (before Tier 0/1/2)",
        latencyLabel: `${latestBlock.latencyMs.toFixed(1)}ms (spec boundary target)`,
        node: latestBlock.node,
        time: formatTime(latestBlock.timestamp),
        explanation: latestBlock.detail,
        label: latestBlock.origin === "sse" ? "Live event" : "Simulated event",
      }
    : {
        id: null,
        command: POISON_PRESET.command,
        provenance: "tainted:README.md",
        decision: "BLOCKED · Hard security boundary (before Tier 0/1/2)",
        latencyLabel: `${POISON_PRESET.expectedLatencyLabel} (spec boundary target)`,
        node: "quick-test-console",
        time: "—",
        explanation: `${POISON_PRESET.description} Illustrative preview until an event arrives.`,
        label: "Illustrative preview",
      };

  const matchedBoundary = matchBoundaryTarget(detail.command, detail.provenance);

  if (alertDismissed) {
    return (
      <CockpitPanel
        title="Security Alert"
        eyebrow="Boundary"
        className="border-edge bg-surface/80"
        meta={
          <span className="rounded border border-edge bg-canvas px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            Alert dismissed (demo)
          </span>
        }
      >
        <div className="flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-edge bg-raised text-ink-faint">
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-medium tracking-[0.14em] text-ink uppercase">
                Alert dismissed (demo)
              </p>
              <p className="mt-1 text-xs leading-5 text-ink-dim">
                The simulated boundary alert is hidden from this card view.
                Source event data in the Activity Stream remains intact.
              </p>
              <code className="mt-2 block truncate rounded border border-edge bg-canvas/70 px-2.5 py-1.5 font-mono text-[11px] text-ink-faint">
                {detail.command}
              </code>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge pt-3">
            <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
              {detail.label} · preserved in stream
            </span>
            <button
              type="button"
              onClick={() => setAlertDismissed(false)}
              className="press ring-emerald inline-flex items-center gap-1.5 rounded-md border border-safe/40 bg-safe/10 px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-safe uppercase hover:bg-safe/20"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restore Alert
            </button>
          </div>
        </div>
      </CockpitPanel>
    );
  }

  return (
    <CockpitPanel
      title="Security Alert"
      eyebrow="Boundary"
      className="border-threat/45 bg-threat/[0.04] h-full"
      meta={
        <div className="flex items-center gap-2">
          <span className="rounded border border-threat/40 bg-threat/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-threat uppercase">
            {detail.label}
          </span>
          <button
            type="button"
            onClick={() => setAlertDismissed(true)}
            title="Dismiss demo alert (can be restored anytime)"
            className="press ring-neutral inline-flex items-center gap-1 rounded border border-edge bg-canvas/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase hover:text-ink"
          >
            <EyeOff className="h-3 w-3" aria-hidden="true" />
            Dismiss
          </button>
        </div>
      }
    >
      {/* Clickable Alert Header & Command Summary */}
      <button
        type="button"
        onClick={() => setAlertDetailOpen(!alertDetailOpen)}
        aria-expanded={alertDetailOpen}
        aria-controls="security-alert-detail"
        className="press ring-red group flex w-full cursor-pointer flex-col rounded-md border border-threat/30 bg-canvas/70 p-3.5 text-left transition-colors hover:border-threat/60 hover:bg-canvas"
      >
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-threat/50 bg-threat/15">
              <ShieldX className="h-4 w-4 text-threat" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-threat uppercase">
                Injection: Intercepted
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                Hard security boundary · before tier routing
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded border border-threat/35 bg-threat/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-threat uppercase">
            {alertDetailOpen ? (
              <>
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                Inspect alert
              </>
            )}
          </span>
        </div>

        <div className="mt-3 w-full rounded border border-threat/25 bg-surface/90 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
              Intercepted command
            </span>
            <span className="font-mono text-[10px] tabular-nums text-threat">
              {detail.latencyLabel}
            </span>
          </div>
          <code
            className="mt-1 block break-all font-mono text-[11px] leading-5 text-threat"
            title={detail.command}
          >
            {detail.command}
          </code>
        </div>
      </button>

      {/* Core Metadata */}
      <dl className="mt-3.5 grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-2 font-mono text-[11px] leading-5">
        <dt className="tracking-wider text-ink-faint uppercase">Provenance</dt>
        <dd className="min-w-0 break-words text-ink-dim">{detail.provenance}</dd>

        <dt className="tracking-wider text-ink-faint uppercase">Decision</dt>
        <dd className="font-medium text-threat">{detail.decision}</dd>

        <dt className="tracking-wider text-ink-faint uppercase">Boundary</dt>
        <dd className="text-ink">
          <span className="rounded border border-threat/35 bg-threat/10 px-1.5 py-0.5 text-[10px] text-threat">
            {matchedBoundary?.pattern ?? "tainted egress"}
          </span>
        </dd>

        <dt className="tracking-wider text-ink-faint uppercase">Node</dt>
        <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-ink-dim">
          <span className="truncate">{detail.node}</span>
          <span className="text-ink-faint tabular-nums">{detail.time}</span>
        </dd>
      </dl>

      {/* Expandable Boundary Inspection Drawer */}
      <AnimatePresence initial={false}>
        {alertDetailOpen ? (
          <motion.div
            id="security-alert-detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 flex flex-col gap-3 rounded-md border border-threat/30 bg-canvas/90 p-3.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-threat" aria-hidden="true" />
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-threat uppercase">
                  Boundary Inspection & Protected Targets
                </p>
              </div>
              <p className="text-xs leading-5 text-ink-dim">{detail.explanation}</p>

              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  Hard security boundary patterns (outside Tiers 0–2)
                </p>
                <div className="grid gap-1.5">
                  {SENSITIVE_TARGETS.map((target) => {
                    const isMatched = matchedBoundary?.id === target.id;
                    return (
                      <div
                        key={target.id}
                        className={[
                          "flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 font-mono text-[10px]",
                          isMatched
                            ? "border-threat/50 bg-threat/10 text-threat"
                            : "border-edge bg-surface/60 text-ink-faint",
                        ].join(" ")}
                      >
                        <span className="truncate">
                          {target.pattern} · {target.description}
                        </span>
                        {isMatched ? (
                          <span className="shrink-0 rounded border border-threat/40 bg-threat/15 px-1.5 py-0.5 text-[9px] uppercase">
                            Matched
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-threat/20 pt-3.5">
        <button
          type="button"
          onClick={() => setAlertDetailOpen(!alertDetailOpen)}
          className="press ring-neutral inline-flex items-center gap-1.5 rounded border border-edge bg-canvas/80 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-ink-dim uppercase hover:text-ink"
        >
          <Eye className="h-3 w-3 text-threat" aria-hidden="true" />
          {alertDetailOpen ? "Close detail view" : "Open detail view"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (tierFilter === "hard-block") {
              setTierFilter("all");
            } else {
              setTierFilter("hard-block");
              if (detail.id) {
                setSelectedEventId(detail.id);
              }
            }
          }}
          className={[
            "press ring-red inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase",
            tierFilter === "hard-block"
              ? "border-threat/60 bg-threat/20 text-threat"
              : "border-threat/35 bg-threat/10 text-threat hover:bg-threat/15",
          ].join(" ")}
        >
          <Filter className="h-3 w-3" aria-hidden="true" />
          {tierFilter === "hard-block"
            ? "Showing Blocked (Reset)"
            : "Filter Blocked in Stream"}
        </button>
      </div>
    </CockpitPanel>
  );
}
