import React from "react";

export interface ParoleEmblemProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  title?: string;
}

/**
 * PAROLE Minimalist Police Guardian Symbol
 *
 * Professional, human-designed brand identity for AI security:
 * - Minimal peaked police service cap with clean geometric badge in emerald (#10b981)
 * - Distinctive visor brim curve
 * - Negative space face silhouette with clean jawline and chin contour
 * - Refined, minimal collar with restrained emerald tie nexus
 * - Pure vector geometry, flat #f4f4f5 white and #10b981 emerald, transparent background
 */
export function ParoleEmblem({
  size,
  className = "",
  title,
  ...props
}: ParoleEmblemProps) {
  const ariaProps = title
    ? { role: "img", "aria-label": title }
    : { "aria-hidden": true as const };

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      {...ariaProps}
      {...props}
    >
      {title && <title>{title}</title>}

      {/* Police Cap Crown */}
      <path
        d="M 32 9 L 49 17 L 47 23 L 17 23 L 15 17 Z"
        fill="none"
        stroke="#f4f4f5"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Geometric Shield Badge on Cap (Emerald Accent) */}
      <path
        d="M 32 13 L 35.5 15.5 L 34 19.5 L 32 21 L 30 19.5 L 28.5 15.5 Z"
        fill="#10b981"
      />

      {/* Visor Brim */}
      <path
        d="M 18 25 Q 32 29.5 46 25"
        fill="none"
        stroke="#f4f4f5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Face Silhouette (Negative Space with Jawline & Chin) */}
      <path
        d="M 22 28 L 23.5 36 L 32 43 L 40.5 36 L 42 28"
        fill="none"
        stroke="#f4f4f5"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Minimalist Collar Lapels */}
      <path
        d="M 16 50 L 25 43 L 29 49"
        fill="none"
        stroke="#f4f4f5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48 50 L 39 43 L 35 49"
        fill="none"
        stroke="#f4f4f5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Tie / Nexus Accent (Emerald) */}
      <path
        d="M 32 45 L 34 48 L 32 54 L 30 48 Z"
        fill="#10b981"
      />
    </svg>
  );
}

export interface ParoleWordmarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * PAROLE Modern Geometric Sans-Serif Wordmark
 *
 * Clean vector typography in flat #f4f4f5 white with a single
 * restrained emerald (#10b981) geometric delta in the letter A.
 */
export function ParoleWordmark({
  className = "",
  ...props
}: ParoleWordmarkProps) {
  return (
    <svg
      viewBox="0 0 280 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PAROLE"
      role="img"
      {...props}
    >
      {/* Letter P */}
      <path
        d="M 6 6 H 32 C 38.5 6 43 10.5 43 16.5 C 43 22.5 38.5 27 32 27 H 14 V 34 H 6 V 6 Z M 14 12 V 21 H 31 C 33.8 21 35.8 19 35.8 16.5 C 35.8 14 33.8 12 31 12 H 14 Z"
        fill="#f4f4f5"
      />

      {/* Letter A */}
      <path
        d="M 51 34 L 66 6 H 76 L 91 34 H 83 L 79 26 H 63 L 59 34 H 51 Z M 65.5 21 H 76.5 L 71 10.5 L 65.5 21 Z"
        fill="#f4f4f5"
      />
      {/* Restrained Emerald Geometric Accent in A */}
      <polygon
        points="63,34 79,34 71,22.5"
        fill="#10b981"
      />

      {/* Letter R */}
      <path
        d="M 99 6 H 125 C 131.5 6 135.5 10 135.5 16 C 135.5 21 131.5 25 126 25.8 L 136.5 34 H 127 L 118 26 H 107 V 34 H 99 V 6 Z M 107 12 V 20.5 H 124 C 126.8 20.5 128.5 18.8 128.5 16.2 C 128.5 13.8 126.8 12 124 12 H 107 Z"
        fill="#f4f4f5"
      />

      {/* Letter O */}
      <path
        d="M 148 6 H 174 C 182 6 187 11 187 18.5 V 21.5 C 187 29 182 34 174 34 H 148 C 140 34 135 29 135 21.5 V 18.5 C 135 11 140 6 148 6 Z M 148 12 C 144 12 142 14.5 142 18.5 V 21.5 C 142 25.5 144 28 148 28 H 174 C 178 28 180 25.5 180 21.5 V 18.5 C 180 14.5 178 12 174 12 H 148 Z"
        fill="#f4f4f5"
      />

      {/* Letter L */}
      <path
        d="M 195 6 H 203 V 28 H 229 V 34 H 195 V 6 Z"
        fill="#f4f4f5"
      />

      {/* Letter E */}
      <path
        d="M 237 6 H 274 V 12 H 245 V 17 H 270 V 23 H 245 V 28 H 274 V 34 H 237 V 6 Z"
        fill="#f4f4f5"
      />
    </svg>
  );
}

export interface ParoleLogoProps {
  /** Size preset for emblem and typography */
  size?: "sm" | "md" | "lg";
  /** Optional class override on container */
  className?: string;
  /** Accessible title for the logo emblem */
  title?: string;
}

/**
 * Compact Horizontal PAROLE Brand Logo
 *
 * Professional lockup: Minimalist guardian symbol on the left,
 * modern geometric PAROLE wordmark on the right.
 */
export function ParoleLogo({
  size = "md",
  className = "",
  title = "PAROLE Home",
}: ParoleLogoProps) {
  const sizeConfig = {
    sm: {
      emblemClass: "h-7 w-7 shrink-0",
      wordmarkClass: "h-4 w-auto",
    },
    md: {
      emblemClass: "h-8 w-8 sm:h-9 sm:w-9 shrink-0",
      wordmarkClass: "h-[18px] sm:h-[20px] w-auto",
    },
    lg: {
      emblemClass: "h-10 w-10 sm:h-11 sm:w-11 shrink-0",
      wordmarkClass: "h-6 sm:h-7 w-auto",
    },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <ParoleEmblem className={sizeConfig.emblemClass} title={title} />
      <ParoleWordmark className={sizeConfig.wordmarkClass} />
    </div>
  );
}
