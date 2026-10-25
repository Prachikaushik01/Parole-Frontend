"use client";

/**
 * Telemetry store — React Context + useReducer, mounted once in the root
 * layout (Step 4).
 *
 * Responsibilities:
 * - Own the single SSE subscription and expose its status (connecting /
 *   live / fallback) plus a human-readable detail line.
 * - When the backend is absent or sends invalid data, automatically run the
 *   deterministic fallback generator and mark every event it produces with
 *   `origin: "simulated"` so the UI can label them.
 * - Let later steps (presets, demo control, policy approval) inject their own
 *   events through `pushEvent()` with an explicit origin — also labelled
 *   simulated unless genuinely from the backend.
 * - Clean up the subscription on unmount (Strict-Mode safe).
 *
 * This module never presents simulated events as live: `isSimulated` derives
 * directly from each event's origin.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { TelemetryEvent } from "../types";
import { FALLBACK_FILENAME, SSE_ENDPOINT } from "../constants";
import { connectTelemetryStream, type StreamConnection, type StreamStatus } from "./sse-client";
import { createFallbackGenerator } from "./fallback";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Where an event came from. Anything other than "sse" is simulated. */
export type EventOrigin = "sse" | "preset" | "demo" | "policy" | "fallback";

export interface StoredEvent extends TelemetryEvent {
  origin: EventOrigin;
}

export type TelemetrySource = StreamStatus; // "connecting" | "live" | "fallback"

export interface TelemetryState {
  /** Current connection status. */
  source: TelemetrySource;
  /** Human-readable status detail (endpoint, error reason, fallback notice). */
  sourceDetail: string;
  /** Newest events first, capped at MAX_EVENTS. */
  events: StoredEvent[];
}

export interface PushEventInput {
  event: TelemetryEvent;
  origin: EventOrigin;
}

/** Oldest events are dropped beyond this cap to bound memory. */
export const MAX_EVENTS = 200;

/** Events seeded instantly when the fallback engages, so the UI is never empty. */
const FALLBACK_SEED_COUNT = 8;

/** Milliseconds between generated fallback events while running. */
const FALLBACK_INTERVAL_MS = 2500;

/* -------------------------------------------------------------------------- */
/* Reducer                                                                    */
/* -------------------------------------------------------------------------- */

type Action =
  | { type: "status"; source: TelemetrySource; detail: string }
  | { type: "append"; entries: StoredEvent[] };

function reducer(state: TelemetryState, action: Action): TelemetryState {
  switch (action.type) {
    case "status":
      return { ...state, source: action.source, sourceDetail: action.detail };
    case "append": {
      if (action.entries.length === 0) return state;
      // Newest first; cap total length.
      const events = [...action.entries.reverse(), ...state.events].slice(0, MAX_EVENTS);
      return { ...state, events };
    }
    default:
      return state;
  }
}

const initialState: TelemetryState = {
  source: "connecting",
  sourceDetail: `Attempting SSE connection to ${SSE_ENDPOINT}…`,
  events: [],
};

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

export interface TelemetryContextValue extends TelemetryState {
  /** True when *anything shown* includes generated demo data (or nothing live yet). */
  isSimulated: boolean;
  /** Inject an event from presets / demo control / policy approval. */
  pushEvent: (input: PushEventInput) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error("useTelemetry must be used within <TelemetryProvider>");
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    let connection: StreamConnection | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;
    let fallbackStarted = false;

    const startFallback = (reason: string) => {
      if (cancelled || fallbackStarted) return;
      fallbackStarted = true;
      dispatch({
        type: "status",
        source: "fallback",
        detail:
          `${reason} SIMULATED DEMO DATA — deterministic generator` +
          (FALLBACK_FILENAME
            ? ` (Role 4 file "${FALLBACK_FILENAME}" not available; built-in generator in use).`
            : ""),
      });
      const generator = createFallbackGenerator();
      dispatch({ type: "append", entries: generator.batch(FALLBACK_SEED_COUNT).map(toStored("fallback")) });
      fallbackTimer = setInterval(() => {
        if (cancelled) return;
        dispatch({ type: "append", entries: [toStored("fallback")(generator.next())] });
      }, FALLBACK_INTERVAL_MS);
    };

    const stopFallback = () => {
      if (fallbackTimer !== null) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    connection = connectTelemetryStream(SSE_ENDPOINT, {
      onStatus: (status, detail) => {
        if (cancelled) return;
        if (status === "live") {
          dispatch({ type: "status", source: "live", detail });
        } else if (status === "fallback") {
          startFallback(detail);
        }
        // "connecting" keeps the initial state as-is.
      },
      onEvent: (event) => {
        if (cancelled) return;
        // Backend events arrive only in live mode; origin stays "sse".
        dispatch({ type: "append", entries: [toStored("sse")(event)] });
      },
    });

    return () => {
      cancelled = true;
      stopFallback();
      connection?.disconnect();
    };
  }, []);

  const pushEvent = useCallback((input: PushEventInput) => {
    dispatch({ type: "append", entries: [toStored(input.origin)(input.event)] });
  }, []);

  // Simulated if we're not on live SSE, or if any visible event is non-SSE.
  const isSimulated = useMemo(
    () => state.source !== "live" || state.events.some((e) => e.origin !== "sse"),
    [state.source, state.events],
  );

  const value = useMemo<TelemetryContextValue>(
    () => ({ ...state, isSimulated, pushEvent }),
    [state, isSimulated, pushEvent],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

/** Curries an origin onto a plain TelemetryEvent to produce a StoredEvent. */
function toStored(origin: EventOrigin) {
  return (event: TelemetryEvent): StoredEvent => ({ ...event, origin });
}
