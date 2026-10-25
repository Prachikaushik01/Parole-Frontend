"use client";

/**
 * Interactive Activity Stream — filterable, searchable monospace event table
 * with clickable row inspection and PAROLE tier symbols.
 *
 * Discoverability & interaction design:
 * - Filter buttons include official PAROLE tier symbols (PicoClaw, TypeSafe Jev,
 *   Nebius Synthesis, and Hard Security Boundary).
 * - Interactive rows feature a strong hover highlight, pointer cursor, and an
 *   explicit "Inspect →" action pill so users immediately know rows are clickable.
 * - Clicking a row opens the Event Detail Drawer showing command, provenance,
 *   decision, tier, latency, and simulated-data status.
 */

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Radar,
  Radio,
  RotateCcw,
  Search,
  ShieldX,
  Terminal,
  X,
} from "lucide-react";
import { TierIcon } from "@/components/ui/tier-icon";
import type { RouteTarget, TaintLevel, Tone } from "@/lib/types";
import { TIER_DEFINITIONS } from "@/lib/constants";
import { useCockpit, type TierFilter } from "./cockpit-context";
import { CockpitPanel } from "./panel";

const TAINT_STYLE: Record<TaintLevel, string> = {
  clean: "border-edge bg-canvas text-ink-faint",
  tainted: "border-threat/40 bg-threat/10 text-threat",
  unknown: "border-tier2/40 bg-tier2/10 text-tier2",
};

const ROUTE_TONE: Record<Tone, string> = {
  safe: "border-safe/40 bg-safe/10 text-safe",
  tier1: "border-tier1/40 bg-tier1/10 text-tier1",
  tier2: "border-tier2/40 bg-tier2/10 text-tier2",
  threat: "border-threat/40 bg-threat/10 text-threat",
};

const FILTER_OPTIONS: readonly {
  id: TierFilter;
  label: string;
  activeClass: string;
}[] = [
  {
    id: "all",
    label: "All",
    activeClass: "border-ink/50 bg-raised text-ink",
  },
  {
    id: 0,
    label: "Tier 0",
    activeClass: "border-safe/60 bg-safe/15 text-safe",
  },
  {
    id: 1,
    label: "Tier 1",
    activeClass: "border-tier1/60 bg-tier1/15 text-tier1",
  },
  {
    id: 2,
    label: "Tier 2",
    activeClass: "border-tier2/60 bg-tier2/15 text-tier2",
  },
  {
    id: "hard-block",
    label: "Blocked",
    activeClass: "border-threat/60 bg-threat/15 text-threat",
  },
] as const;

function RouteSymbol({
  route,
  className = "h-3.5 w-3.5 shrink-0",
}: {
  route: RouteTarget;
  className?: string;
}) {
  if (route === "hard-block") {
    return <ShieldX className={`${className} text-threat`} aria-hidden="true" />;
  }
  const strokeHex =
    route === 0 ? "#10b981" : route === 1 ? "#06b6d4" : "#f59e0b";
  return (
    <TierIcon
      tier={route}
      stroke={route === 0 ? strokeHex : "currentColor"}
      className={className}
      aria-hidden="true"
    />
  );
}

function routeMeta(route: RouteTarget): {
  label: string;
  shortName: string;
  engineLabel: string;
  bandLabel: string;
  tone: Tone;
} {
  if (route === "hard-block") {
    return {
      label: "Blocked",
      shortName: "Hard boundary",
      engineLabel: "Hard security boundary (outside Tiers 0–2)",
      bandLabel: "0.3ms spec boundary",
      tone: "threat",
    };
  }
  const tier = TIER_DEFINITIONS.find((t) => t.id === route);
  return {
    label: `Tier ${route}`,
    shortName: tier?.name ?? `Tier ${route}`,
    engineLabel: tier ? `${tier.name} · ${tier.engine}` : `Tier ${route}`,
    bandLabel: tier?.latencyLabel ?? "—",
    tone: tier?.tone ?? "safe",
  };
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 10) return `${ms.toFixed(1)}ms`;
  return `${Math.round(ms)}ms`;
}

