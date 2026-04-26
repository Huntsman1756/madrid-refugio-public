import type { SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement> & {
  title?: string;
  testId?: string;
};

type ArtProps = SvgProps & {
  size?: number | string;
};

// ─── Style Tokens (Civic Tech) ───────────────────────────────────────────────
// Stroke weights: 1 (thin), 1.5 (medium), 2 (bold)
// Opacity scale: 0.08, 0.12, 0.18, 0.25, 0.35, 0.5
// Colors: --climate-green, --climate-terracotta, --climate-cyan, --ds-gray-400, --ds-gray-500, --ds-gray-600

// ─── OrganicTree ─────────────────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Canopy — three layered ellipses */}
      <ellipse cx="14" cy="13" rx="10" ry="11" fill="var(--climate-green)" opacity="0.12" />
      <ellipse cx="14" cy="12" rx="7.5" ry="9" fill="var(--climate-green)" opacity="0.22" />
      <ellipse cx="14" cy="11" rx="5" ry="6.5" fill="var(--climate-green)" opacity="0.35" />
      {/* Trunk */}
      <rect x="12.5" y="22" width="3" height="10" rx="1.5" fill="var(--ds-gray-500)" opacity="0.25" />
      {/* Ground shadow */}
      <ellipse cx="14" cy="33" rx="8" ry="2" fill="var(--ds-gray-500)" opacity="0.08" />
    </svg>
  );
}

// ─── AlcalaLogo ──────────────────────────────────────────────────────────────
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
      <defs>
        <linearGradient id="alcala-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--climate-terracotta)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--climate-cyan)" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="alcala-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--climate-terracotta)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--climate-terracotta)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Sky wash */}
      <rect x="6" y="6" width="36" height="36" rx="2" fill="url(#alcala-sky)" />
      {/* Sun halo */}
      <circle cx="39" cy="9" r="6" fill="url(#alcala-sun-glow)" />
      {/* Sun core */}
      <circle cx="39" cy="9" r="3" fill="var(--climate-terracotta)" opacity="0.75" />
      {/* Sun rays */}
      <g stroke="var(--climate-terracotta)" strokeWidth="0.8" strokeLinecap="round" opacity="0.45">
        <line x1="39" y1="4" x2="39" y2="5.5" />
        <line x1="39" y1="12.5" x2="39" y2="14" />
        <line x1="34" y1="9" x2="35.5" y2="9" />
        <line x1="42.5" y1="9" x2="44" y2="9" />
        <line x1="35.5" y1="5.5" x2="36.5" y2="6.5" />
        <line x1="41.5" y1="11.5" x2="42.5" y2="12.5" />
      </g>
      {/* Ground line */}
      <path d="M6 42h36" stroke="var(--ds-gray-400)" strokeWidth="0.8" opacity="0.35" />
      {/* Left building — warm facade */}
      <rect x="10" y="24" width="14" height="18" rx="0.5" fill="#f5efe8" stroke="var(--ds-gray-400)" strokeWidth="0.8" />
      {/* Right building — cool facade */}
      <rect x="26" y="17" width="14" height="25" rx="0.5" fill="#eef4f1" stroke="var(--climate-green)" strokeWidth="0.8" opacity="0.7" />
      {/* Roof accent lines */}
      <path d="M8 24h18" stroke="var(--climate-terracotta)" strokeWidth="1.5" opacity="0.6" />
      <path d="M24 17h18" stroke="var(--climate-green)" strokeWidth="1.5" opacity="0.8" />
      {/* Windows — left (warm amber tint) */}
      <g fill="var(--climate-terracotta)" stroke="var(--climate-terracotta)" strokeWidth="0.5" opacity="0.35">
        <rect x="13" y="28" width="4" height="4" rx="0.5" />
        <rect x="19" y="28" width="4" height="4" rx="0.5" />
        <rect x="13" y="35" width="4" height="3" rx="0.5" />
        <rect x="19" y="35" width="4" height="3" rx="0.5" />
      </g>
      {/* Windows — right (cool cyan tint) */}
      <g fill="var(--climate-cyan)" stroke="var(--climate-cyan)" strokeWidth="0.5" opacity="0.4">
        <rect x="29" y="21" width="4" height="4" rx="0.5" />
        <rect x="35" y="21" width="4" height="4" rx="0.5" />
        <rect x="29" y="28" width="4" height="4" rx="0.5" />
        <rect x="35" y="28" width="4" height="4" rx="0.5" />
        <rect x="29" y="35" width="4" height="3" rx="0.5" />
        <rect x="35" y="35" width="4" height="3" rx="0.5" />
      </g>
      {/* Door */}
      <rect x="15" y="36" width="5" height="6" rx="0.5" fill="var(--climate-green)" opacity="0.3" stroke="var(--climate-green)" strokeWidth="0.8" />
      {/* Tree trunk */}
      <rect x="5" y="33" width="2" height="9" rx="1" fill="var(--ds-gray-500)" opacity="0.25" />
      {/* Tree canopy — layered */}
      <circle cx="6" cy="31" r="5.5" fill="var(--climate-green)" opacity="0.18" />
      <circle cx="6" cy="30" r="4" fill="var(--climate-green)" opacity="0.32" />
      <circle cx="6" cy="29" r="2.5" fill="var(--climate-green)" opacity="0.5" />
    </svg>
  );
}

