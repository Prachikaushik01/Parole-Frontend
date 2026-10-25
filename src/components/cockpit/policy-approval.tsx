"use client";

/**
 * Interactive Policy Approval area — the Nemotron policy-diff proposal and its
 * reversible demo approval workflow.
 *
 * Interactive lifecycle (shared with ActivityStream via CockpitContext):
 * 1. "pending": Shows the proposed rule diff and "Approve & Hot-Reload" CTA.
 * 2. "confirming": Shows an explicit confirmation dialog before applying the
 *    demo promotion.
 * 3. "promoted": Displays `Promoted to PicoClaw Cache (0.9ms)`, adds the
 *    least-privilege rule to the active PicoClaw cache strip with the PicoClaw
 *    symbol, injects a corresponding simulated event into the Activity Stream,
 *    and offers a reversible "Undo / Reset Demo Approval" control.
 */

import {
  AlertCircle,
  Check,
  ExternalLink,
  FileDiff,
  RotateCcw,
} from "lucide-react";
import { TierIcon } from "@/components/ui/tier-icon";
import { POLICY_DIFF } from "@/lib/constants";
import { useCockpit } from "./cockpit-context";
import { CockpitPanel } from "./panel";

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function PolicyApproval() {
  const {
    policyState,
    requestPolicyConfirmation,
    cancelPolicyConfirmation,
    confirmPolicyApproval,
    resetPolicyApproval,
    cacheRules,
    promotedEventId,
    setSelectedEventId,
    setTierFilter,
  } = useCockpit();

  const approved = policyState === "promoted";
  const confirming = policyState === "confirming";

  return (
    <CockpitPanel
      title="Policy Approval"
      eyebrow="Nemotron"
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <span
            role="status"
            aria-live="polite"
            className={[
              "rounded border px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.14em] uppercase",
              approved
                ? "border-safe/40 bg-safe/15 text-safe"
                : confirming
                  ? "border-tier1/50 bg-tier1/15 text-tier1"
                  : "border-tier2/40 bg-tier2/10 text-tier2",
            ].join(" ")}
          >
            {approved
              ? "Approved for Demo"
              : confirming
                ? "Confirmation Required"
                : "Pending Review"}
          </span>

          {approved ? (
            <button
              type="button"
              onClick={resetPolicyApproval}
              className="press ring-neutral inline-flex cursor-pointer items-center gap-1 rounded border border-edge bg-canvas px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Undo / Reset Demo
            </button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Proposed Rule Diff Block */}
        <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-lg border border-edge bg-canvas lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge bg-raised/50 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-ink-dim uppercase">
              <FileDiff
                className="h-3.5 w-3.5 text-ink-faint"
                aria-hidden="true"
              />
              Proposed least-privilege rule diff
            </span>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase",
                approved
                  ? "border-safe/40 bg-safe/10 text-safe"
                  : "border-tier2/40 bg-tier2/10 text-tier2",
              ].join(" ")}
            >
              <TierIcon
                tier={0}
                stroke={approved ? "#10b981" : "#f59e0b"}
                className="h-3 w-3 shrink-0"
                aria-hidden="true"
              />
              {approved ? "Promoted · Tier 0 PicoClaw" : "Awaiting Promotion"}
            </span>
          </div>

          <div className="scroll-slim flex flex-col divide-y divide-edge/60 overflow-x-auto font-mono text-xs leading-6">
            <div className="flex items-center justify-between gap-3 bg-threat/[0.05] px-3.5 py-2.5 text-threat">
              <p className="whitespace-nowrap">
                <span className="mr-2.5 inline-block w-3 shrink-0 select-none text-threat/80">
                  -
                </span>
                {POLICY_DIFF.removed}
              </p>
              <span className="shrink-0 rounded border border-threat/30 bg-threat/10 px-1.5 py-0.5 text-[9px] tracking-widest uppercase">
                Removed
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 bg-safe/[0.06] px-3.5 py-2.5 text-safe">
              <p className="whitespace-nowrap">
                <span className="mr-2.5 inline-block w-3 shrink-0 select-none text-safe/80">
                  +
                </span>
                {POLICY_DIFF.added}
              </p>
              <span className="shrink-0 rounded border border-safe/30 bg-safe/10 px-1.5 py-0.5 text-[9px] tracking-widest uppercase">
                Added
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge bg-raised/25 px-3.5 py-2 font-mono text-[10px] text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <TierIcon
                tier={0}
                stroke="#10b981"
                className="h-3.5 w-3.5 text-safe"
                aria-hidden="true"
              />
              Target: Tier 0 PicoClaw local cache
            </span>
            <span>Cache lookup: {POLICY_DIFF.cacheLatencyMs}ms (spec)</span>
          </div>
        </div>

        {/* Right: Interactive Confirmation Dialog & Promotion Controls */}
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-edge bg-canvas/75 p-4 lg:col-span-5">
          {policyState === "pending" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-safe/40 bg-safe/10">
                  <TierIcon
                    tier={0}
                    stroke="#10b981"
                    className="h-4 w-4 text-safe"
                    aria-hidden="true"
                  />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs font-semibold tracking-[0.12em] text-ink uppercase">
                    Promote Rule to PicoClaw Cache
                  </p>
                  <p className="text-xs leading-5 text-ink-dim">
                    Click below to review and confirm promoting this scoped rule
                    into the simulated Tier 0 cache and Activity Stream.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestPolicyConfirmation}
                className="press ring-emerald inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-safe/50 bg-safe px-4 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-canvas uppercase transition-colors hover:bg-safe/90"
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                Approve &amp; Hot-Reload
              </button>
            </div>
          ) : null}

          {policyState === "confirming" ? (
            <div
              role="dialog"
              aria-modal="false"
              aria-labelledby="policy-confirm-title"
              className="flex flex-col gap-3 rounded-md border border-tier1/50 bg-tier1/[0.08] p-3.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-tier1"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <p
                    id="policy-confirm-title"
                    className="font-mono text-xs font-semibold tracking-[0.14em] text-tier1 uppercase"
                  >
                    Confirm Demo Rule Approval?
                  </p>
                  <p className="text-xs leading-5 text-ink-dim">
                    This will promote{" "}
                    <code className="text-ink">{POLICY_DIFF.added}</code> to the
                    active PicoClaw cache ({POLICY_DIFF.cacheLatencyMs}ms) and
                    append a simulated event to the Activity Stream.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={confirmPolicyApproval}
                  className="press ring-emerald inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-safe/50 bg-safe px-3 py-2 font-mono text-xs font-semibold tracking-[0.12em] text-canvas uppercase hover:bg-safe/90"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Confirm Promotion
                </button>
                <button
                  type="button"
                  onClick={cancelPolicyConfirmation}
                  className="press ring-neutral inline-flex cursor-pointer items-center justify-center rounded-md border border-edge bg-surface px-3 py-2 font-mono text-xs tracking-[0.12em] text-ink-dim uppercase hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {policyState === "promoted" ? (
            <div className="flex flex-col gap-3">
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-2 rounded-md border border-safe/50 bg-safe/15 px-4 py-3 font-mono text-xs font-semibold tracking-[0.14em] text-safe uppercase"
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                {POLICY_DIFF.promotedMessage}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {promotedEventId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTierFilter("all");
                      setSelectedEventId(promotedEventId);
                    }}
                    className="press ring-emerald inline-flex cursor-pointer items-center gap-1.5 rounded border border-safe/40 bg-safe/10 px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-safe uppercase hover:bg-safe/20"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Inspect event in stream
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={resetPolicyApproval}
                  className="press ring-neutral inline-flex cursor-pointer items-center gap-1.5 rounded border border-edge bg-surface px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] text-ink-dim uppercase hover:text-ink"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Undo / Reset Demo Approval
                </button>
              </div>
            </div>
          ) : null}

          <p className="border-t border-edge/70 pt-2.5 font-mono text-[10px] leading-4 text-ink-faint">
            Demo only — no real backend policy or permissions are changed.
          </p>
        </div>
      </div>

      {/* Active PicoClaw Cache Strip */}
      <div className="mt-5 border-t border-edge pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TierIcon
              tier={0}
              stroke="#10b981"
              className="h-4 w-4 text-safe"
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-ink-dim uppercase">
              Active PicoClaw Cache Rules
            </span>
            <span className="rounded border border-edge bg-canvas px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-ink-faint uppercase">
              {cacheRules.length} {cacheRules.length === 1 ? "rule" : "rules"}
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
            Simulated demo cache
          </span>
        </div>

        {cacheRules.length === 0 ? (
          <p className="mt-2.5 rounded-md border border-edge/70 bg-canvas/50 px-3.5 py-2.5 font-mono text-[11px] text-ink-faint">
            No rules promoted yet. Click &ldquo;Approve &amp; Hot-Reload&rdquo;
            above to promote the proposed rule into this cache strip.
          </p>
        ) : (
          <ul className="mt-2.5 flex flex-col gap-2">
            {cacheRules.map((rule) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-safe/40 bg-safe/[0.06] px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 rounded border border-safe/40 bg-safe/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-widest text-safe uppercase">
                    <TierIcon
                      tier={0}
                      stroke="#10b981"
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                    T0 Cached
                  </span>
                  <code className="break-all font-mono text-xs text-safe">
                    {rule.rule}
                  </code>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                  <span className="tabular-nums">
                    Promoted at {formatTime(rule.addedAt)}
                  </span>
                  <span className="rounded border border-safe/40 bg-safe/10 px-2 py-0.5 text-safe tabular-nums">
                    {POLICY_DIFF.cacheLatencyMs}ms
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CockpitPanel>
  );
}
