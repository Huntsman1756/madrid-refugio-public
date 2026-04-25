import type { SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement> & {
  title?: string;
  testId?: string;
};

type ArtProps = SvgProps & {
  size?: number | string;
};

export function OrganicTree({ title, testId, className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 28 36"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="14" cy="31.5" rx="8.5" ry="3.5" fill="#00000020" />
      <path d="M14 18.5v10.5" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M14.7 4.4c3.6 0 6.5 1.4 8.3 3.9 3.1.3 5.3 2.8 5.3 5.9 0 3.3-2.5 5.8-5.7 6.1-.7 3.3-3.7 5.6-7.5 5.6-4.4 0-7.5-1.6-9.8-4.6C2.6 20.6.6 18.2.6 14.8c0-3.5 2.6-6.2 6.1-6.4C8.6 5.9 11.3 4.4 14.7 4.4Z"
        fill="#2d6a4f"
      />
      <path
        d="M11.1 6.7c2.7 0 4.8 1 6.2 2.8 2.3.2 3.8 2 3.8 4.2 0 2.5-1.8 4.1-4.1 4.3-.6 2.3-2.8 3.8-5.4 3.8-3 0-5.2-1.1-6.8-3.2-1.8-.5-3.1-2.2-3.1-4.5 0-2.4 1.8-4.3 4.2-4.4 1.2-1.9 3-3 5.2-3Z"
        fill="#52b788"
      />
    </svg>
  );
}

export function AlcalaLogo({ title = "Madrid Refugio", testId = "alcala-logo", className, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title}
      data-testid={testId}
      className={className}
      {...props}
    >
      <title>{title}</title>
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        {/* Ground line */}
        <path d="M8 40h32" stroke="#1d2733" strokeWidth="2.2" strokeLinecap="round" />
        
        {/* Building - main structure with Madrid architectural feel */}
        <path d="M12 40V24c0-1.1 0.9-2 2-2h9c1.1 0 2 0.9 2 2v16" fill="#f5f0e8" stroke="#1d2733" strokeWidth="2" />
        <path d="M25 40V19c0-1.1 0.9-2 2-2h9c1.1 0 2 0.9 2 2v21" fill="#f0ebe3" stroke="#1d2733" strokeWidth="2" />
        
        {/* Roof lines - distinctive Madrid style */}
        <path d="M10 24h15" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23 19h16" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Windows - left building */}
        <rect x="16" y="28" width="5" height="5" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        <rect x="24" y="28" width="5" height="5" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        <rect x="16" y="36" width="5" height="4" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        <rect x="24" y="36" width="5" height="4" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        
        {/* Windows - right building */}
        <rect x="29" y="23" width="5" height="5" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        <rect x="37" y="23" width="5" height="5" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        <rect x="29" y="31" width="5" height="5" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        <rect x="37" y="31" width="5" height="5" rx="0.8" fill="#f8f5ef" stroke="#1d2733" strokeWidth="1.2" />
        
        {/* Door */}
        <path d="M18 40V33c0-1.7 1.3-3 3-3s3 1.3 3 3v7" fill="#f6f2ea" stroke="#2d6a4f" strokeWidth="1.5" />
        
        {/* Tree - prominent, representing shade/refuge */}
        <path d="M40 40V30" stroke="#8b5e3c" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M40 30c-4 0-7-1.5-7-5 0-3 1.5-5 3.5-5.5 0.5-2.5 2.5-4 4.5-4s4 1.5 4.5 4c2 0.5 3.5 2.5 3.5 5.5 0 3.5-3 5-8 5Z" fill="#2d6a4f" />
        <path d="M40 33c-3 0-5-1-5-3.5 0-2.5 1.2-4 2.8-4.2 0.4-1.8 1.8-3 3.2-3s2.8 1.2 3.2 3c1.6 0.2 2.8 1.7 2.8 4.2 0 2.5-2 3.5-5 3.5Z" fill="#52b788" />
        
        {/* Shade indicator - subtle arc under tree */}
        <path d="M33 40c2-0.5 4-1 7-1s5 0.5 7 1" stroke="#2d6a4f" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
        
        {/* Small sun symbol - top right */}
        <circle cx="38" cy="10" r="3" fill="#f6ad55" opacity="0.7" />
        <path d="M38 5.5V4M38 16v-1.5M33.5 10H32M44.5 10H43" stroke="#f6ad55" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </g>
    </svg>
  );
}