// ─── HeroClimateArt ──────────────────────────────────────────────────────────
export function HeroClimateArt({ className, testId = "hero-climate-art", ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 680 232" fill="none" preserveAspectRatio="xMidYMid meet" data-testid={testId} className={className} {...props}>
      <defs>
        {/* Sky: warm amber near sun → cool blue-white horizon */}
        <linearGradient id="hero-sky" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef0e0" />
          <stop offset="60%" stopColor="#f5f8fa" />
          <stop offset="100%" stopColor="#eef4f1" />
        </linearGradient>
        {/* Ground: slight warm dirt */}
        <linearGradient id="hero-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ds-gray-100)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--ds-gray-50)" stopOpacity="0.2" />
        </linearGradient>
        {/* Sun glow */}
        <radialGradient id="hero-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--climate-terracotta)" stopOpacity="0.6" />
          <stop offset="60%" stopColor="var(--climate-terracotta)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--climate-terracotta)" stopOpacity="0" />
        </radialGradient>
        {/* Warm zone overlay */}
        <linearGradient id="hero-heat-zone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--climate-terracotta)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--climate-terracotta)" stopOpacity="0" />
        </linearGradient>
        {/* Cool zone overlay */}
        <linearGradient id="hero-cool-zone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--climate-green)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--climate-green)" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* ── Sky ───────────────────────────────────────────────────── */}
      <rect width="680" height="232" fill="url(#hero-sky)" />
      {/* Warm overlay left third */}
      <rect x="0" y="0" width="220" height="232" fill="url(#hero-heat-zone)" />
      {/* Cool overlay right two-thirds */}
      <rect x="160" y="0" width="520" height="232" fill="url(#hero-cool-zone)" />

      {/* ── Sun ────────────────────────────────────────────────────── */}
      {/* Outer corona */}
      <circle cx="592" cy="38" r="48" fill="url(#hero-sun-glow)" />
      {/* Mid halo */}
      <circle cx="592" cy="38" r="26" fill="var(--climate-terracotta)" opacity="0.18" />
      {/* Sun disc */}
      <circle cx="592" cy="38" r="14" fill="var(--climate-terracotta)" opacity="0.50" />
      {/* Bright core */}
      <circle cx="592" cy="38" r="7" fill="var(--climate-terracotta)" opacity="0.75" />
      {/* Sun rays */}
      <g stroke="var(--climate-terracotta)" strokeLinecap="round" opacity="0.30">
        <line x1="592" y1="4" x2="592" y2="14" strokeWidth="1.5" />
        <line x1="592" y1="62" x2="592" y2="72" strokeWidth="1.5" />
        <line x1="558" y1="38" x2="568" y2="38" strokeWidth="1.5" />
        <line x1="616" y1="38" x2="626" y2="38" strokeWidth="1.5" />
        <line x1="568" y1="14" x2="574" y2="20" strokeWidth="1.2" />
        <line x1="610" y1="56" x2="616" y2="62" strokeWidth="1.2" />
        <line x1="616" y1="14" x2="610" y2="20" strokeWidth="1.2" />
        <line x1="574" y1="56" x2="568" y2="62" strokeWidth="1.2" />
      </g>

      {/* ── Buildings — warm zone (left 3) ──────────────────────────── */}
      {/* Slightly warm facades */}
      <g>
        <rect x="30" y="158" width="38" height="42" fill="#f8ede0" stroke="var(--ds-gray-400)" strokeWidth="0.8" />
        <rect x="76" y="138" width="34" height="62" fill="#f8ede0" stroke="var(--ds-gray-400)" strokeWidth="0.8" />
        <rect x="118" y="118" width="42" height="82" fill="#f8ede0" stroke="var(--ds-gray-400)" strokeWidth="0.9" />
      </g>
      {/* Warm zone roof highlights */}
      <g stroke="var(--climate-terracotta)" strokeWidth="1.5" opacity="0.45">
        <line x1="28" y1="158" x2="70" y2="158" />
        <line x1="74" y1="138" x2="112" y2="138" />
        <line x1="116" y1="118" x2="162" y2="118" />
      </g>

      {/* ── Buildings — cool zone (center & right) ──────────────────── */}
      <g>
        <rect x="164" y="128" width="46" height="72" fill="#eef5f0" stroke="var(--climate-green)" strokeWidth="0.8" opacity="0.8" />
        <rect x="218" y="98" width="50" height="102" fill="#eef5f0" stroke="var(--climate-green)" strokeWidth="0.9" opacity="0.8" />
        <rect x="276" y="122" width="40" height="78" fill="#eef5f0" stroke="var(--climate-green)" strokeWidth="0.8" opacity="0.7" />
        <rect x="324" y="108" width="44" height="92" fill="#eef5f0" stroke="var(--climate-green)" strokeWidth="0.8" opacity="0.75" />
        <rect x="376" y="133" width="36" height="67" fill="#f0f6f2" stroke="var(--climate-green)" strokeWidth="0.7" opacity="0.65" />
        <rect x="420" y="142" width="38" height="58" fill="#f0f6f2" stroke="var(--climate-green)" strokeWidth="0.7" opacity="0.65" />
        <rect x="466" y="128" width="42" height="72" fill="#eef5f0" stroke="var(--climate-green)" strokeWidth="0.8" opacity="0.7" />
        <rect x="516" y="148" width="34" height="52" fill="#f0f6f2" stroke="var(--climate-green)" strokeWidth="0.7" opacity="0.6" />
      </g>
      {/* Cool zone roof accents */}
      <g stroke="var(--climate-green)" strokeWidth="1.5" opacity="0.6">
        <line x1="162" y1="128" x2="212" y2="128" />
        <line x1="216" y1="98" x2="270" y2="98" />
        <line x1="274" y1="122" x2="318" y2="122" />
        <line x1="322" y1="108" x2="370" y2="108" />
        <line x1="374" y1="133" x2="414" y2="133" />
      </g>

      {/* ── Windows — warm zone ─────────────────────────────────────── */}
      <g fill="var(--climate-terracotta)" stroke="var(--climate-terracotta)" strokeWidth="0.5" opacity="0.28">
        <rect x="38" y="166" width="7" height="7" rx="0.5" />
        <rect x="52" y="166" width="7" height="7" rx="0.5" />
        <rect x="38" y="179" width="7" height="7" rx="0.5" />
        <rect x="52" y="179" width="7" height="7" rx="0.5" />
        <rect x="84" y="146" width="6.5" height="6.5" rx="0.5" />
        <rect x="97" y="146" width="6.5" height="6.5" rx="0.5" />
        <rect x="84" y="159" width="6.5" height="6.5" rx="0.5" />
        <rect x="97" y="159" width="6.5" height="6.5" rx="0.5" />
        <rect x="84" y="172" width="6.5" height="6.5" rx="0.5" />
        <rect x="97" y="172" width="6.5" height="6.5" rx="0.5" />
        <rect x="126" y="126" width="8" height="8" rx="0.5" />
        <rect x="141" y="126" width="8" height="8" rx="0.5" />
        <rect x="126" y="141" width="8" height="8" rx="0.5" />
        <rect x="141" y="141" width="8" height="8" rx="0.5" />
        <rect x="126" y="156" width="8" height="8" rx="0.5" />
        <rect x="141" y="156" width="8" height="8" rx="0.5" />
        <rect x="126" y="171" width="8" height="8" rx="0.5" />
        <rect x="141" y="171" width="8" height="8" rx="0.5" />
      </g>

      {/* ── Windows — cool zone ─────────────────────────────────────── */}
      <g fill="var(--climate-cyan)" stroke="var(--climate-cyan)" strokeWidth="0.5" opacity="0.35">
        <rect x="172" y="136" width="7" height="7" rx="0.5" />
        <rect x="186" y="136" width="7" height="7" rx="0.5" />
        <rect x="172" y="150" width="7" height="7" rx="0.5" />
        <rect x="186" y="150" width="7" height="7" rx="0.5" />
        <rect x="172" y="164" width="7" height="7" rx="0.5" />
        <rect x="186" y="164" width="7" height="7" rx="0.5" />
        <rect x="226" y="106" width="8.5" height="8.5" rx="0.5" />
        <rect x="242" y="106" width="8.5" height="8.5" rx="0.5" />
        <rect x="226" y="122" width="8.5" height="8.5" rx="0.5" />
        <rect x="242" y="122" width="8.5" height="8.5" rx="0.5" />
        <rect x="226" y="138" width="8.5" height="8.5" rx="0.5" />
        <rect x="242" y="138" width="8.5" height="8.5" rx="0.5" />
        <rect x="226" y="154" width="8.5" height="8.5" rx="0.5" />
        <rect x="242" y="154" width="8.5" height="8.5" rx="0.5" />
        <rect x="284" y="130" width="7" height="7.5" rx="0.5" />
        <rect x="298" y="130" width="7" height="7.5" rx="0.5" />
        <rect x="284" y="144" width="7" height="7.5" rx="0.5" />
        <rect x="298" y="144" width="7" height="7.5" rx="0.5" />
        <rect x="332" y="116" width="7.5" height="7.5" rx="0.5" />
        <rect x="347" y="116" width="7.5" height="7.5" rx="0.5" />
        <rect x="332" y="130" width="7.5" height="7.5" rx="0.5" />
        <rect x="347" y="130" width="7.5" height="7.5" rx="0.5" />
        <rect x="332" y="144" width="7.5" height="7.5" rx="0.5" />
        <rect x="347" y="144" width="7.5" height="7.5" rx="0.5" />
      </g>

      {/* ── Heat shimmer rising from warm zone ──────────────────────── */}
      <g stroke="var(--climate-terracotta)" strokeWidth="0.8" strokeLinecap="round" opacity="0.12">
        <path d="M50 100 Q53 90 50 80" />
        <path d="M90 80 Q93 70 90 60" />
        <path d="M130 60 Q133 50 130 40" />
      </g>

      {/* ── Ground strip ─────────────────────────────────────────────── */}
      <rect x="0" y="200" width="680" height="32" fill="url(#hero-ground)" />
      <line x1="0" y1="200" x2="680" y2="200" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.30" />

      {/* ── Trees along street — bigger and greener ─────────────────── */}
      {[62, 158, 312, 432, 562].map((x, i) => (
        <g key={i} transform={`translate(${x}, 174) scale(${0.85 + i * 0.06})`}>
          <rect x="-1.5" y="10" width="3" height="18" rx="1.5" fill="var(--ds-gray-500)" opacity="0.22" />
          {/* Ground shadow */}
          <ellipse cx="0" cy="29" rx="9" ry="2" fill="var(--ds-gray-400)" opacity="0.08" />
          {/* Canopy layers */}
          <circle cx="0" cy="4" r="10" fill="var(--climate-green)" opacity="0.14" />
          <circle cx="0" cy="3" r="7.5" fill="var(--climate-green)" opacity="0.26" />
          <circle cx="0" cy="1.5" r="5" fill="var(--climate-green)" opacity="0.42" />
        </g>
      ))}

      {/* ── Route path ──────────────────────────────────────────────── */}
      {/* Glow */}
      <path
        d="M30 199c40-1 80 0 120 0s80 1 120 1 80 0 120 0 80-1 120 0"
        stroke="var(--climate-green)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.08"
      />
      {/* Path */}
      <path
        d="M30 199c40-1 80 0 120 0s80 1 120 1 80 0 120 0 80-1 120 0"
        stroke="var(--climate-green)"
        strokeWidth="2.5"
        strokeDasharray="7 5"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* ── Clouds ──────────────────────────────────────────────────── */}
      <g fill="white" opacity="0.55">
        <circle cx="102" cy="30" r="11" />
        <circle cx="118" cy="26" r="13" />
        <circle cx="134" cy="30" r="10" />
        <rect x="102" y="26" width="32" height="15" rx="7" />
      </g>
      <g fill="white" opacity="0.40">
        <circle cx="422" cy="22" r="9" />
        <circle cx="435" cy="18" r="11" />
        <circle cx="448" cy="22" r="8" />
        <rect x="422" y="18" width="26" height="12" rx="6" />
      </g>
    </svg>
  );
}

