/**
 * Shared cockpit panel shell.
 *
 * A compact bordered surface with a mono title bar and optional right-hand
 * meta slot. Every cockpit section uses it so spacing, borders and headers
 * stay consistent without repeating markup. Depth comes from a subtle top
 * light catch and a soft shadow only — no layout or size changes.
 */

import type { ReactNode } from "react";

interface CockpitPanelProps {
  /** Mono uppercase panel title. */
  title: string;
  /** Optional small label rendered before the title. */
  eyebrow?: string;
  /** Optional right-aligned header content (chips, counts, captions). */
  meta?: ReactNode;
  /** Panel body; defaults to padded content. */
  children: ReactNode;
  /** Extra classes for the outer <section> (grid spans, tints). */
  className?: string;
  /** Extra classes for the body wrapper. */
  bodyClassName?: string;
}

export function CockpitPanel({
  title,
  eyebrow,
  meta,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: CockpitPanelProps) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-lg border border-edge bg-surface shadow-[inset_0_1px_0_rgb(255_255_255/0.03),0_18px_44px_-34px_rgb(0_0_0/0.85)] ${className}`}
    >
      <div className="relative flex min-h-11 flex-wrap items-center justify-between gap-2.5 border-b border-edge bg-raised/60 px-4 py-2.5 sm:px-5">
        {/* Faint light catch along the title bar */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
        />
        <div className="flex min-w-0 items-center gap-2.5">
          {eyebrow ? (
            <span className="shrink-0 rounded border border-edge/80 bg-canvas/60 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.2em] text-ink-faint uppercase">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="truncate font-mono text-xs font-medium tracking-[0.18em] text-ink uppercase">
            {title}
          </h2>
        </div>
        {meta ? <div className="flex shrink-0 flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </section>
  );
}
