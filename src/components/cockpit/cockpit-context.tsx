"use client";

/**
 * Shared interactive state for the Governance Cockpit.
 *
 * Coordinates cross-panel interactions so the dashboard behaves as one
 * cohesive security operations console:
 * - Tier filter & search query shared between TierRouting, KPI cards,
 *   SecurityAlert, and ActivityStream.
 * - Selected event inspection drawer in ActivityStream.
 * - SecurityAlert dismiss/restore and detail expansion states.
 * - PolicyApproval confirmation, promotion, active PicoClaw cache rules,
 *   and reversible undo/reset synchronized with the ActivityStream event list.
 *
 * All data remains strictly project-specified or clearly labeled as simulated.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CacheRule, RouteTarget } from "@/lib/types";
import {
  INITIAL_CACHE_RULES,
  POLICY_DIFF,
  QUICK_TEST_PRESETS,
  SENSITIVE_TARGETS,
} from "@/lib/constants";
import { useTelemetry, type StoredEvent } from "@/lib/telemetry/store";

export type TierFilter = "all" | RouteTarget;

export type PolicyFlowState = "pending" | "confirming" | "promoted";

export interface CockpitContextValue {
  /** Combined event stream (live/fallback telemetry + baseline preset seeds + active demo policy event). */
  events: StoredEvent[];
  /** Whether the telemetry feed is currently showing simulated demo data. */
  isSimulated: boolean;
  /** Underlying telemetry connection state. */
  source: "connecting" | "live" | "fallback";
  /** Detailed connection status description. */
  sourceDetail: string;

  /** Active route/tier filter for the Activity Stream. */
  tierFilter: TierFilter;
  setTierFilter: (filter: TierFilter) => void;

  /** Search query filtering commands, provenance, and node names. */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  /** Reset both tierFilter and searchQuery. */
  resetStreamFilters: () => void;

  /** Currently inspected event ID in the Activity Stream detail panel. */
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  /** Security Alert interactive state. */
  alertDismissed: boolean;
  setAlertDismissed: (dismissed: boolean) => void;
  alertDetailOpen: boolean;
  setAlertDetailOpen: (open: boolean) => void;

  /** Policy Approval interactive state (shared across PolicyApproval & ActivityStream). */
  policyState: PolicyFlowState;
  requestPolicyConfirmation: () => void;
  cancelPolicyConfirmation: () => void;
  confirmPolicyApproval: () => void;
  resetPolicyApproval: () => void;
  cacheRules: CacheRule[];
  promotedEventId: string | null;

  /** Reset all interactive demo state across the cockpit. */
  resetAllDemoState: () => void;
  /** True when any demo state (filters, alert dismissal, or policy promotion) differs from initial. */
  hasModifiedDemoState: boolean;
}

const CockpitContext = createContext<CockpitContextValue | null>(null);

export function useCockpit(): CockpitContextValue {
  const ctx = useContext(CockpitContext);
  if (!ctx) {
    throw new Error("useCockpit must be used within <CockpitProvider>");
  }
  return ctx;
}

/**
 * Deterministic baseline simulated events derived directly from QUICK_TEST_PRESETS
 * so that Tier 0, Tier 1, Tier 2, and Hard-Block filters all have representative
 * spec-accurate simulated entries available immediately on initial load.
 */
function buildBaselineSeedEvents(anchorTime: number): StoredEvent[] {
  const rgPreset = QUICK_TEST_PRESETS.find((p) => p.id === "rg-todo");
  const curlPreset = QUICK_TEST_PRESETS.find((p) => p.id === "curl-users");
  const poisonPreset = QUICK_TEST_PRESETS.find((p) => p.id === "poisoned-readme");

  const seeds: StoredEvent[] = [];

  if (poisonPreset) {
    seeds.push({
      id: "sim-seed-boundary",
      timestamp: anchorTime - 3200,
      node: "opencode-01",
      command: poisonPreset.command,
      provenance: "tainted:README.md",
      taint: "tainted",
      route: "hard-block",
      latencyMs: 0.3,
      outcome: "blocked",
      detail:
        `${poisonPreset.description} Target matches protected boundary patterns (` +
        SENSITIVE_TARGETS.map((t) => t.pattern).join(", ") +
        ").",
      origin: "demo",
    });
  }

  if (curlPreset) {
    seeds.push({
      id: "sim-seed-tier2",
      timestamp: anchorTime - 6400,
      node: "nemoclaw-sbx-3",
      command: curlPreset.command,
      provenance: "local:workspace",
      taint: "clean",
      route: 2,
      latencyMs: 1840,
      outcome: "granted",
      detail: curlPreset.description,
      origin: "demo",
    });
  }

  if (rgPreset) {
    seeds.push({
      id: "sim-seed-tier1",
      timestamp: anchorTime - 9100,
      node: "opencode-02",
      command: rgPreset.command,
      provenance: "local:workspace",
      taint: "clean",
      route: 1,
      latencyMs: 97,
      outcome: "granted",
      detail: rgPreset.description,
      origin: "demo",
    });
  }

  return seeds;
}

const SESSION_ANCHOR_MS = 1761268800000;