// ─── WaterFountainIcon ───────────────────────────────────────────────────────
export function WaterFountainIcon({ title = "Fuente de agua", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title && <title>{title}</title>}
      {/* Base */}
      <rect x="4" y="14" width="12" height="2" rx="1" fill="var(--ds-gray-500)" opacity="0.15" />
      {/* Pillar */}
      <rect x="8.5" y="7" width="3" height="7" rx="1.5" fill="var(--ds-gray-500)" opacity="0.2" />
      {/* Bowl */}
      <rect x="5" y="5.5" width="10" height="3" rx="1.5" fill="var(--climate-cyan)" opacity="0.15" stroke="var(--climate-cyan)" strokeWidth="1" />
      {/* Water drop */}
      <rect x="9" y="3" width="2" height="2.5" rx="1" fill="var(--climate-cyan)" opacity="0.35" />
    </svg>
  );
}

// ─── ClimateShelterIcon ──────────────────────────────────────────────────────
export function ClimateShelterIcon({ title = "Refugio climático", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title && <title>{title}</title>}
      {/* Roof */}
      <path d="M3 8L10 3.5 17 8" stroke="var(--ds-gray-600)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Walls */}
      <rect x="4.5" y="8" width="11" height="9" rx="0.5" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      {/* Door */}
      <rect x="8" y="12" width="4" height="5" rx="0.5" fill="var(--climate-green)" opacity="0.12" stroke="var(--climate-green)" strokeWidth="0.8" />
      {/* Thermometer */}
      <rect x="10" y="4.5" width="1.5" height="3" rx="0.75" fill="var(--ds-gray-500)" opacity="0.25" />
      <circle cx="10.75" cy="8.5" r="1" fill="var(--climate-green)" opacity="0.3" />
    </svg>
  );
}