export function HeroClimateArt({ className, testId = "hero-climate-art", ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 680 232" fill="none" preserveAspectRatio="xMidYMid meet" data-testid={testId} className={className} {...props}>
      <defs>
        <linearGradient id="hero-sky-wash" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4efe7" />
          <stop offset="0.5" stopColor="#e8e4d8" />
          <stop offset="1" stopColor="#ddebe4" />
        </linearGradient>
        <linearGradient id="hero-building-warm" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#efe9de" />
          <stop offset="1" stopColor="#e4dccf" />
        </linearGradient>
        <linearGradient id="hero-building-cool" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e8e4d8" />
          <stop offset="1" stopColor="#d5dfd8" />
        </linearGradient>
        <linearGradient id="hero-shade" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2d6a4f" stopOpacity="0.08" />
          <stop offset="1" stopColor="#2d6a4f" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <path d="M0 183c82-18 160-26 240-18 84 8 167-6 255-34 71-22 132-25 185-14v115H0Z" fill="url(#hero-sky-wash)" />

      {/* Sun - upper right */}
      <circle cx="590" cy="38" r="28" fill="#f6ad55" opacity="0.25" />
      <circle cx="590" cy="38" r="20" fill="#f6ad55" opacity="0.35" />
      <circle cx="590" cy="38" r="14" fill="#f6ad55" opacity="0.55" />
      <circle cx="590" cy="38" r="9" fill="#fde2bf" opacity="0.8" />
      {/* Sun rays */}
      <g opacity="0.18" stroke="#f6ad55" strokeWidth="1.5" strokeLinecap="round">
        <path d="M590 8v-5" />
        <path d="M590 67v5" />
        <path d="M562 38h-5" />
        <path d="M618 38h5" />
        <path d="M570 18l-3.5-3.5" />
        <path d="M610 58l3.5 3.5" />
        <path d="M610 18l3.5-3.5" />
        <path d="M570 58l-3.5 3.5" />
      </g>

      {/* ===== LEFT ZONE: Warm direct path buildings (sun-exposed) ===== */}
      <g stroke="#1d2733" strokeWidth="1.8" strokeLinejoin="round">
        {/* Building 1 - leftmost */}
        <path d="M30 175h40v57H30Z" fill="url(#hero-building-warm)" />
        <rect x="38" y="185" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="54" y="185" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="38" y="200" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="54" y="200" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        {/* Roof */}
        <path d="M27 175h46" stroke-width="2.5" />
        
        {/* Building 2 */}
        <path d="M78 160h36v95H78Z" fill="url(#hero-building-warm)" />
        <rect x="86" y="170" width="7" height="7" rx="0.8" fill="#f8f5ef" stroke-width="0.9" />
        <rect x="99" y="170" width="7" height="7" rx="0.8" fill="#f8f5ef" stroke-width="0.9" />
        <rect x="86" y="183" width="7" height="7" rx="0.8" fill="#f8f5ef" stroke-width="0.9" />
        <rect x="99" y="183" width="7" height="7" rx="0.8" fill="#f8f5ef" stroke-width="0.9" />
        <rect x="86" y="196" width="7" height="7" rx="0.8" fill="#f8f5ef" stroke-width="0.9" />
        <rect x="99" y="196" width="7" height="7" rx="0.8" fill="#f8f5ef" stroke-width="0.9" />
        <path d="M75 160h42" stroke-width="2.5" />
        
        {/* Building 3 - taller */}
        <path d="M122 145h44v110H122Z" fill="url(#hero-building-warm)" />
        <rect x="130" y="155" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="144" y="155" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="130" y="170" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="144" y="170" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="130" y="185" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="144" y="185" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="130" y="200" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="144" y="200" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <path d="M119 145h50" stroke-width="2.5" />
      </g>

      {/* ===== CENTER ZONE: Cooler shaded buildings ===== */}
      <g stroke="#1d2733" strokeWidth="1.8" strokeLinejoin="round">
        {/* Building 4 - transitional */}
        <path d="M174 155h48v100H174Z" fill="url(#hero-building-cool)" />
        <rect x="182" y="165" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="197" y="165" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="182" y="182" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="197" y="182" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="182" y="199" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="197" y="199" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <path d="M171 155h54" stroke-width="2.5" />
        {/* Door */}
        <path d="M195 255V238c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5v17" fill="#f6f2ea" stroke-width="1.5" />

        {/* Building 5 - tallest, center */}
        <path d="M230 130h52v125H230Z" fill="url(#hero-building-cool)" />
        <rect x="238" y="140" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="254" y="140" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="238" y="156" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="254" y="156" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="238" y="172" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="254" y="172" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="238" y="188" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="254" y="188" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="238" y="204" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="254" y="204" width="10" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <path d="M227 130h58" stroke-width="2.5" />
      </g>

      {/* ===== RIGHT ZONE: Mixed shade buildings ===== */}
      <g stroke="#1d2733" strokeWidth="1.8" strokeLinejoin="round">
        {/* Building 6 */}
        <path d="M288 150h42v105H288Z" fill="url(#hero-building-cool)" />
        <rect x="296" y="160" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="310" y="160" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="296" y="176" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="310" y="176" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="296" y="192" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="310" y="192" width="8" height="9" rx="1" fill="#f8f5ef" stroke-width="1" />
        <path d="M285 150h48" stroke-width="2.5" />

        {/* Building 7 */}
        <path d="M338 140h46v115H338Z" fill="url(#hero-building-cool)" />
        <rect x="346" y="150" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="361" y="150" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="346" y="167" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="361" y="167" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="346" y="184" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="361" y="184" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="346" y="201" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="361" y="201" width="9" height="10" rx="1" fill="#f8f5ef" stroke-width="1" />
        <path d="M335 140h52" stroke-width="2.5" />

        {/* Building 8 */}
        <path d="M392 158h38v97H392Z" fill="url(#hero-building-cool)" />
        <rect x="400" y="168" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="414" y="168" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="400" y="182" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="414" y="182" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="400" y="196" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <rect x="414" y="196" width="8" height="8" rx="1" fill="#f8f5ef" stroke-width="1" />
        <path d="M389 158h44" stroke-width="2.5" />
      </g>

      {/* ===== Shade overlays on buildings (cool path effect) ===== */}
      <g opacity="0.5">
        {/* Shade from center buildings */}
        <path d="M230 130h52v125H230Z" fill="url(#hero-shade)" />
        <path d="M174 155h48v100H174Z" fill="url(#hero-shade)" />
      </g>

      {/* ===== Street level ===== */}
      <path d="M0 255h680" stroke="#d4ddd8" strokeWidth="2" opacity="0.6" />
      <path d="M0 258h680" stroke="#c8d4ce" strokeWidth="1" opacity="0.3" />

      {/* ===== Trees along the street (shade elements) ===== */}
      <g transform="translate(60 185)">
        <OrganicTree testId="organic-tree-hero-1" width="60" height="76" />
      </g>
      <g transform="translate(155 170)">
        <OrganicTree testId="organic-tree-hero-2" width="55" height="70" />
      </g>
      <g transform="translate(310 165)">
        <OrganicTree testId="organic-tree-hero-3" width="65" height="82" />
      </g>
      <g transform="translate(430 175)">
        <OrganicTree testId="organic-tree-hero-4" width="50" height="64" />
      </g>
      <g transform="translate(560 182)">
        <OrganicTree testId="organic-tree-hero-5" width="58" height="74" />
      </g>

      {/* ===== Ground plane with subtle gradient ===== */}
      <path d="M0 255h680v10H0Z" fill="#e8e4d8" opacity="0.3" />

      {/* ===== Small decorative elements ===== */}
      {/* Cloud */}
      <g opacity="0.15" fill="#fff">
        <circle cx="100" cy="30" r="12" />
        <circle cx="118" cy="26" r="14" />
        <circle cx="136" cy="30" r="11" />
        <rect x="100" y="26" width="36" height="14" rx="7" />
      </g>
      {/* Cloud 2 */}
      <g opacity="0.1" fill="#fff">
        <circle cx="420" cy="22" r="10" />
        <circle cx="435" cy="19" r="12" />
        <circle cx="450" cy="22" r="9" />
        <rect x="420" y="19" width="30" height="12" rx="6" />
      </g>

      {/* ===== Route path indicator - subtle green line along street ===== */}
      <path d="M30 254c40-2 80-1 120 0s80 1 120 2 80 1 120 0 80-1 120 0" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" stroke-dasharray="6 4" />
    </svg>
  );
}