/** Cap visible stream window for smooth rendering. */
const VISIBLE_ROWS = 40;

export function ActivityStream() {
  const {
    events,
    isSimulated,
    source,
    tierFilter,
    setTierFilter,
    searchQuery,
    setSearchQuery,
    resetStreamFilters,
    selectedEventId,
    setSelectedEventId,
  } = useCockpit();

  const windowEvents = useMemo(() => events.slice(0, VISIBLE_ROWS), [events]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: windowEvents.length,
      "0": 0,
      "1": 0,
      "2": 0,
      "hard-block": 0,
    };
    for (const ev of windowEvents) {
      const key = String(ev.route);
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [windowEvents]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return windowEvents.filter((ev) => {
      if (tierFilter !== "all" && ev.route !== tierFilter) {
        return false;
      }
      if (q.length > 0) {
        const hay = `${ev.command} ${ev.provenance} ${ev.node}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [windowEvents, tierFilter, searchQuery]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const hasActiveFilter =
    tierFilter !== "all" || searchQuery.trim().length > 0;

  useEffect(() => {
    if (!selectedEventId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEventId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedEventId, setSelectedEventId]);

  return (
    <CockpitPanel
      title="Activity Stream"
      eyebrow="Events"
      className="h-full"
      meta={
        <>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase",
              source === "live" && !isSimulated
                ? "border-safe/40 bg-safe/10 text-safe"
                : "border-tier2/50 bg-tier2/10 text-tier2",
            ].join(" ")}
          >
            {source === "live" && !isSimulated ? (
              <Radio className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : (
              <Radar className="h-3 w-3 shrink-0" aria-hidden="true" />
            )}
            {source === "live" && !isSimulated
              ? "Live SSE"
              : "Simulated Demo Data"}
          </span>
          <span className="rounded border border-edge bg-canvas/70 px-2 py-0.5 font-mono text-[10px] tabular-nums tracking-[0.14em] text-ink-faint uppercase">
            {filteredRows.length} / {windowEvents.length} shown
          </span>
        </>
      }
      bodyClassName="p-0"
    >
      {/* Interactive Filter & Search Toolbar */}
      <div className="flex flex-col gap-2.5 border-b border-edge bg-canvas/50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {/* Tier filter pills with Tier Symbols */}
        <div
          role="group"
          aria-label="Filter events by routing tier"
          className="flex flex-wrap items-center gap-1.5"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = tierFilter === option.id;
            const count = counts[String(option.id)] ?? 0;
            return (
              <button
                key={String(option.id)}
                type="button"
                onClick={() =>
                  setTierFilter(
                    isActive && option.id !== "all" ? "all" : option.id,
                  )
                }
                aria-pressed={isActive}
                className={[
                  "press inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase transition-all",
                  isActive
                    ? `${option.activeClass} shadow-[0_0_0_1px_rgb(255_255_255/0.06)]`
                    : "border-edge bg-surface text-ink-dim hover:border-edge-strong hover:bg-raised hover:text-ink",
                ].join(" ")}
              >
                {option.id !== "all" ? (
                  <RouteSymbol
                    route={option.id}
                    className="h-3.5 w-3.5 shrink-0"
                  />
                ) : null}
                <span>{option.label}</span>
                <span className="rounded bg-canvas/85 px-1.5 py-px text-[9px] tabular-nums text-ink-faint">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input + Reset button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search command or provenance…"
              aria-label="Search commands or provenance in Activity Stream"
              className="w-full rounded-md border border-edge bg-surface py-1.5 pr-7 pl-8 font-mono text-[11px] text-ink placeholder:text-ink-faint focus:border-safe focus:outline-none"
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-ink-faint hover:text-ink"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {hasActiveFilter ? (
            <button
              type="button"
              onClick={resetStreamFilters}
              className="press ring-emerald inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-safe/40 bg-safe/10 px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-safe uppercase hover:bg-safe/20"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {/* Scrollable Monospace Event Table */}
      <div className="scroll-slim max-h-[325px] min-w-0 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <caption className="sr-only">
            Recent PAROLE routing decisions. Click any row to inspect its details.
            Events marked SIM are simulated demo data and are not live telemetry.
          </caption>
          <thead className="sticky top-0 z-10 bg-raised/95 backdrop-blur">
            <tr className="border-b border-edge font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
              <th scope="col" className="px-4 py-2.5 font-normal">
                Time
              </th>
              <th scope="col" className="px-4 py-2.5 font-normal">
                Command
              </th>
              <th scope="col" className="px-4 py-2.5 font-normal">
                Provenance
              </th>
              <th scope="col" className="px-4 py-2.5 font-normal">
                Tier
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-normal">
                Latency
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-normal">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <p className="font-mono text-xs text-ink-dim">
                      {hasActiveFilter
                        ? "No events match the active tier filter or search query."
                        : "Waiting for the first event…"}
                    </p>
                    {hasActiveFilter ? (
                      <button
                        type="button"
                        onClick={resetStreamFilters}
                        className="press ring-emerald inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-safe/40 bg-safe/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-safe uppercase"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Reset filters &amp; search
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((event) => {
                const route = routeMeta(event.route);
                const isSelected = selectedEventId === event.id;
                return (
                  <tr
                    key={event.id}
                    tabIndex={0}
                    aria-label={`Inspect event: ${event.command} (${route.label})`}
                    onClick={() =>
                      setSelectedEventId(isSelected ? null : event.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedEventId(isSelected ? null : event.id);
                      }
                    }}
                    className={[
                      "group cursor-pointer border-b border-edge/60 align-middle transition-colors last:border-b-0",
                      isSelected
                        ? "bg-safe/15 hover:bg-safe/20"
                        : "hover:bg-raised/85",
                    ].join(" ")}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 align-middle">
                      <span className="flex items-center gap-2">
                        <ChevronRight
                          className={[
                            "h-3.5 w-3.5 shrink-0 transition-transform",
                            isSelected
                              ? "rotate-90 text-safe"
                              : "text-ink-faint group-hover:translate-x-0.5 group-hover:text-safe",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <span className="text-ink-dim tabular-nums">
                          {formatTime(event.timestamp)}
                        </span>
                        {event.origin !== "sse" ? (
                          <span
                            className="rounded border border-tier2/40 bg-tier2/10 px-1.5 py-0.5 text-[9px] leading-none tracking-widest text-tier2 uppercase"
                            title="Simulated event — not live telemetry"
                          >
                            SIM
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="max-w-[20rem] px-4 py-2.5 align-middle">
                      <code
                        className="block truncate text-ink group-hover:text-white"
                        title={`${event.command} — ${event.node}`}
                      >
                        {event.command}
                      </code>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 align-middle">
                      <span className="flex items-center gap-2">
                        <span
                          className="max-w-[9.5rem] truncate text-ink-dim"
                          title={event.provenance}
                        >
                          {event.provenance}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] leading-none tracking-widest uppercase ${TAINT_STYLE[event.taint]}`}
                        >
                          {event.taint}
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] leading-4 tracking-wider uppercase ${ROUTE_TONE[route.tone]}`}
                      >
                        <RouteSymbol
                          route={event.route}
                          className="h-3 w-3 shrink-0"
                        />
                        {route.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right align-middle text-ink-dim tabular-nums">
                      {formatLatency(event.latencyMs)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right align-middle">
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] tracking-[0.12em] uppercase transition-colors",
                          isSelected
                            ? "border-safe/50 bg-safe/15 text-safe"
                            : "border-edge bg-canvas/80 text-ink-faint group-hover:border-safe/40 group-hover:bg-safe/10 group-hover:text-safe",
                        ].join(" ")}
                      >
                        {isSelected ? "Open" : "Inspect"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expandable Selected Event Inspection Drawer */}
      <AnimatePresence initial={false}>
        {selectedEvent ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="overflow-hidden border-t border-safe/30 bg-canvas/95"
          >
            {(() => {
              const meta = routeMeta(selectedEvent.route);
              const isSimEvent = selectedEvent.origin !== "sse";
              return (
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded border border-safe/40 bg-safe/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-safe uppercase">
                        <Terminal className="h-3 w-3" aria-hidden="true" />
                        Selected Event Details
                      </span>
                      <span
                        className={[
                          "rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase",
                          selectedEvent.outcome === "granted"
                            ? "border-safe/40 bg-safe/10 text-safe"
                            : "border-threat/40 bg-threat/10 text-threat",
                        ].join(" ")}
                      >
                        Decision: {selectedEvent.outcome}
                      </span>
                      <span
                        className={[
                          "rounded border px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase",
                          isSimEvent
                            ? "border-tier2/40 bg-tier2/10 text-tier2"
                            : "border-safe/40 bg-safe/10 text-safe",
                        ].join(" ")}
                      >
                        {isSimEvent
                          ? `Simulated Data (${selectedEvent.origin})`
                          : "Live SSE"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEventId(null)}
                      aria-label="Close event detail inspection"
                      className="press ring-neutral inline-flex cursor-pointer items-center gap-1 rounded border border-edge bg-surface px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink-dim uppercase hover:text-ink"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                      Close
                    </button>
                  </div>

                  <div className="rounded-md border border-edge bg-surface px-3.5 py-2.5">
                    <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                      Command · node {selectedEvent.node} ·{" "}
                      {formatTime(selectedEvent.timestamp)}
                    </p>
                    <code className="mt-1 block break-all font-mono text-xs text-ink">
                      {selectedEvent.command}
                    </code>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 font-mono text-[11px] sm:grid-cols-4">
                    <div className="rounded border border-edge bg-surface/60 px-3 py-2">
                      <p className="text-[9px] tracking-[0.16em] text-ink-faint uppercase">
                        Provenance
                      </p>
                      <p className="mt-0.5 truncate text-ink">
                        {selectedEvent.provenance}{" "}
                        <span className="uppercase text-ink-faint">
                          ({selectedEvent.taint})
                        </span>
                      </p>
                    </div>
                    <div className="rounded border border-edge bg-surface/60 px-3 py-2">
                      <p className="text-[9px] tracking-[0.16em] text-ink-faint uppercase">
                        Tier &amp; Engine
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-ink">
                        <RouteSymbol
                          route={selectedEvent.route}
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        <span className="truncate">
                          {meta.label} · {meta.shortName}
                        </span>
                      </p>
                    </div>
                    <div className="rounded border border-edge bg-surface/60 px-3 py-2">
                      <p className="text-[9px] tracking-[0.16em] text-ink-faint uppercase">
                        Latency
                      </p>
                      <p className="mt-0.5 tabular-nums text-ink">
                        {formatLatency(selectedEvent.latencyMs)}{" "}
                        <span className="text-ink-faint">({meta.bandLabel})</span>
                      </p>
                    </div>
                    <div className="rounded border border-edge bg-surface/60 px-3 py-2">
                      <p className="text-[9px] tracking-[0.16em] text-ink-faint uppercase">
                        Source Label
                      </p>
                      <p className="mt-0.5 truncate text-tier2">
                        {isSimEvent
                          ? "Simulated demo data"
                          : "Verified SSE stream"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs leading-5 text-ink-dim">
                    {selectedEvent.detail}
                  </p>
                </div>
              );
            })()}
          </motion.div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge bg-canvas/45 px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            <span>
              Click any event row to inspect command, provenance, tier, and latency
            </span>
            {hasActiveFilter ? (
              <button
                type="button"
                onClick={resetStreamFilters}
                className="cursor-pointer font-medium text-safe hover:underline"
              >
                Clear active filters
              </button>
            ) : null}
          </div>
        )}
      </AnimatePresence>
    </CockpitPanel>
  );
}