// ─── ClimateRouteBadge ───────────────────────────────────────────────────────
export function ClimateRouteBadge({ title = "Ruta con alivio climático", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 34 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title && <title>{title}</title>}
      {/* Route line */}
      <path d="M3 15c5-5 9-8 13-8s7 2 11 6" stroke="var(--climate-green)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Waypoint dots */}
      <circle cx="10" cy="10" r="2" fill="var(--climate-green)" opacity="0.15" stroke="var(--climate-green)" strokeWidth="1" />
      <circle cx="18" cy="7" r="2" fill="var(--climate-green)" opacity="0.15" stroke="var(--climate-green)" strokeWidth="1" />
      <circle cx="27" cy="13" r="2" fill="var(--climate-green)" opacity="0.15" stroke="var(--climate-green)" strokeWidth="1" />
      {/* Tree icon at midpoint */}
      <rect x="16" y="3" width="1.5" height="4" rx="0.75" fill="var(--ds-gray-500)" opacity="0.2" />
      <circle cx="16.75" cy="2" r="2.5" fill="var(--climate-green)" opacity="0.15" />
    </svg>
  );
}

// ─── HeatmapBadgeIcon ────────────────────────────────────────────────────────
export function HeatmapBadgeIcon({ title = "Mapa de calor", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title && <title>{title}</title>}
      {/* Grid background */}
      <rect x="2" y="2" width="16" height="16" rx="2" fill="var(--ds-gray-50)" stroke="var(--ds-gray-400)" strokeWidth="0.8" />
      <line x1="2" y1="7" x2="18" y2="7" stroke="var(--ds-gray-400)" strokeWidth="0.5" opacity="0.4" />
      <line x1="2" y1="12" x2="18" y2="12" stroke="var(--ds-gray-400)" strokeWidth="0.5" opacity="0.4" />
      <line x1="7" y1="2" x2="7" y2="18" stroke="var(--ds-gray-400)" strokeWidth="0.5" opacity="0.4" />
      <line x1="12" y1="2" x2="12" y2="18" stroke="var(--ds-gray-400)" strokeWidth="0.5" opacity="0.4" />
      {/* Heat circles */}
      <circle cx="10" cy="10" r="5" fill="var(--climate-terracotta)" opacity="0.18" />
      <circle cx="10" cy="10" r="3" fill="var(--climate-terracotta)" opacity="0.3" />
      <circle cx="10" cy="10" r="1.5" fill="var(--climate-terracotta)" opacity="0.45" />
      {/* Cool spot */}
      <circle cx="5" cy="5" r="2" fill="var(--climate-green)" opacity="0.18" />
      <circle cx="5" cy="5" r="1" fill="var(--climate-green)" opacity="0.3" />
    </svg>
  );
}

