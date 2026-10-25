/**
 * PAROLE Home Page — Consolidated 4-Section Layout:
 * 1. Hero + automatic interactive workflow visualization
 * 2. Three-Speed Architecture + Hard Security Boundary
 * 3. Interactive Quick Tests (simulated presets)
 * 4. Compact Get Started CTA
 */

import { Hero } from "@/components/home/hero";
import { ThreeSpeedArchitecture } from "@/components/home/three-speed-architecture";
import { QuickTestPresets } from "@/components/home/quick-test-presets";
import { GetStarted } from "@/components/home/get-started";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <ThreeSpeedArchitecture />
      <QuickTestPresets />
      <GetStarted />
    </div>
  );
}
