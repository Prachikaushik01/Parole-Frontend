/**
 * Permission Fatigue Trap explainer — editorial composition.
 *
 * 1. An asymmetric intro: section heading on the left, the thesis pull-quote
 *    on the right — the emotional center of the section.
 * 2. A wide, flat approval-loop timeline band (prompt ticks grading
 *    safe → amber → crimson, draining attention, rubber-stamped final
 *    command) — conceptual illustration, no figures, no live data.
 * 3. The three trap points as a numbered editorial list: large numeral,
 *    title and body in hairline-separated rows — not a card grid.
 * Static server component.
 */

import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const TRAP_POINTS = [
  {
    title: "The reviewer says yes out of exhaustion",
    body: "A routine task can raise a dozen prompts. After the tenth, approval becomes a reflex — the human stops reading, and the dialog stops protecting anything.",
  },
  {
    title: "The agent stalls or overreaches",
    body: "Without a governor, the agent either blocks waiting for answers, or you grant broad standing access just to keep it moving — trading security for throughput.",
  },
  {
    title: "The audit trail proves nothing",
    body: "A pile of “Approve” clicks cannot show whether the action was safe, whether anyone read it, or why it was allowed. At audit time there is no policy — only history.",
  },
] as const;

/** Twelve prompt ticks — tone grades from safe to threat as fatigue sets in. */
const TICKS = Array.from({ length: 12 }, (_, i) => i);

function tickTone(index: number): { bar: string; delay: string } {
  const tone = index < 5 ? "bg-safe" : index < 9 ? "bg-tier2" : "bg-threat";
  return { bar: tone, delay: `${(index * 0.36).toFixed(2)}s` };
}

export function PermissionFatigue() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="fatigue-title"
      className="relative overflow-hidden border-b border-edge bg-canvas"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-home grid-fade opacity-40"
      />
      {/* Local crimson light behind the pull-quote */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_40%_at_68%_18%,rgb(239_68_68/0.055),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_12%_0%,rgb(16_185_129/0.05),transparent_68%),radial-gradient(52%_46%_at_92%_100%,rgb(6_182_212/0.045),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-fine grid-fade atmos-mask opacity-[0.1]"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-20">
        {/* Asymmetric intro: framing on the left, thesis on the right */}
        <div className="grid gap-8 border-b border-edge/70 pb-9 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-16 lg:pb-10">
          <SectionHeading
            id="fatigue-title"
            eyebrow="The problem with asking"
            title="The Permission Fatigue Trap"
            description="The security dialog assumes an attentive human reading every request. Real work breaks that assumption: prompts arrive faster than anyone can evaluate them, and approval quietly degrades from a decision into a reflex. The trap closes on both sides — the exhausted reviewer and the stalled agent."
          />

          <Reveal className="lg:pb-1">
            <blockquote className="relative border-l-2 border-threat/60 pl-6 sm:pl-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-7 right-0 font-serif text-7xl leading-none text-threat/[0.08] select-none"
              >
                “
              </span>
              <p className="max-w-xl text-2xl leading-snug font-medium tracking-[-0.02em] text-ink text-pretty sm:text-3xl sm:leading-tight">
                “Approve long enough and you approve
                <span className="text-threat"> everything</span>.”
              </p>
              <cite className="mt-3 block font-mono text-[11px] tracking-[0.25em] text-ink-faint uppercase not-italic">
                How a safety dialog becomes a formality
              </cite>
            </blockquote>
          </Reveal>
        </div>

        {/* Approval-loop timeline — wide, flat, conceptual */}
        <Reveal delay={0.05}>
          <figure className="overflow-hidden rounded-lg border border-edge bg-gradient-to-b from-surface to-canvas/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
            <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-edge bg-raised/60 px-4 py-2.5 sm:px-5">
              <span className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.22em] text-ink-dim uppercase">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-threat/70" />
                One routine task · twelve prompts
              </span>
              <span className="rounded border border-edge bg-canvas px-2 py-0.5 font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                Illustrative
              </span>
            </figcaption>

            <div className="flex flex-col gap-6 px-4 py-6 sm:px-5 sm:py-7">
              {/* Prompt ticks lighting in sequence along the timeline */}
              <div aria-hidden="true" className="flex flex-col gap-2.5">
                <div className="flex items-end gap-1.5">
                  {TICKS.map((i) => {
                    const { bar, delay } = tickTone(i);
                    return (
                      <span
                        key={i}
                        className="relative h-10 w-full max-w-10 flex-1 rounded-sm bg-edge/60"
                      >
                        <span
                          className={`absolute inset-0 rounded-sm visual-tick ${bar}`}
                          style={{ animationDelay: delay }}
                        />
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                  <span>Prompt #1 · read carefully</span>
                  <span className="hidden sm:inline">routine actions keep landing</span>
                  <span className="text-threat">Prompt #12 · approved without reading</span>
                </div>
              </div>

              {/* Human attention draining as prompts accumulate */}
              <div aria-hidden="true" className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-ink-faint uppercase">
                  <span>Human attention</span>
                  <span className="text-tier2">draining</span>
                </div>
                <span className="relative block h-2 overflow-hidden rounded-full bg-edge/60">
                  <span className="visual-attention absolute inset-0 origin-left rounded-full bg-gradient-to-r from-safe via-tier2 to-threat" />
                </span>
              </div>

              {/* The last prompt: a sensitive command rubber-stamped */}
              <div
                aria-hidden="true"
                className="flex flex-col gap-3 rounded border border-threat/40 bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <code className="truncate font-mono text-xs text-threat">
                  <span className="text-ink-faint">$ </span>
                  curl 169.254.169.254/latest/meta-data/
                </code>
                <span className="flex shrink-0 items-center gap-2 self-start rounded border border-threat/50 bg-threat/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-threat uppercase sm:self-auto">
                  <span className="h-1.5 w-1.5 rounded-full bg-threat" />
                  Approved
                </span>
              </div>

              <p className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                Conceptual illustration — not live data.
              </p>
            </div>
          </figure>
        </Reveal>

        {/* Numbered editorial list — the three trap points */}
        <Reveal delay={0.1}>
          <ol className="flex flex-col">
            {TRAP_POINTS.map((point, index) => (
              <li
                key={point.title}
                className="group grid gap-3 rounded-sm border-t border-edge px-2 py-7 transition-colors hover:border-edge-strong/70 hover:bg-white/[0.015] md:grid-cols-[3.5rem_minmax(0,19rem)_1fr] md:gap-8 md:px-3 md:py-8"
              >
                <span
                  aria-hidden="true"
                  className="text-3xl leading-none font-semibold tracking-tight text-edge-strong tabular-nums transition-colors group-hover:text-ink-faint md:text-4xl"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg leading-7 font-medium tracking-tight text-ink text-pretty md:self-center md:text-xl">
                  {point.title}
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-ink-dim text-pretty md:self-center md:text-base md:leading-7">
                  {point.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