// ─── MadridShelterBuildingArt ────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Ground */}
      <line x1="16" y1="100" x2="144" y2="100" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.25" />
      {/* Building 1 */}
      <rect x="32" y="52" width="30" height="48" rx="1" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      {/* Building 2 */}
      <rect x="80" y="44" width="36" height="56" rx="1" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      {/* Roof lines */}
      <line x1="29" y1="52" x2="65" y2="52" stroke="var(--climate-green)" strokeWidth="1.5" />
      <line x1="77" y1="44" x2="119" y2="44" stroke="var(--climate-green)" strokeWidth="1.5" />
      {/* Windows b1 */}
      <g fill="var(--ds-gray-50)" stroke="var(--ds-gray-400)" strokeWidth="0.8">
        <rect x="40" y="62" width="10" height="9" rx="1" />
        <rect x="56" y="62" width="8" height="9" rx="1" />
        <rect x="40" y="78" width="10" height="9" rx="1" />
        <rect x="56" y="78" width="8" height="9" rx="1" />
      </g>
      {/* Windows b2 */}
      <g fill="var(--climate-green)" stroke="var(--climate-green)" strokeWidth="0.8">
        <rect x="88" y="54" width="10" height="9" rx="1" opacity="0.15" />
        <rect x="106" y="54" width="8" height="9" rx="1" opacity="0.15" />
        <rect x="88" y="70" width="10" height="9" rx="1" opacity="0.12" />
        <rect x="106" y="70" width="8" height="9" rx="1" opacity="0.12" />
      </g>
      {/* Door */}
      <rect x="46" y="80" width="8" height="20" rx="1" fill="var(--climate-green)" opacity="0.1" stroke="var(--climate-green)" strokeWidth="1" />
      {/* Tree */}
      <rect x="135" y="82" width="3" height="18" rx="1.5" fill="var(--ds-gray-500)" opacity="0.2" />
      <circle cx="136.5" cy="75" r="10" fill="var(--climate-green)" opacity="0.12" />
      <circle cx="136.5" cy="73" r="7" fill="var(--climate-green)" opacity="0.2" />
      {/* Thermometer */}
      <circle cx="24" cy="36" r="5" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      <line x1="24" y1="41" x2="24" y2="48" stroke="var(--climate-green)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="50" r="2" fill="var(--climate-green)" opacity="0.35" />
    </svg>
  );
}

