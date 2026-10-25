"use client";

/**
 * Guided three-step wizard flow for the PAROLE PC Setup Guide (/setup).
 *
 * Step 1 — Let's prepare your PC
 * Step 2 — Install PAROLE
 * Step 3 — Verify your setup
 */

import { useState } from "react";
import {
  ArrowDown,
  ChevronDown,
  FileWarning,
  Info,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wifi,
  WifiOff,
} from "lucide-react";
import { SENSITIVE_TARGETS, SETUP_COMMAND, SSE_ENDPOINT } from "@/lib/constants";
import { useTelemetry } from "@/lib/telemetry/store";
import { CopyButton } from "@/components/home/copy-button";
import { Reveal } from "@/components/ui/reveal";
import {
  PLATFORM_GUIDES,
  Step1PrepareContent,
  type PlatformId,
} from "./platform-selector";

const MANUAL_STREAM_CHECK_CMD = `curl -i ${SSE_ENDPOINT}`;

const VERIFIED_SSE_SERVER_CMD = `node -e "require('http').createServer((req,res)=>{if(req.url==='/v1/policy/stream'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});const send=()=>res.write('data: '+JSON.stringify({id:'sse-verify-'+Date.now(),node:'local-verify-node',command:'git status',route:0,latencyMs:1.4,outcome:'granted',taint:'clean',provenance:'local:workspace',detail:'Verified end-to-end SSE frame from local Node.js test stream.'})+'\\n\\n');send();const t=setInterval(send,3000);req.on('close',()=>clearInterval(t));}else{res.writeHead(404);res.end();}}).listen(8000,'127.0.0.1',()=>console.log('PAROLE test SSE stream listening at http://localhost:8000/v1/policy/stream'))"`;

const VERIFIED_SSE_EXPECTED_FRAME = `data: {"id":"sse-verify-1730000000000","node":"local-verify-node","command":"git status","route":0,"latencyMs":1.4,"outcome":"granted","taint":"clean","provenance":"local:workspace","detail":"Verified end-to-end SSE frame from local Node.js test stream."}`;

const FLAG_EXPLANATIONS = [
  {
    flag: "init",
    detail: "Sets up PAROLE permission checks in your current project folder.",
  },
  {
    flag: "--agent=opencode",
    detail:
      "Connects PAROLE to OpenCode (your AI coding agent) so its commands are checked before running.",
  },
  {
    flag: "--sandbox=nemoclaw",
    detail: `Enables NemoClaw (PAROLE's safety sandbox) to protect sensitive paths like ${SENSITIVE_TARGETS.map((t) => t.pattern).join(", ")}.`,
  },
] as const;

