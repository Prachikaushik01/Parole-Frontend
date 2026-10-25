"use client";

/**
 * Clipboard copy hook with success/error feedback and automatic reset.
 * Uses the async Clipboard API, with a legacy `execCommand` fallback for
 * non-secure contexts (e.g. plain-http demos).
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface CopyState {
  copied: boolean;
  error: boolean;
  copy: (text: string) => Promise<void>;
}

function legacyCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export function useCopy(resetMs = 2000): CopyState {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      let ok = false;
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          ok = legacyCopy(text);
        }
      } catch {
        ok = legacyCopy(text);
      }
      setCopied(ok);
      setError(!ok);
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        setError(false);
        timeoutRef.current = null;
      }, resetMs);
    },
    [resetMs],
  );

  return { copied, error, copy };
}