// ─── RouteResourceVisual ─────────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Route path */}
      <path d="M20 88c16-18 32-28 48-28s28 8 42 8 20-6 28-12" stroke="var(--climate-green)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 88c16-18 32-28 48-28s28 8 42 8 20-6 28-12" stroke="var(--climate-green)" strokeWidth="6" opacity="0.06" strokeLinecap="round" />
      {/* Waypoints */}
      <circle cx="34" cy="76" r="5" fill="var(--ds-gray-50)" stroke="var(--climate-green)" strokeWidth="1.2" />
      <circle cx="34" cy="76" r="2" fill="var(--climate-green)" opacity="0.25" />
      <circle cx="76" cy="58" r="5" fill="var(--ds-gray-50)" stroke="var(--climate-green)" strokeWidth="1.2" />
      <circle cx="76" cy="58" r="2" fill="var(--climate-green)" opacity="0.25" />
      <circle cx="124" cy="54" r="5" fill="var(--ds-gray-50)" stroke="var(--climate-green)" strokeWidth="1.2" />
      <circle cx="124" cy="54" r="2" fill="var(--climate-green)" opacity="0.25" />
      {/* Building */}
      <rect x="108" y="62" width="28" height="28" rx="1" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      <rect x="116" y="74" width="12" height="16" rx="0.5" fill="var(--climate-green)" opacity="0.08" stroke="var(--climate-green)" strokeWidth="0.8" />
      {/* Wind icon */}
      <path d="M60 24h12" stroke="var(--climate-cyan)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 28h16" stroke="var(--climate-cyan)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M62 32h10" stroke="var(--climate-cyan)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      {/* Tree */}
      <rect x="38" y="88" width="2" height="8" rx="1" fill="var(--ds-gray-500)" opacity="0.2" />
      <circle cx="39" cy="83" r="5" fill="var(--climate-green)" opacity="0.12" />
    </svg>
  );
}

