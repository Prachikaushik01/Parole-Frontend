/**
 * Cybernetic Sentinel Governance Cockpit — interactive security operations
 * dashboard.
 *
 * Four-row composition:
 * - Header: Cockpit title, short description, demo-mode indicator, and
 *   persistent SIMULATED DEMO DATA status badge.
 * - Row 1: Four interactive KPI cards with expandable specification breakdowns.
 * - Row 2: Security Alert (left, ~35% width) and filterable/searchable
 *   Activity Stream (right, ~65% width).
 * - Row 3: Interactive Tier Routing (left, 1/3 width) and Escalation Curve +
 *   Cost Comparison charts (right, 2/3 width).
 * - Row 4: Full-width Nemotron Policy Approval workflow with confirmation and
 *   reversible demo cache promotion.
 */

import { Activity } from "lucide-react";
import { CockpitProvider } from "@/components/cockpit/cockpit-context";
import {
  CockpitResetControl,
  TelemetryStatusBadge,
} from "@/components/cockpit/telemetry-status";
import { KpiCards } from "@/components/cockpit/kpi-cards";
import { SecurityAlert } from "@/components/cockpit/security-alert";
import { ActivityStream } from "@/components/cockpit/activity-stream";
import { TierRouting } from "@/components/cockpit/tier-routing";
import { AnalyticsArea } from "@/components/cockpit/analytics-area";
import { PolicyApproval } from "@/components/cockpit/policy-approval";

export default function CockpitPage() {
  return (
    <CockpitProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Decorative backdrop — technical grid + restrained emerald/cyan lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-grid opacity-50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-grid-fine grid-fade opacity-[0.22]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(58%_46%_at_88%_2%,rgb(16_185_129/0.09),transparent_68%),radial-gradient(52%_44%_at_4%_90%,rgb(6_182_212/0.06),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 glow-field opacity-70"
        />

        <div className="relative mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Header — identity, short description, persistent simulated-data indicator */}
          <header className="flex flex-col gap-4 border-b border-edge pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] text-safe uppercase">
                <Activity
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                Cybernetic Sentinel
              </p>
              <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Governance Cockpit
                </h1>
                <p className="font-mono text-xs text-ink-dim">
                  Interactive permission routing, boundary containment, and
                  policy review console
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <CockpitResetControl />
              <span className="inline-flex items-center gap-2 rounded-md border border-edge bg-surface/90 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-ink-dim uppercase">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint"
                  aria-hidden="true"
                />
                Demo environment · no live enforcement
              </span>
              <TelemetryStatusBadge />
            </div>
          </header>

          {/* Row 1 — Four interactive KPI cards */}
          <KpiCards />

          {/* Row 2 — Security Alert (~35% width) on left, Activity Stream (~65% width) on right */}
          <div className="grid min-w-0 items-stretch gap-4 sm:gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,13fr)]">
            <div className="min-w-0">
              <SecurityAlert />
            </div>
            <div className="min-w-0">
              <ActivityStream />
            </div>
          </div>

          {/* Row 3 — Tier Routing (1/3 width) on left, Escalation Curve & Cost Comparison (2/3 width) on right */}
          <div className="grid min-w-0 items-stretch gap-4 sm:gap-5 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-4">
              <TierRouting />
            </div>
            <div className="min-w-0 xl:col-span-8">
              <AnalyticsArea />
            </div>
          </div>

          {/* Row 4 — Full-width Policy Approval section */}
          <PolicyApproval />
        </div>
      </div>
    </CockpitProvider>
  );
}
