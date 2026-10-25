/**
 * Shared section heading: restrained eyebrow + h2 + optional description.
 * The caller's <section> links to it via `aria-labelledby={id}`.
 */

interface SectionHeadingProps {
  /** DOM id for the heading — must match the section's aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** "threat" (crimson) marks problem framing; "safe" (emerald) marks PAROLE. */
  eyebrowTone?: "safe" | "threat";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  eyebrowTone = "safe",
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className={[
          "font-mono text-xs font-medium tracking-[0.04em]",
          eyebrowTone === "threat" ? "text-threat" : "text-safe",
        ].join(" ")}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className="max-w-[38rem] text-balance text-2xl leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[28px]"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-[40rem] text-[15px] leading-relaxed text-ink-dim text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}