// ─── MadridHeatmapMiniArt ────────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Map frame */}
      <rect x="16" y="12" width="128" height="96" rx="4" fill="var(--ds-gray-50)" stroke="var(--ds-gray-400)" strokeWidth="1" />
      {/* Grid */}
      <g stroke="var(--ds-gray-400)" strokeWidth="0.5" opacity="0.3">
        <line x1="40" y1="24" x2="40" y2="96" />
        <line x1="68" y1="24" x2="68" y2="96" />
        <line x1="96" y1="24" x2="96" y2="96" />
        <line x1="124" y1="24" x2="124" y2="96" />
        <line x1="28" y1="36" x2="132" y2="36" />
        <line x1="28" y1="56" x2="132" y2="56" />
        <line x1="28" y1="76" x2="132" y2="76" />
        <line x1="28" y1="96" x2="132" y2="96" />
      </g>
      {/* Heat zones */}
      <circle cx="80" cy="56" r="22" fill="var(--climate-terracotta)" opacity="0.12" />
      <circle cx="80" cy="56" r="14" fill="var(--climate-terracotta)" opacity="0.18" />
      <circle cx="80" cy="56" r="7" fill="var(--climate-terracotta)" opacity="0.28" />
      <circle cx="104" cy="72" r="16" fill="var(--climate-terracotta)" opacity="0.08" />
      <circle cx="104" cy="72" r="10" fill="var(--climate-terracotta)" opacity="0.14" />
      {/* Cool zone */}
      <circle cx="40" cy="34" r="5" fill="var(--climate-green)" opacity="0.12" />
      <circle cx="40" cy="34" r="2.5" fill="var(--climate-green)" opacity="0.2" />
      {/* Route */}
      <path d="M32 86c8-4 14-18 24-22s18 0 24 10 12 20 20 22" stroke="var(--climate-green)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 86c8-4 14-18 24-22s18 0 24 10 12 20 20 22" stroke="var(--climate-green)" strokeWidth="5" opacity="0.06" strokeLinecap="round" />
      {/* Sun */}
      <circle cx="132" cy="22" r="6" fill="var(--climate-terracotta)" opacity="0.15" />
      <circle cx="132" cy="22" r="3" fill="var(--climate-terracotta)" opacity="0.22" />
    </svg>
  );
}

// ─── RouteHeatVisual ─────────────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Ground */}
      <line x1="24" y1="88" x2="136" y2="88" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.25" />
      {/* Heat gradient bars */}
      <rect x="38" y="60" width="12" height="28" rx="2" fill="var(--climate-terracotta)" opacity="0.15" />
      <rect x="54" y="45" width="12" height="43" rx="2" fill="var(--climate-terracotta)" opacity="0.22" />
      <rect x="70" y="32" width="12" height="56" rx="2" fill="var(--climate-terracotta)" opacity="0.3" />
      {/* Transition */}
      <rect x="86" y="40" width="12" height="48" rx="2" fill="var(--climate-green)" opacity="0.18" />
      <rect x="102" y="50" width="12" height="38" rx="2" fill="var(--climate-green)" opacity="0.22" />
      <rect x="118" y="62" width="12" height="26" rx="2" fill="var(--climate-green)" opacity="0.28" />
      {/* Sun */}
      <circle cx="124" cy="22" r="10" fill="var(--climate-terracotta)" opacity="0.12" />
      <circle cx="124" cy="22" r="6" fill="var(--climate-terracotta)" opacity="0.18" />
      {/* Trees */}
      <g>
        <rect x="55" y="88" width="2" height="8" rx="1" fill="var(--ds-gray-500)" opacity="0.2" />
        <circle cx="56" cy="83" r="5" fill="var(--climate-green)" opacity="0.12" />
        <rect x="104" y="88" width="2" height="8" rx="1" fill="var(--ds-gray-500)" opacity="0.2" />
        <circle cx="105" cy="83" r="5" fill="var(--climate-green)" opacity="0.12" />
      </g>
    </svg>
  );
}

// ─── TreeBenchArt ────────────────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Ground */}
      <line x1="16" y1="96" x2="144" y2="96" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.25" />
      {/* Large tree */}
      <rect x="74" y="68" width="4" height="28" rx="2" fill="var(--ds-gray-500)" opacity="0.2" />
      <circle cx="76" cy="52" r="20" fill="var(--climate-green)" opacity="0.1" />
      <circle cx="76" cy="50" r="14" fill="var(--climate-green)" opacity="0.16" />
      <circle cx="76" cy="48" r="9" fill="var(--climate-green)" opacity="0.22" />
      {/* Bench */}
      <rect x="52" y="88" width="48" height="3" rx="1.5" fill="var(--ds-gray-500)" opacity="0.15" />
      <rect x="52" y="92" width="48" height="2" rx="1" fill="var(--ds-gray-500)" opacity="0.12" />
      <rect x="56" y="88" width="2" height="8" rx="1" fill="var(--ds-gray-500)" opacity="0.15" />
      <rect x="94" y="88" width="2" height="8" rx="1" fill="var(--ds-gray-500)" opacity="0.15" />
      {/* Small tree */}
      <rect x="129" y="80" width="3" height="16" rx="1.5" fill="var(--ds-gray-500)" opacity="0.15" />
      <circle cx="130.5" cy="72" r="10" fill="var(--climate-green)" opacity="0.1" />
      <circle cx="130.5" cy="70" r="7" fill="var(--climate-green)" opacity="0.16" />
      {/* Fountain */}
      <rect x="26" y="78" width="4" height="18" rx="2" fill="var(--ds-gray-500)" opacity="0.15" />
      <rect x="22" y="74" width="12" height="5" rx="2.5" fill="var(--climate-cyan)" opacity="0.08" stroke="var(--climate-cyan)" strokeWidth="0.8" />
      {/* Sun */}
      <circle cx="138" cy="20" r="10" fill="var(--climate-terracotta)" opacity="0.1" />
      <circle cx="138" cy="20" r="6" fill="var(--climate-terracotta)" opacity="0.16" />
      {/* Shade indicator */}
      <path d="M100 36c0-4 3-7 7-7" stroke="var(--climate-cyan)" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      <circle cx="107" cy="29" r="2" fill="var(--climate-cyan)" opacity="0.18" />
    </svg>
  );
}