export function WaterFountainIcon({ title = "Fuente de agua", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M3.5 15.5h13" stroke="#1a6fa8" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 15.5v-4.2c0-1 .8-1.8 1.8-1.8h2.4" stroke="#1a6fa8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2 9.5c2.9 0 4.8-1 4.8-3.8" stroke="#1a6fa8" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.7 8.1c1 1.3 1.1 2.5.1 3.5-.9-.2-1.6-.9-1.5-1.9.1-.7.4-1.1 1.4-1.6Z" fill="#1a6fa8" />
      <rect x="7.2" y="13.1" width="5.6" height="2.4" rx="1.1" fill="#1a6fa8" opacity="0.16" stroke="#1a6fa8" strokeWidth="1.2" />
    </svg>
  );
}

export function ClimateShelterIcon({ title = "Refugio climático", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M3 9.4 10 4l7 5.4" stroke="#c0392b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.8 8.8V16h10.4V8.8" stroke="#c0392b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.3 16v-3.8h3.4V16" stroke="#c0392b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.7 5.7V9" stroke="#c0392b" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="11.05" y="4.3" width="1.3" height="3.8" rx="0.65" fill="#c0392b" />
      <circle cx="11.7" cy="9.3" r="1.2" fill="#c0392b" opacity="0.16" stroke="#c0392b" strokeWidth="1.1" />
    </svg>
  );
}