export function CockpitProvider({ children }: { children: ReactNode }) {
  const { events: storeEvents, isSimulated, source, sourceDetail } = useTelemetry();

  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [alertDismissed, setAlertDismissed] = useState(false);
  const [alertDetailOpen, setAlertDetailOpen] = useState(false);

  const [policyState, setPolicyState] = useState<PolicyFlowState>("pending");
  const [cacheRules, setCacheRules] = useState<CacheRule[]>(() => [
    ...INITIAL_CACHE_RULES,
  ]);
  const [policyEvent, setPolicyEvent] = useState<StoredEvent | null>(null);

  const baselineSeeds = useMemo(() => {
    const oldestStoreTimestamp =
      storeEvents.length > 0
        ? storeEvents[storeEvents.length - 1].timestamp
        : SESSION_ANCHOR_MS;
    return buildBaselineSeedEvents(oldestStoreTimestamp);
  }, [storeEvents]);

  const combinedEvents = useMemo(() => {
    const list: StoredEvent[] = [];
    if (policyEvent) {
      list.push(policyEvent);
    }
    list.push(...storeEvents);
    // In simulated/fallback mode, ensure every tier and hard-block has at least one spec preset event
    if (isSimulated) {
      for (const seed of baselineSeeds) {
        if (!list.some((e) => e.id === seed.id)) {
          list.push(seed);
        }
      }
    }
    return list;
  }, [policyEvent, storeEvents, isSimulated, baselineSeeds]);

  const resetStreamFilters = useCallback(() => {
    setTierFilter("all");
    setSearchQuery("");
  }, []);

  const requestPolicyConfirmation = useCallback(() => {
    setPolicyState((prev) => (prev === "pending" ? "confirming" : prev));
  }, []);

  const cancelPolicyConfirmation = useCallback(() => {
    setPolicyState((prev) => (prev === "confirming" ? "pending" : prev));
  }, []);

  const confirmPolicyApproval = useCallback(() => {
    const now = Date.now();
    const eventId = `policy-approval-${now}`;
    const newRule: CacheRule = {
      id: `rule-${now}`,
      rule: POLICY_DIFF.added,
      addedAt: now,
    };

    const generatedEvent: StoredEvent = {
      id: eventId,
      timestamp: now,
      node: "policy-studio",
      command: `promote "${POLICY_DIFF.added}"`,
      provenance: "policy:nemotron-proposal",
      taint: "clean",
      route: 0,
      latencyMs: POLICY_DIFF.cacheLatencyMs,
      outcome: "granted",
      detail:
        "SIMULATED policy approval — least-privilege rule promoted to the " +
        "PicoClaw cache for this demo. No backend policy was changed and no " +
        "permissions are enforced.",
      origin: "policy",
    };

    setPolicyState("promoted");
    setCacheRules([...INITIAL_CACHE_RULES, newRule]);
    setPolicyEvent(generatedEvent);
    setSelectedEventId(eventId);
  }, []);

  const resetPolicyApproval = useCallback(() => {
    setPolicyState("pending");
    setCacheRules([...INITIAL_CACHE_RULES]);
    setSelectedEventId((prev) =>
      policyEvent && prev === policyEvent.id ? null : prev,
    );
    setPolicyEvent(null);
  }, [policyEvent]);

  const resetAllDemoState = useCallback(() => {
    setTierFilter("all");
    setSearchQuery("");
    setSelectedEventId(null);
    setAlertDismissed(false);
    setAlertDetailOpen(false);
    setPolicyState("pending");
    setCacheRules([...INITIAL_CACHE_RULES]);
    setPolicyEvent(null);
  }, []);

  const hasModifiedDemoState =
    tierFilter !== "all" ||
    searchQuery.trim().length > 0 ||
    selectedEventId !== null ||
    alertDismissed ||
    alertDetailOpen ||
    policyState !== "pending";

  const value = useMemo<CockpitContextValue>(
    () => ({
      events: combinedEvents,
      isSimulated,
      source,
      sourceDetail,
      tierFilter,
      setTierFilter,
      searchQuery,
      setSearchQuery,
      resetStreamFilters,
      selectedEventId,
      setSelectedEventId,
      alertDismissed,
      setAlertDismissed,
      alertDetailOpen,
      setAlertDetailOpen,
      policyState,
      requestPolicyConfirmation,
      cancelPolicyConfirmation,
      confirmPolicyApproval,
      resetPolicyApproval,
      cacheRules,
      promotedEventId: policyEvent?.id ?? null,
      resetAllDemoState,
      hasModifiedDemoState,
    }),
    [
      combinedEvents,
      isSimulated,
      source,
      sourceDetail,
      tierFilter,
      searchQuery,
      resetStreamFilters,
      selectedEventId,
      alertDismissed,
      alertDetailOpen,
      policyState,
      requestPolicyConfirmation,
      cancelPolicyConfirmation,
      confirmPolicyApproval,
      resetPolicyApproval,
      cacheRules,
      policyEvent,
      resetAllDemoState,
      hasModifiedDemoState,
    ],
  );

  return (
    <CockpitContext.Provider value={value}>{children}</CockpitContext.Provider>
  );
}
