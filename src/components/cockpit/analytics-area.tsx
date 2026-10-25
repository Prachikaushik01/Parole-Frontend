/**
 * Analytics area — Escalation Curve and Cost Comparison charts.
 *
 * Simplified metadata: each chart panel displays one concise specification
 * caption without duplicate footnotes.
 */

import { CockpitPanel } from "./panel";
import { EscalationChart } from "./escalation-chart";
import { CostChart } from "./cost-chart";

export function AnalyticsArea() {
  return (
    <div className="grid h-full min-w-0 gap-4 sm:gap-5 md:grid-cols-2">
      <CockpitPanel
        title="Escalation Curve"
        eyebrow="0–20 min"
        className="h-full"
        meta={
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            Illustrative spec series
          </span>
        }
        bodyClassName="flex flex-col justify-between p-4 sm:p-5"
      >
        <EscalationChart />
      </CockpitPanel>

      <CockpitPanel
        title="Cost Comparison"
        eyebrow="Per 1k actions"
        className="h-full"
        meta={
          <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            Project-specified figures
          </span>
        }
        bodyClassName="flex flex-col justify-between p-4 sm:p-5"
      >
        <CostChart />
      </CockpitPanel>
    </div>
  );
}