export function ClimateRouteBadge({ title = "Ruta con alivio climático", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 34 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M4 16c5.2-5.8 9.8-8.7 14-8.7 4.2 0 7.7 1.7 12 5.8" stroke="#2d6a4f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23.4 6.1 30 6.3 28.8 12.3" stroke="#2d6a4f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.4 7.4c1.6 0 2.9.7 3.8 2 1.5.1 2.4 1.3 2.4 2.6 0 1.5-1.1 2.6-2.5 2.7-.3 1.4-1.6 2.3-3.4 2.3-1.8 0-3.1-.6-4-1.9-1-.3-1.8-1.3-1.8-2.6 0-1.5 1.1-2.7 2.6-2.7.7-1.3 1.7-2.4 2.9-2.4Z" fill="#52b788" />
      <path d="M9.8 11.8v3.4" stroke="#8b5e3c" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="9.8" cy="16.4" rx="2.1" ry="0.7" fill="#00000020" />
    </svg>
  );
}

export function HeatmapBadgeIcon({ title = "Mapa de calor", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title ? <title>{title}</title> : null}
      <circle cx="6" cy="8" r="3.2" fill="#fdebd0" />
      <circle cx="12.4" cy="7.2" r="4.2" fill="#f6ad55" fillOpacity="0.95" />
      <circle cx="9.8" cy="12.4" r="4.5" fill="#e67e22" fillOpacity="0.88" />
      <circle cx="13.8" cy="12.6" r="2.7" fill="#c0392b" />
    </svg>
  );
}

