/**
 * PC Setup route (/setup) — dedicated page for the install command and
 * backend-vs-demo explanation. The former on-page home section moved here.
 */

import type { Metadata } from "next";
import { SetupView } from "@/components/setup/setup-view";

export const metadata: Metadata = {
  title: "PC Setup Guide — PAROLE",
  description:
    "Install the PAROLE governor on your PC: one command wires your agent with the OpenCode adapter and NemoClaw sandbox. Honest details on the optional policy backend vs. labeled simulated demo data.",
};

export default function SetupPage() {
  return <SetupView />;
}
