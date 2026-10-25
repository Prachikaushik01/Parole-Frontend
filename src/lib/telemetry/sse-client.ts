/**
 * SSE client for the PAROLE backend telemetry stream.
 *
 * Connection contract:
 * - Try `http://localhost:8000/v1/policy/stream` (configurable).
 * - Frames are structurally validated; invalid frames are counted, and after a
 *   small threshold the stream is abandoned in favour of the fallback.
 * - If the backend is unreachable (typical for public demos), times out, or
 *   errors, we report "fallback" and the caller switches to deterministic
 *   simulated telemetry — clearly labelled in the UI.
 * - `disconnect()` always closes the EventSource and clears timers, so
 *   subscriptions clean up properly on unmount or Strict Mode re-run.
 *
 * This module never claims simulated data is live; it only reports status.
 */

import type { TelemetryEvent, Tier } from "../types";

export type StreamStatus = "connecting" | "live" | "fallback";

export interface StreamCallbacks {
  /** Called whenever connection status changes. */
  onStatus: (status: StreamStatus, detail: string) => void;
  /** Called for each structurally valid telemetry frame. */
  onEvent: (event: TelemetryEvent) => void;
}

export interface StreamConnection {
  /** Idempotent teardown — closes the EventSource and clears timers. */
  disconnect: () => void;
}

/** Consecutive invalid frames tolerated before abandoning the stream. */
const MAX_INVALID_FRAMES = 3;
/** Milliseconds to wait for the backend before assuming it is absent. */
const CONNECT_TIMEOUT_MS = 3000;

/* -------------------------------------------------------------------------- */
/* Validation & normalization                                                 */
/* -------------------------------------------------------------------------- */

function isTier(value: unknown): value is Tier {
  return value === 0 || value === 1 || value === 2;
}

/**
 * Validates a raw frame against the expected telemetry schema and returns a
 * normalized event, or `null` if the frame is not usable.
 *
 * Deliberately strict on required fields, lenient on optional ones, so a
 * schema mismatch never surfaces as broken UI — it triggers the fallback.
 */
export function validateFrame(
  raw: unknown,
  index: number,
): TelemetryEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const f = raw as Record<string, unknown>;

  const command = f.command;
  const node = f.node;
  if (typeof command !== "string" || command.trim() === "") return null;
  if (typeof node !== "string" || node.trim() === "") return null;

  // Tier: accept `tier`, or `route` (which may be "hard-block").
  let route: TelemetryEvent["route"];
  if (isTier(f.tier)) route = f.tier;
  else if (f.route === "hard-block") route = "hard-block";
  else if (isTier(f.route)) route = f.route;
  else return null;

  const latencyRaw = f.latencyMs ?? f.latency_ms ?? f.latency;
  if (typeof latencyRaw !== "number" || !Number.isFinite(latencyRaw) || latencyRaw < 0) {
    return null;
  }

  const outcomeRaw = f.outcome;
  let outcome: TelemetryEvent["outcome"];
  if (outcomeRaw === "granted" || outcomeRaw === "allowed" || outcomeRaw === "allow") {
    outcome = "granted";
  } else if (outcomeRaw === "blocked" || outcomeRaw === "denied" || outcomeRaw === "deny") {
    outcome = "blocked";
  } else if (route === "hard-block") {
    outcome = "blocked";
  } else {
    outcome = "granted";
  }

  const taintRaw = f.taint;
  const taint =
    taintRaw === "tainted" || taintRaw === "clean" || taintRaw === "unknown"
      ? taintRaw
      : "unknown";

  const tsRaw = f.timestamp ?? f.ts ?? f.time;
  let timestamp: number;
  if (typeof tsRaw === "number" && Number.isFinite(tsRaw)) {
    timestamp = tsRaw;
  } else if (typeof tsRaw === "string") {
    const parsed = Date.parse(tsRaw);
    if (Number.isNaN(parsed)) return null;
    timestamp = parsed;
  } else {
    timestamp = Date.now();
  }

  const id = typeof f.id === "string" && f.id !== "" ? f.id : `sse-${index}`;
  const provenance =
    typeof f.provenance === "string" && f.provenance !== ""
      ? f.provenance
      : route === "hard-block"
        ? "tainted:unknown"
        : "unknown";
  const detail =
    typeof f.detail === "string" && f.detail !== ""
      ? f.detail
      : "Reported by the live backend SSE stream.";

  return {
    id,
    timestamp,
    node,
    command,
    provenance,
    taint,
    route,
    latencyMs: latencyRaw,
    outcome,
    detail,
  };
}

/* -------------------------------------------------------------------------- */
/* Connection                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Opens the SSE connection. Returns a `StreamConnection` whose `disconnect()`
 * must be called on cleanup. Safe to call in environments without EventSource
 * (falls back immediately).
 */
export function connectTelemetryStream(
  endpoint: string,
  callbacks: StreamCallbacks,
): StreamConnection {
  const { onStatus, onEvent } = callbacks;

  if (typeof window === "undefined" || typeof window.EventSource === "undefined") {
    onStatus(
      "fallback",
      "EventSource is not available in this environment — using simulated demo data.",
    );
    return { disconnect: () => {} };
  }

  let done = false; // true once fallback has been reported (terminal for this attempt)
  let opened = false;
  let invalidFrames = 0;
  let received = 0;
  let es: EventSource | null = null;

  const disconnect = () => {
    done = true;
    if (es) {
      es.onopen = null;
      es.onmessage = null;
      es.onerror = null;
      es.close();
      es = null;
    }
    clearTimeout(timeoutId);
  };

  const goFallback = (detail: string) => {
    if (done) return;
    disconnect();
    onStatus("fallback", detail);
  };

  const timeoutId = setTimeout(() => {
    if (!opened) {
      goFallback(
        `Backend not reachable at ${endpoint} (timeout ${CONNECT_TIMEOUT_MS}ms) — using simulated demo data.`,
      );
    }
  }, CONNECT_TIMEOUT_MS);

  try {
    es = new EventSource(endpoint);
  } catch {
    goFallback(`Could not open ${endpoint} — using simulated demo data.`);
    return { disconnect };
  }

  es.onopen = () => {
    if (done) return;
    opened = true;
    clearTimeout(timeoutId);
    onStatus("live", `Connected to ${endpoint}`);
  };

  es.onmessage = (msg: MessageEvent<string>) => {
    if (done) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(msg.data);
    } catch {
      invalidFrames += 1;
    }
    if (parsed !== undefined) {
      // Tolerate envelopes: `{event: {...}}` or `{data: {...}}`.
      const candidate =
        typeof parsed === "object" && parsed !== null
          ? ((parsed as Record<string, unknown>).event ??
            (parsed as Record<string, unknown>).data ??
            parsed)
          : parsed;
      const normalized = validateFrame(candidate, ++received);
      if (normalized) {
        onEvent(normalized);
        return;
      }
      invalidFrames += 1;
    }
    if (invalidFrames >= MAX_INVALID_FRAMES) {
      goFallback(
        `Stream at ${endpoint} sent ${invalidFrames} invalid frames — using simulated demo data.`,
      );
    }
  };

  es.onerror = () => {
    // EventSource retries automatically; for this demo we treat any error as
    // "backend unavailable" and fall back so the UI never hangs on "connecting".
    goFallback(
      `Connection to ${endpoint} failed — using simulated demo data.`,
    );
  };

  return { disconnect };
}