export function MadridShelterBuildingArt({ title, testId, className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        {/* Ground line */}
        <path d="M16 100h128" stroke="#d4c8b7" strokeWidth="4" />

        {/* Building - main structure */}
        <path d="M32 100V52c0-2 1.5-3.5 3.5-3.5h29c2 0 3.5 1.5 3.5 3.5v48" fill="#ede8df" stroke="#b6a891" strokeWidth="3" />
        <path d="M80 100V44c0-2 1.5-3.5 3.5-3.5h36c2 0 3.5 1.5 3.5 3.5v56" fill="#e8e4d9" stroke="#b6a891" strokeWidth="3" />

        {/* Roof */}
        <path d="M29 52h36" stroke="#1a3d2b" strokeWidth="4" />
        <path d="M77 44h39" stroke="#1a3d2b" strokeWidth="4" />

        {/* Windows */}
        <rect x="42" y="64" width="14" height="12" rx="2" fill="#f8f5ef" stroke="#b6a891" strokeWidth="2" />
        <rect x="64" y="64" width="10" height="12" rx="2" fill="#f8f5ef" stroke="#b6a891" strokeWidth="2" />
        <rect x="90" y="58" width="14" height="12" rx="2" fill="#f8f5ef" stroke="#b6a891" strokeWidth="2" />
        <rect x="112" y="58" width="10" height="12" rx="2" fill="#f8f5ef" stroke="#b6a891" strokeWidth="2" />

        {/* Door */}
        <path d="M48 100V78c0-3 2-5 5-5s5 2 5 5v22" fill="#f6f2ea" stroke="#1a3d2b" strokeWidth="3" />

        {/* Tree next to building */}
        <path d="M136 100V82" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round" />
        <path d="M136 82c-8 0-14-3-14-10 0-5 3-8 7-9 1-4 4-7 8-7s7 3 8 7c4 1 7 4 7 9 0 7-6 10-14 10Z" fill="#2d6a4f" />
        <path d="M136 86c-5 0-10-2-10-7 0-4 2-6 5-6 1-3 3-5 5-5s4 2 5 5c3 0 5 2 5 6 0 5-5 7-10 7Z" fill="#52b788" />

        {/* Cool indicator - thermometer going down */}
        <circle cx="24" cy="36" r="6" fill="#fdebd0" stroke="#e67e22" strokeWidth="2" />
        <path d="M24 42v6" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="48" r="2.5" fill="#2d6a4f" />

        {/* Small shadow patch */}
        <ellipse cx="55" cy="104" rx="20" ry="3" fill="#00000014" />
      </g>
    </svg>
  );
}

export function RouteResourceVisual({ title, testId = "route-resource-visual", className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 88c19-22 37-34 55-34 16 0 27 10 42 10 10 0 18-4 27-14" stroke="#2d6a4f" strokeWidth="7" />
        <path d="M18 88c19-22 37-34 55-34 16 0 27 10 42 10 10 0 18-4 27-14" stroke="#d7efe0" strokeWidth="3" />
        <circle cx="33" cy="75" r="7" fill="#fffdf8" stroke="#2d6a4f" strokeWidth="3" />
        <circle cx="78" cy="55" r="7" fill="#fffdf8" stroke="#2d6a4f" strokeWidth="3" />
        <circle cx="126" cy="51" r="7" fill="#fffdf8" stroke="#2d6a4f" strokeWidth="3" />
        <path d="M108 91V64l18-13 18 13v27" fill="#f6f2ea" stroke="#1d2733" strokeWidth="3" />
        <path d="M119 91V75h14v16M116 67h20" stroke="#1d2733" strokeWidth="2.4" />
        <path d="M126 48v18" stroke="#2d6a4f" strokeWidth="2.4" />
        <path d="M39 94c6-1 11-5 14-12 3 5 3 10 0 15" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="2.5" />
        <path d="M64 25c0-6 5-11 11-11" stroke="#0ea5e9" strokeWidth="3" />
        <path d="M75 14c4 5 4 9 0 12-4-1-7-4-7-7 0-2 2-4 7-5Z" fill="#0ea5e9" />
      </g>
    </svg>
  );
}

