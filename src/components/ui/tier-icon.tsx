import type { ComponentType } from "react";
import { BrainCircuit } from "lucide-react";
import type { LucideProps } from "lucide-react";

/**
 * PicoClaw Icon (Tier 0)
 * Clean, minimal, monochrome outline/vector version of the official PicoClaw crab symbol.
 * Single emerald green stroke (#10b981) matching the Tier 0 accent and line-art style.
 */
export function PicoClawIcon({
  className,
  size = 16,
  width,
  height,
  stroke = "#10b981",
  strokeWidth = 1.75,
  ...props
}: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width ?? size}
      height={height ?? size}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Antennae */}
      <path d="M12.5 5C12 3 10.8 1.8 9.5 2C8.5 2.2 8.8 3.8 9.8 3.8" />
      <path d="M15.5 5C16 3 17.2 1.8 18.5 2C19.5 2.2 19.2 3.8 18.2 3.8" />

      {/* Eyes */}
      <circle cx="12.5" cy="6.5" r="1.5" />
      <circle cx="12.7" cy="6.5" r="0.4" fill={stroke} />
      <circle cx="15.8" cy="6.5" r="1.5" />
      <circle cx="16" cy="6.5" r="0.4" fill={stroke} />

      {/* Arched Carapace Body & Ribs */}
      <path d="M11 7.5C8.8 8 6.5 9.8 5 12C3.8 13.8 3.2 16 2.8 18.5" />
      <path d="M9.5 9.5C7.8 11.5 6.2 14 5.5 17" />
      <path d="M8 12C6.8 14 5.8 16.2 5.2 18.2" />

      {/* Fan Tail */}
      <path d="M2.8 18.5C1.8 19.5 1 20.8 0.6 22C1.8 21.6 3 20.8 3.8 19.8" />
      <path d="M2.8 18.5C2.8 20.2 3.1 21.5 3.5 22.5C4.2 21.5 4.8 20.4 5.2 19.4" />
      <path d="M4.5 19C5 20.4 5.8 21.4 6.5 22.2C6.8 21.2 7 20.2 7 19.2" />

      {/* Big Front Claw (curving up and cradling the chip) */}
      <path d="M9.8 13.2C9.5 11.5 11.2 10.2 13.2 10.2C15.2 10.2 16.2 11.2 15.8 12.5C14.8 14.5 11.2 17 9.2 16.5C8 16 8 14.2 9.8 13.2Z" />

      {/* Right Claw */}
      <path d="M18.5 8.5C20.5 9 22.5 10 23.4 11.5C23.4 13.2 22 14.2 20.2 13.8C19 13.5 18.2 12.2 17.8 10.8" />
      <path d="M20.8 11C22 10.5 22.8 11 23.2 11.5" />

      {/* Microchip & Circuit Lines held by claws */}
      <rect x="13.2" y="11" width="4" height="4" rx="0.5" />
      {/* Pins */}
      <path d="M14.5 10V11M16 10V11M14.5 15V16M16 15V16M12.2 12.2H13.2M12.2 13.8H13.2M17.2 12.2H18.2M17.2 13.8H18.2" />
      {/* Stylized 'P' on chip */}
      <path d="M14.5 13.8V12H15.5C15.9 12 16.2 12.3 16.2 12.6C16.2 12.9 15.9 13.2 15.5 13.2H14.5" />
    </svg>
  );
}

/**
 * TypeSafe Jev Icon (Tier 1)
 * Geometric interlocking hexagon symbol for TypeSafe AI / Jev.
 * Crisp vector SVG with exact isometric proportions and evenodd fill rule.
 */
export function TypeSafeJevIcon({
  className,
  size = 16,
  width,
  height,
  ...props
}: LucideProps) {
  return (
    <svg
      viewBox="0 0 159 221"
      width={width ?? size}
      height={height ?? size}
      fill="currentColor"
      fillRule="evenodd"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M 79 1 L 1 47 L 1 131 L 37 153 L 37 194 L 77 217 L 154 172 L 154 87 L 118 65 L 118 25 Z M 134 170 L 78 203 L 57 191 L 113 157 Z M 21 130 L 42 117 L 63 129 L 43 142 Z M 120 81 L 141 94 L 141 157 L 120 145 Z M 105 81 L 105 145 L 49 178 L 49 154 L 83 134 L 83 94 Z M 50 81 L 70 93 L 70 117 L 50 105 Z M 57 68 L 78 56 L 98 68 L 78 80 Z M 85 21 L 106 33 L 106 56 L 85 44 Z M 71 21 L 71 45 L 36 66 L 36 105 L 15 117 L 15 53 Z" />
    </svg>
  );
}

/**
 * PAROLE Three-Speed Architecture Tier Icons:
 * - Tier 0 (Local Cache): PicoClaw — monochrome line-art crab mascot with microchip (<2ms)
 * - Tier 1 (Risk Scoring): TypeSafe Jev — interlocking geometric symbol (95–100ms)
 * - Tier 2 (Cloud Synthesis): BrainCircuit — advanced multi-model synthesis (1.5–3s, unchanged)
 */
export const TIER_ICONS: Record<number, ComponentType<LucideProps>> = {
  0: PicoClawIcon,
  1: TypeSafeJevIcon,
  2: BrainCircuit,
};

export interface TierIconProps extends LucideProps {
  tier: number;
}

export function TierIcon({ tier, ...props }: TierIconProps) {
  const Icon = TIER_ICONS[tier] ?? BrainCircuit;
  return <Icon {...props} />;
}
