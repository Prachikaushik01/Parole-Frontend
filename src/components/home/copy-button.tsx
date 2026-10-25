"use client";

/**
 * Copy-to-clipboard button with visible state change and an `aria-live`
 * announcement ("Copied" / "Copy failed").
 */

import { Check, Copy, TriangleAlert } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

interface CopyButtonProps {
  text: string;
  /** Accessible name for the idle state. */
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy command", className = "" }: CopyButtonProps) {
  const { copied, error, copy } = useCopy();

  const announcement = copied ? "Copied to clipboard" : error ? "Copy failed" : "";

  return (
    <>
      <button
        type="button"
        onClick={() => void copy(text)}
        aria-label={copied ? "Copied to clipboard" : error ? "Copy failed" : label}
        className={[
          "press inline-flex shrink-0 items-center gap-2 rounded border px-3 py-2 font-mono text-xs tracking-wider uppercase",
          error
            ? "ring-red border-threat/50 bg-threat/10 text-threat"
            : copied
              ? "ring-emerald border-safe/50 bg-safe/10 text-safe"
              : "ring-neutral border-edge bg-raised text-ink-dim hover:border-edge-strong hover:text-ink",
          className,
        ].join(" ")}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : error ? (
          <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span>{copied ? "Copied" : error ? "Copy failed" : "Copy"}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