export function MadridHeatmapMiniArt({ title, testId, className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        {/* Map frame */}
        <rect x="16" y="12" width="128" height="96" rx="8" fill="#f7efe4" stroke="#d9cab3" strokeWidth="2.5" />

        {/* Grid lines */}
        <path d="M40 24v72M68 24v72M96 24v72M124 24v72" stroke="#ddd0ba" strokeWidth="1.5" />
        <path d="M28 36h104M28 56h104M28 76h104M28 96h104" stroke="#ddd0ba" strokeWidth="1.5" />

        {/* Heat zones - overlapping circles */}
        <circle cx="52" cy="68" r="22" fill="#fdebd0" />
        <circle cx="80" cy="56" r="28" fill="#f6ad55" fillOpacity="0.88" />
        <circle cx="100" cy="74" r="24" fill="#e67e22" fillOpacity="0.82" />
        <circle cx="116" cy="78" r="16" fill="#c0392b" fillOpacity="0.88" />

        {/* Cool zone indicator */}
        <circle cx="40" cy="34" r="6" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="1.5" />
        <path d="M38 32h4M40 30v4" stroke="#2d6a4f" strokeWidth="1" strokeLinecap="round" />

        {/* Route suggestion - cooler path */}
        <path d="M32 88c8-4 14-8 20-20 6-14 16-20 28-16 10 3 18 10 22 22 6 18 14 24 22 26" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 88c8-4 14-8 20-20 6-14 16-20 28-16 10 3 18 10 22 22 6 18 14 24 22 26" stroke="#d7efe0" strokeWidth="6" />

        {/* Sun */}
        <circle cx="132" cy="22" r="8" fill="#f6ad55" />
        <circle cx="132" cy="22" r="4" fill="#fde2bf" />

        {/* Shadow trees on map */}
        <path d="M48 100c4-1 8-4 10-8 2 3 2 7 0 10" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function RouteHeatVisual({ title, testId = "route-heat-visual", className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 89h112" stroke="#d9cab3" strokeWidth="4" />
        <path d="M38 89 70 50h46" stroke="#c0392b" strokeWidth="10" opacity="0.92" />
        <path d="M38 89 70 50" stroke="#f6ad55" strokeWidth="18" opacity="0.42" />
        <path d="M70 50h46" stroke="#2d6a4f" strokeWidth="10" />
        <path d="M60 82 92 49" stroke="#d7efe0" strokeWidth="15" opacity="0.95" />
        <circle cx="121" cy="28" r="15" fill="#f6ad55" />
        <circle cx="121" cy="28" r="8" fill="#fde2bf" />
        <path d="M120 7v-5M104 14l-4-4M138 14l4-4" stroke="#c26a1b" strokeWidth="3" />
        <path d="M56 96c8-2 13-6 17-14 4 6 4 12 0 17" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="2.5" />
        <path d="M103 96c8-2 13-6 17-14 4 6 4 12 0 17" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

export function TreeBenchArt({ title, testId, className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        {/* Ground */}
        <path d="M16 96h128" stroke="#d4c8b7" strokeWidth="4" />

        {/* Large tree */}
        <path d="M76 96V68" stroke="#8b5e3c" strokeWidth="6" strokeLinecap="round" />
        <path d="M76 68c-18 0-32-8-32-24 0-14 8-22 18-24 2-8 8-14 16-14s14 6 16 14c10 2 18 10 18 24 0 16-14 24-32 24Z" fill="#2d6a4f" />
        <path d="M76 74c-12 0-22-6-22-16 0-10 6-16 13-17 2-5 6-9 11-9s9 4 11 9c7 1 13 7 13 17 0 10-10 16-22 16Z" fill="#52b788" />

        {/* Bench under tree */}
        <path d="M56 96h32" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round" />
        <path d="M56 88h32" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 96V90" stroke="#8b5e3c" strokeWidth="3" strokeLinecap="round" />
        <path d="M84 96V90" stroke="#8b5e3c" strokeWidth="3" strokeLinecap="round" />
        <path d="M56 90v-4c0-1 1-2 2-2h28c1 0 2 1 2 2v4" stroke="#8b5e3c" strokeWidth="2.5" strokeLinecap="round" />

        {/* Small tree in background */}
        <path d="M130 96V80" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round" />
        <path d="M130 80c-10 0-18-5-18-14 0-8 5-12 10-12 1-5 5-8 10-8s9 3 10 8c5 0 10 4 10 12 0 9-8 14-18 14Z" fill="#2d6a4f" />
        <path d="M130 84c-7 0-13-3-13-10 0-6 3-9 7-9 1-4 4-6 8-6s7 2 8 6c4 0 7 3 7 9 0 7-6 10-13 10Z" fill="#52b788" />

        {/* Water fountain */}
        <path d="M28 96V78" stroke="#1a6fa8" strokeWidth="3" strokeLinecap="round" />
        <path d="M28 78c4-2 8-2 12 0" stroke="#1a6fa8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="74" r="3" fill="#bae6fd" stroke="#1a6fa8" strokeWidth="1.5" />
        <path d="M28 77v4" stroke="#1a6fa8" strokeWidth="2" strokeLinecap="round" />

        {/* Sun */}
        <circle cx="140" cy="20" r="12" fill="#f6ad55" />
        <circle cx="140" cy="20" r="7" fill="#fde2bf" />
        <path d="M140 4v-4M126 10l-3-3M154 10l3-3M126 30l-3 3M154 30l3 3" stroke="#c26a1b" strokeWidth="2" strokeLinecap="round" />

        {/* Advisory text lines */}
        <path d="M30 108h40" stroke="#d7efe0" strokeWidth="4" strokeLinecap="round" />
        <path d="M80 108h50" stroke="#d7efe0" strokeWidth="4" strokeLinecap="round" />

        {/* Shade indicator */}
        <path d="M100 40c0-5 4-9 9-9" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M111 31c3 3 3 6 0 9-3-1-4-2-4-4 0-1 1-2 4-3Z" fill="#0ea5e9" />
      </g>
    </svg>
  );
}

export function RouteAdviceVisual({ title, testId = "route-advice-visual", className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      data-testid={testId}
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g data-testid="civic-wayfinding-system" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 92h112" stroke="#d4c8b7" strokeWidth="4" />
        <path d="M35 92c17-18 33-27 50-27 13 0 25 5 39 15" stroke="#2d6a4f" strokeWidth="7" />
        <path d="M35 92c17-18 33-27 50-27 13 0 25 5 39 15" stroke="#d7efe0" strokeWidth="3" />
        <circle cx="118" cy="30" r="12" fill="#f6ad55" opacity="0.95" />
        <path d="M118 10V3M103 16l-5-5M133 16l5-5" stroke="#c26a1b" strokeWidth="3" />
        <path d="M58 49c11 0 20 4 26 12 9 1 16 8 16 18 0 9-7 16-16 17-4 9-14 14-27 14-14 0-25-5-32-15-8-2-14-9-14-18 0-11 8-19 19-19 6-6 15-9 28-9Z" fill="#2d6a4f" />
        <path d="M57 57c8 0 15 3 20 9 7 1 12 6 12 13 0 7-5 12-12 13-3 6-10 10-20 10-10 0-18-3-23-11-6-1-10-6-10-13 0-8 6-13 14-13 4-5 10-8 19-8Z" fill="#52b788" />
        <path d="M56 100V78" stroke="#8b5e3c" strokeWidth="4" />
        <path d="M88 89h34" stroke="#d7efe0" strokeWidth="8" />
      </g>
    </svg>
  );
}

export function HonestComparisonIcon({ title = "Comparación", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M4 14.8 8.1 10l2.8 2.8 5.1-6.1" stroke="#c0392b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4.5v10.8h11.8" stroke="#8b5e3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx="8.1" cy="10" r="1.2" fill="#f4c0bb" stroke="#c0392b" strokeWidth="1" />
      <circle cx="15.9" cy="6.7" r="1.2" fill="#f4c0bb" stroke="#c0392b" strokeWidth="1" />
    </svg>
  );
}