export function GuidedOnboarding() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("windows");
  const [showFlagDetails, setShowFlagDetails] = useState<boolean>(false);
  const [showManualVerifyCmd, setShowManualVerifyCmd] = useState<boolean>(false);

  const { source, isSimulated } = useTelemetry();

  const activePlatformGuide =
    PLATFORM_GUIDES.find((p) => p.id === selectedPlatform) ?? PLATFORM_GUIDES[0];

  const isLiveBackend = source === "live" && !isSimulated;

  return (
    <ol className="relative flex flex-col gap-6 sm:gap-8">
      {/* ================================================================== */}
      {/* STEP 1 — Prepare your PC                                           */}
      {/* ================================================================== */}
      <li id="step-1-prepare" className="relative scroll-mt-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-12 -bottom-6 left-5 hidden w-px bg-gradient-to-b from-safe/50 via-edge-strong to-safe/50 sm:-bottom-8 sm:block"
        />

        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative z-10 flex items-center gap-3 sm:flex-col">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-edge-strong bg-raised font-mono text-sm font-semibold text-ink tabular-nums">
                01
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-safe uppercase sm:hidden">
                STEP 1
              </span>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-edge bg-surface/90 p-5 shadow-[0_18px_44px_-32px_rgb(0_0_0/0.85)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="hidden font-mono text-[11px] tracking-[0.22em] text-safe uppercase sm:inline">
                      STEP 1 OF 3
                    </span>
                    <h2 className="text-lg font-semibold text-ink sm:text-xl">
                      Let&apos;s prepare your PC
                    </h2>
                    <p className="text-sm leading-6 text-ink-dim">
                      We&apos;ll check what you need before installing PAROLE.
                    </p>
                  </div>
                </div>

                <Step1PrepareContent
                  selectedPlatform={selectedPlatform}
                  onSelectPlatform={setSelectedPlatform}
                />

                <div className="flex flex-wrap items-center justify-end border-t border-edge pt-4">
                  <a
                    href="#step-2-install"
                    className="press ring-emerald inline-flex items-center gap-2 rounded border border-safe/50 bg-safe/15 px-4 py-2 font-mono text-xs tracking-wider text-safe uppercase hover:bg-safe/25"
                  >
                    <span>Continue to installation</span>
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </li>

      {/* ================================================================== */}
      {/* STEP 2 — Install PAROLE                                            */}
      {/* ================================================================== */}
      <li id="step-2-install" className="relative scroll-mt-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-12 -bottom-6 left-5 hidden w-px bg-gradient-to-b from-safe/60 via-edge-strong to-edge sm:-bottom-8 sm:block"
        />

        <Reveal delay={0.05}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative z-10 flex items-center gap-3 sm:flex-col">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-safe/60 bg-safe text-canvas font-mono text-sm font-semibold tabular-nums shadow-[0_0_28px_-6px_rgb(16_185_129/0.65)]">
                02
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-safe uppercase sm:hidden">
                STEP 2
              </span>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-safe/45 bg-surface p-5 shadow-[0_24px_60px_-32px_rgb(16_185_129/0.25)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="hidden font-mono text-[11px] tracking-[0.22em] text-safe uppercase sm:inline">
                      STEP 2 OF 3
                    </span>
                    <h2 className="text-lg font-semibold text-ink sm:text-xl">
                      Install PAROLE
                    </h2>
                  </div>
                  <span className="rounded border border-tier2/45 bg-tier2/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-tier2 uppercase">
                    Proposed command — installation not verified
                  </span>
                </div>

                {/* Three simple instructions */}
                <ol className="flex flex-col gap-2 text-sm text-ink-dim">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-edge-strong bg-canvas font-mono text-xs text-ink">
                      1
                    </span>
                    <span>
                      Open the appropriate terminal for{" "}
                      <strong className="font-medium text-ink">
                        {activePlatformGuide.label}
                      </strong>{" "}
                      ({activePlatformGuide.howToOpenTerminal})
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-edge-strong bg-canvas font-mono text-xs text-ink">
                      2
                    </span>
                    <span>
                      Navigate to your project folder (for example{" "}
                      <code className="font-mono text-xs text-ink">
                        cd ~/your-project
                      </code>
                      ).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-edge-strong bg-canvas font-mono text-xs text-ink">
                      3
                    </span>
                    <span>
                      Copy the command below, paste it into the terminal, and press{" "}
                      <strong className="font-medium text-ink">Enter</strong>.
                    </span>
                  </li>
                </ol>

                {/* Command Box + Copy Button */}
                <div className="flex flex-col gap-3 rounded-xl border border-safe/40 bg-canvas p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Terminal
                        className="h-4 w-4 shrink-0 text-safe"
                        aria-hidden="true"
                      />
                      <code className="min-w-0 font-mono text-xs break-all text-ink sm:text-sm">
                        {SETUP_COMMAND}
                      </code>
                    </div>
                    <CopyButton
                      text={SETUP_COMMAND}
                      label="Copy installation command"
                      className="self-start sm:self-auto"
                    />
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-ink-faint">
                    <Info
                      className="h-3.5 w-3.5 shrink-0 text-safe"
                      aria-hidden="true"
                    />
                    <span>
                      Copying only places the command on your clipboard — it does
                      not execute anything on your PC.
                    </span>
                  </p>
                </div>

                {/* Concise package verification status */}
                <div className="flex items-start gap-2.5 rounded-lg border border-tier2/35 bg-tier2/[0.05] px-3.5 py-2.5 text-xs leading-5 text-ink-dim">
                  <FileWarning
                    className="mt-0.5 h-4 w-4 shrink-0 text-tier2"
                    aria-hidden="true"
                  />
                  <p>
                    <strong className="font-medium text-ink">
                      Proposed command — installation not verified:
                    </strong>{" "}
                    This repository contains the standalone Next.js frontend. The{" "}
                    <code className="font-mono text-ink">@parole/governor</code>{" "}
                    CLI/backend package publication must be confirmed separately.
                  </p>
                </div>

                {/* Expandable flag details (collapsed by default) */}
                <div className="overflow-hidden rounded-lg border border-edge bg-canvas/75">
                  <button
                    type="button"
                    onClick={() => setShowFlagDetails((prev) => !prev)}
                    aria-expanded={showFlagDetails}
                    aria-controls="step2-flag-details"
                    className="press flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-raised/40"
                  >
                    <span className="font-mono text-xs text-ink-dim">
                      What do the command flags mean?
                    </span>
                    <ChevronDown
                      className={[
                        "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-150",
                        showFlagDetails ? "rotate-180 text-safe" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>

                  {showFlagDetails ? (
                    <div
                      id="step2-flag-details"
                      className="flex flex-col gap-2 border-t border-edge/70 bg-surface/60 px-4 py-3 text-xs leading-5 text-ink-dim"
                    >
                      {FLAG_EXPLANATIONS.map((item) => (
                        <p key={item.flag}>
                          <code className="rounded border border-edge bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-safe">
                            {item.flag}
                          </code>{" "}
                          — {item.detail}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-end border-t border-edge pt-4">
                  <a
                    href="#step-3-verify"
                    className="press ring-emerald inline-flex items-center gap-2 rounded border border-safe/50 bg-safe/15 px-4 py-2 font-mono text-xs tracking-wider text-safe uppercase hover:bg-safe/25"
                  >
                    <span>Continue to verification</span>
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </li>

      {/* ================================================================== */}
      {/* STEP 3 — Verify your setup                                         */}
      {/* ================================================================== */}
      <li id="step-3-verify" className="relative scroll-mt-20">
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative z-10 flex items-center gap-3 sm:flex-col">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-edge-strong bg-raised font-mono text-sm font-semibold text-ink tabular-nums">
                03
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-safe uppercase sm:hidden">
                STEP 3
              </span>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-edge bg-surface/90 p-5 shadow-[0_18px_44px_-32px_rgb(0_0_0/0.85)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="hidden font-mono text-[11px] tracking-[0.22em] text-safe uppercase sm:inline">
                      STEP 3 OF 3
                    </span>
                    <h2 className="text-lg font-semibold text-ink sm:text-xl">
                      Verify your setup
                    </h2>
                  </div>
                  <span className="rounded border border-edge bg-canvas px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink-dim uppercase">
                    Verification guide
                  </span>
                </div>

                {/* Two concise sections: Check the real installation vs. Explore the browser demo */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 1. Check the real installation */}
                  <div className="flex flex-col justify-between gap-3 rounded-lg border border-edge bg-canvas/85 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                          <ShieldCheck
                            className="h-4 w-4 text-safe"
                            aria-hidden="true"
                          />
                          Check the real installation
                        </span>

                        {source === "connecting" ? (
                          <span className="inline-flex items-center gap-1.5 rounded border border-edge bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-dim uppercase">
                            <LoaderCircle
                              className="h-3 w-3 animate-spin"
                              aria-hidden="true"
                            />
                            Checking…
                          </span>
                        ) : isLiveBackend ? (
                          <span className="inline-flex items-center gap-1.5 rounded border border-safe/45 bg-safe/10 px-2 py-0.5 font-mono text-[10px] text-safe uppercase">
                            <Wifi className="h-3 w-3" aria-hidden="true" />
                            Backend Stream Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded border border-edge-strong bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-dim uppercase">
                            <WifiOff className="h-3 w-3" aria-hidden="true" />
                            Local Backend Not Detected
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-5 text-ink-dim">
                        {isLiveBackend ? (
                          <>
                            Connected to the local policy stream at{" "}
                            <code className="font-mono text-ink">{SSE_ENDPOINT}</code>.
                          </>
                        ) : (
                          <>
                            <strong>Verification guide:</strong> A browser-based CLI
                            installation check is not implemented in this frontend-only
                            repository, and no local backend stream was detected at{" "}
                            <code className="font-mono text-ink">{SSE_ENDPOINT}</code>.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Expandable manual curl check */}
                    <div className="border-t border-edge/60 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setShowManualVerifyCmd((prev) => !prev)}
                        aria-expanded={showManualVerifyCmd}
                        aria-controls="step3-manual-check"
                        className="press inline-flex items-center gap-1 font-mono text-[11px] text-safe hover:underline"
                      >
                        <span>
                          {showManualVerifyCmd
                            ? "Hide manual backend check"
                            : "Running the local backend? Check manually"}
                        </span>
                        <ChevronDown
                          className={[
                            "h-3.5 w-3.5 transition-transform duration-150",
                            showManualVerifyCmd ? "rotate-180" : "",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </button>

                      {showManualVerifyCmd ? (
                        <div
                          id="step3-manual-check"
                          className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded border border-edge bg-surface p-2.5"
                        >
                          <code className="font-mono text-xs text-ink">
                            $ {MANUAL_STREAM_CHECK_CMD}
                          </code>
                          <CopyButton
                            text={MANUAL_STREAM_CHECK_CMD}
                            label="Copy manual backend check command"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* 2. Explore the browser demo */}
                  <div className="flex flex-col justify-between gap-3 rounded-lg border border-edge bg-canvas/85 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                          <Sparkles
                            className="h-4 w-4 text-safe"
                            aria-hidden="true"
                          />
                          Explore the browser demo
                        </span>
                        <span className="rounded border border-tier2/45 bg-tier2/10 px-2 py-0.5 font-mono text-[10px] text-tier2 uppercase">
                          Simulated Demo
                        </span>
                      </div>

                      <p className="text-xs leading-5 text-ink-dim">
                        Want to see how PAROLE evaluates commands right now? Try the
                        interactive simulator below — it runs safely in your browser
                        using labeled simulated data and does not require a local
                        installation.
                      </p>
                    </div>

                    <div className="flex items-center justify-end border-t border-edge/60 pt-2.5">
                      <a
                        href="#simulated-demo"
                        className="press ring-emerald inline-flex items-center gap-2 rounded border border-safe/50 bg-safe/15 px-3.5 py-1.5 font-mono text-xs tracking-wider text-safe uppercase hover:bg-safe/25"
                      >
                        <span>Explore a simulated demo</span>
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Verified Minimal End-to-End Example (SSE Wire Contract) */}
                <div className="flex flex-col gap-3 rounded-lg border border-edge bg-canvas/85 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-safe uppercase">
                        Verified in this repository · src/lib/telemetry/sse-client.ts
                      </span>
                      <h3 className="text-sm font-semibold text-ink">
                        Minimal end-to-end SSE verification example
                      </h3>
                    </div>
                    <span className="rounded border border-safe/35 bg-safe/10 px-2 py-0.5 font-mono text-[10px] text-safe uppercase">
                      Runnable with Node.js
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-ink-dim">
                    While the external <code className="font-mono text-ink">@parole/governor</code>{" "}
                    CLI is not bundled in this frontend repository, the{" "}
                    <code className="font-mono text-ink">EventSource</code> client in{" "}
                    <code className="font-mono text-ink">sse-client.ts</code> is
                    fully implemented. You can verify live end-to-end telemetry
                    streaming right now by running this dependency-free Node.js
                    one-liner in a second terminal and refreshing this page:
                  </p>

                  <div className="flex flex-col gap-2 rounded-lg border border-edge bg-surface p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-ink-faint uppercase">
                        1. Start a local test SSE stream on port 8000
                      </span>
                      <CopyButton
                        text={VERIFIED_SSE_SERVER_CMD}
                        label="Copy verified Node.js SSE stream command"
                      />
                    </div>
                    <code className="block overflow-x-auto font-mono text-[11px] leading-5 text-ink">
                      $ {VERIFIED_SSE_SERVER_CMD}
                    </code>
                  </div>

                  <div className="flex flex-col gap-1.5 rounded-lg border border-edge bg-surface/60 p-3">
                    <span className="font-mono text-[10px] text-ink-faint uppercase">
                      2. Expected SSE wire frame &amp; UI behavior
                    </span>
                    <code className="block overflow-x-auto font-mono text-[11px] leading-5 text-safe">
                      {VERIFIED_SSE_EXPECTED_FRAME}
                    </code>
                    <p className="text-[11px] leading-5 text-ink-dim">
                      <strong>Expected output:</strong> The terminal prints{" "}
                      <code className="font-mono text-ink">
                        PAROLE test SSE stream listening at http://localhost:8000/v1/policy/stream
                      </code>
                      , the status badge above switches to{" "}
                      <strong className="font-medium text-safe">
                        Backend Stream Connected
                      </strong>
                      , and the Governance Cockpit displays{" "}
                      <strong className="font-medium text-safe">
                        LIVE SSE TELEMETRY
                      </strong>{" "}
                      with incoming <code className="font-mono text-ink">local-verify-node</code>{" "}
                      events every 3 seconds. Press <kbd className="rounded border border-edge px-1 font-mono text-[10px] text-ink">Ctrl+C</kbd> in your terminal to stop.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </li>
    </ol>
  );
}
