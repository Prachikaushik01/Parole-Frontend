/**
 * PC Setup Guide (/setup) — Calm, beginner-friendly three-step setup wizard.
 *
 * Structure:
 * 1. Compact header & 3-step progress bar.
 * 2. GuidedOnboarding:
 *    - Step 1: Let's prepare your PC
 *    - Step 2: Install PAROLE
 *    - Step 3: Verify your setup
 * 3. Optional section: "Explore a simulated demo" (TerminalSimulator).
 * 4. Collapsed section: "Need help? Troubleshooting and common questions" (TroubleshootingFaq).
 * 5. Footer navigation back to Home and onward to the Governance Cockpit.
 */

import Link from "next/link";
import { ArrowLeft, ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { GuidedOnboarding } from "./guided-onboarding";
import { TerminalSimulator } from "./terminal-simulator";
import { TroubleshootingFaq } from "./troubleshooting-faq";

const WIZARD_STEPS = [
  { step: "1", label: "Prepare your PC", href: "#step-1-prepare" },
  { step: "2", label: "Install PAROLE", href: "#step-2-install" },
  { step: "3", label: "Verify & test SSE example", href: "#step-3-verify" },
] as const;

const RECOMMENDED_JOURNEY = [
  {
    step: "1",
    title: "Try a preset scenario",
    detail: "Run safe browser presets in the simulator below or on the Home sandbox.",
    href: "#simulated-demo",
  },
  {
    step: "2",
    title: "Understand the tier decision",
    detail: "See why commands resolve via Tier 0, Tier 1, Tier 2, or Hard Block.",
    href: "/#three-speed",
  },
  {
    step: "3",
    title: "Read setup instructions",
    detail: "Check verified OS prerequisites and inspect the CLI setup flags.",
    href: "#step-1-prepare",
  },
  {
    step: "4",
    title: "Follow a verified example",
    detail: "Test the live SSE telemetry wire contract at localhost:8000.",
    href: "#step-3-verify",
  },
  {
    step: "5",
    title: "Connect an agent",
    detail: "Review current repo scope vs. full Role 1 policy backend integration.",
    href: "#step-2-install",
  },
] as const;

export function SetupView() {
  return (
    <section
      aria-labelledby="setup-title"
      className="relative overflow-hidden noise-overlay"
    >
      {/* Preserved PAROLE atmosphere: carbon background, subtle grid, soft emerald wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-fine grid-fade atmos-mask opacity-[0.16]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 glow-field opacity-65"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-32 h-[24rem] w-[24rem] rounded-full bg-safe/[0.08] blur-[110px]"
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:gap-9 sm:px-6 sm:py-14">
        {/* Top bar: Breadcrumb + badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb">
            <Link
              href="/"
              className="press inline-flex items-center gap-2 font-mono text-xs tracking-wider text-ink-faint uppercase hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Home
            </Link>
          </nav>

          <span className="inline-flex items-center gap-2 rounded border border-safe/30 bg-safe/5 px-2.5 py-1 font-mono text-[10px] tracking-[0.22em] text-safe uppercase">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-safe" />
            PC Setup Guide
          </span>
        </div>

        {/* Calm Hero Header + Compact 3-Step Strip */}
        <Reveal>
          <header className="flex flex-col gap-4 border-b border-edge pb-6">
            <div className="flex flex-col gap-2">
              <h1
                id="setup-title"
                className="text-2xl font-semibold tracking-[-0.025em] text-ink sm:text-3xl"
              >
                Set up PAROLE on your PC
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-ink-dim">
                Follow the recommended path below to explore PAROLE safely: try a
                preset scenario, understand the routing tier decision, review
                setup prerequisites, test the verified SSE wire contract, and
                connect an agent when supported by your local policy backend.
              </p>
            </div>

            {/* Recommended 5-step onboarding-to-integration path */}
            <div
              aria-label="Recommended setup-to-integration journey"
              className="grid gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-5"
            >
              {RECOMMENDED_JOURNEY.map((item) => (
                <a
                  key={item.step}
                  href={item.href}
                  className="press ring-neutral flex flex-col gap-1 rounded-lg border border-edge bg-surface/80 p-3 text-left transition-colors hover:border-edge-strong hover:bg-raised/50"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-safe uppercase">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-safe/15 text-[10px] font-semibold">
                      {item.step}
                    </span>
                    <span>Step {item.step}</span>
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    {item.title}
                  </span>
                  <span className="text-[11px] leading-4 text-ink-dim">
                    {item.detail}
                  </span>
                </a>
              ))}
            </div>

            <nav aria-label="Setup wizard steps">
              <ol className="flex flex-wrap items-center gap-2 pt-1">
                {WIZARD_STEPS.map(({ step, label, href }, index) => (
                  <li key={step} className="flex items-center gap-2">
                    <a
                      href={href}
                      className="press ring-neutral inline-flex items-center gap-2 rounded-md border border-edge bg-surface/80 px-3 py-1.5 text-xs text-ink-dim hover:border-edge-strong hover:text-ink"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-safe/15 font-mono text-[10px] font-medium text-safe">
                        {step}
                      </span>
                      <span className="font-medium text-ink">{label}</span>
                    </a>
                    {index < WIZARD_STEPS.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="hidden font-mono text-xs text-ink-faint sm:inline"
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </nav>
          </header>
        </Reveal>

        {/* Three-step Setup Wizard: Prepare your PC → Install PAROLE → Verify your setup */}
        <GuidedOnboarding />

        {/* Optional section after the three setup steps: Explore a simulated demo */}
        <Reveal delay={0.12}>
          <section
            id="simulated-demo"
            aria-labelledby="simulated-demo-title"
            className="scroll-mt-20 overflow-hidden rounded-xl border border-edge bg-surface/90 p-5 shadow-[0_18px_44px_-32px_rgb(0_0_0/0.85)] sm:p-6"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-safe uppercase">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Optional Learning Tool
                  </span>
                  <h2
                    id="simulated-demo-title"
                    className="text-lg font-semibold tracking-[-0.015em] text-ink sm:text-xl"
                  >
                    Explore a simulated demo
                  </h2>
                  <p className="max-w-2xl text-xs leading-5 text-ink-dim sm:text-sm">
                    You can try these four examples right in your browser without
                    installing PAROLE. Every result below is a safe simulation and
                    does not test your local setup.
                  </p>
                </div>

                <span className="rounded border border-tier2/45 bg-tier2/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-tier2 uppercase">
                  Simulated Demo
                </span>
              </div>

              <TerminalSimulator />
            </div>
          </section>
        </Reveal>

        {/* Collapsed troubleshooting section out of the main flow */}
        <Reveal delay={0.15}>
          <TroubleshootingFaq />
        </Reveal>

        {/* Footer navigation */}
        <Reveal delay={0.18}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4">
            <Link
              href="/"
              className="press ring-neutral inline-flex items-center gap-2 rounded border border-edge bg-surface px-3.5 py-2 font-mono text-xs tracking-wider text-ink-dim uppercase hover:border-edge-strong hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Home
            </Link>
            <Link
              href="/cockpit"
              className="press ring-emerald inline-flex items-center gap-2 rounded border border-safe/50 bg-safe/15 px-3.5 py-2 font-mono text-xs tracking-wider text-safe uppercase hover:bg-safe/25"
            >
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              Open Governance Cockpit
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