// ─── RouteAdviceVisual ───────────────────────────────────────────────────────
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
      {title && <title>{title}</title>}
      {/* Ground */}
      <line x1="24" y1="92" x2="136" y2="92" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.25" />
      {/* Route */}
      <path d="M30 90c16-16 30-24 46-24s28 4 38 12" stroke="var(--climate-green)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 90c16-16 30-24 46-24s28 4 38 12" stroke="var(--climate-green)" strokeWidth="5" opacity="0.06" strokeLinecap="round" />
      {/* Sun */}
      <circle cx="118" cy="28" r="10" fill="var(--climate-terracotta)" opacity="0.12" />
      <circle cx="118" cy="28" r="6" fill="var(--climate-terracotta)" opacity="0.18" />
      {/* Trees */}
      <g>
        <rect x="56" y="78" width="3" height="14" rx="1.5" fill="var(--ds-gray-500)" opacity="0.15" />
        <circle cx="57.5" cy="70" r="8" fill="var(--climate-green)" opacity="0.1" />
        <circle cx="57.5" cy="69" r="5" fill="var(--climate-green)" opacity="0.16" />
      </g>
      {/* Bench */}
      <rect x="86" y="86" width="30" height="2" rx="1" fill="var(--ds-gray-500)" opacity="0.12" />
      <rect x="86" y="89" width="30" height="1.5" rx="0.75" fill="var(--ds-gray-500)" opacity="0.08" />
    </svg>
  );
}

// ─── Premium Visuals (PNG based) ─────────────────────────────────────────────

export function PremiumHeroVisual({ className, ...props }: any) {
  return (
    <div className={`relative overflow-hidden rounded-[32px] shadow-2xl bg-white/40 border border-black/5 ${className}`} {...props}>
      <img 
        src="/premium_skyline.png" 
        alt="Madrid Skyline Reference Style" 
        className="w-full h-full object-cover opacity-90"
      />
      <div className="absolute top-4 left-6 text-[8px] font-bold uppercase tracking-[0.3em] text-gray-400">Atmósfera Urbana</div>
    </div>
  );
}

export function PremiumCoolPlacesVisual({ className, ...props }: any) {
  return (
    <div className="relative h-28 w-28">
      <img 
        src="/card_lugares_frescos.png" 
        alt="Lugares Frescos" 
        className={`rounded-2xl shadow-sm object-cover ${className}`} 
        {...props} 
      />
    </div>
  );
}

export function PremiumHeatmapVisual({ className, ...props }: any) {
  return (
    <div className="relative h-28 w-28 overflow-hidden rounded-2xl">
      <img 
        src="/card_radiacion.png" 
        alt="Mapa de Calor" 
        className={`w-full h-full object-cover ${className}`} 
        {...props} 
      />
    </div>
  );
}

export function PremiumAdviceVisual({ className, ...props }: any) {
  return (
    <div className="relative h-28 w-44">
      <img 
        src="/card_consejo.png" 
        alt="Consejo del día" 
        className={`rounded-2xl shadow-sm object-cover ${className}`} 
        {...props} 
      />
    </div>
  );
}

// ─── HonestComparisonIcon ────────────────────────────────────────────────────
export function HonestComparisonIcon({ title = "Comparación", testId, className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" role={title ? "img" : undefined} aria-label={title} data-testid={testId} className={className} {...props}>
      {title && <title>{title}</title>}
      {/* Axes */}
      <path d="M4 4v12h12" stroke="var(--ds-gray-500)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      <circle cx="5" cy="14" r="1.5" fill="var(--ds-gray-500)" opacity="0.25" />
      <circle cx="8" cy="10" r="1.5" fill="var(--ds-gray-500)" opacity="0.25" />
      <circle cx="12" cy="6" r="1.5" fill="var(--climate-green)" opacity="0.3" stroke="var(--climate-green)" strokeWidth="1" />
      {/* Trend line */}
      <path d="M5 14l3-4 4-4" stroke="var(--climate-green)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" opacity="0.35" />
    </svg>
  );
}
