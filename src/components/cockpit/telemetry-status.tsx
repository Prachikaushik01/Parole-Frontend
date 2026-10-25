"use client";

/**
 * Connection status badge — quiet, persistent indicator showing whether
 * telemetry is simulated demo data or connected to a live SSE stream,
 * plus the Cockpit demo-state reset button.
 */

import { RotateCcw } from "lucide-react";
import { useTelemetry } from "@/lib/telemetry/store";
import { useCockpit } from "./cockpit-context";

export function TelemetryStatusBadge() {
  const { source, sourceDetail, isSimulated } = useTelemetry();

  if (source === "connecting") {
    return (
      <span
        role="status"
        aria-live="polite"
        title={sourceDetail}
        className="inline-flex h-7 items-center gap-2 rounded-md border border-white/[0.07] bg-surface/80 px-2.5 text-xs text-ink-faint"
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint"
        />
        Connecting…
      </span>
    );
  }

  if (source === "live" && !isSimulated) {
    return (
      <span
        role="status"
        aria-live="polite"
        title={sourceDetail}
        className="inline-flex h-7 items-center gap-2 rounded-md border border-safe/25 bg-safe/[0.06] px-2.5 text-xs font-medium text-safe"
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-safe" />
        Live telemetry
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-live="polite"
      title={sourceDetail}
      className="inline-flex h-7 items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 text-xs text-ink-dim"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tier2" />
      <span>Simulated demo</span>
    </span>
  );
}

export function CockpitResetControl() {
  const { hasModifiedDemoState, resetAllDemoState } = useCockpit();

  if (!hasModifiedDemoState) return null;

  return (
    <button
      type="button"
      onClick={resetAllDemoState}
      className="press inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-white/[0.1] bg-raised px-2.5 text-xs font-medium text-ink transition-colors hover:border-white/[0.18] hover:bg-white/[0.08]"
    >
      <RotateCcw className="h-3 w-3 shrink-0 text-safe" aria-hidden="true" />
      Reset demo state
    </button>
  );
}
