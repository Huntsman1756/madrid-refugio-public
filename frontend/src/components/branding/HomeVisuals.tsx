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
      {/* Ground line */}
      <path d="M6 42h36" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.3" />
      {/* Left building */}
      <rect x="10" y="24" width="14" height="18" rx="0.5" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      {/* Right building */}
      <rect x="26" y="18" width="14" height="24" rx="0.5" fill="var(--ds-gray-50)" stroke="var(--ds-gray-500)" strokeWidth="1" />
      {/* Roof accents */}
      <path d="M8 24h18" stroke="var(--climate-green)" strokeWidth="1.5" />
      <path d="M24 18h18" stroke="var(--climate-green)" strokeWidth="1.5" />
      {/* Windows — left */}
      <g fill="var(--ds-gray-50)" stroke="var(--ds-gray-400)" strokeWidth="0.8">
        <rect x="13" y="28" width="4" height="4" rx="0.5" />
        <rect x="19" y="28" width="4" height="4" rx="0.5" />
        <rect x="13" y="35" width="4" height="3" rx="0.5" />
        <rect x="19" y="35" width="4" height="3" rx="0.5" />
      </g>
      {/* Windows — right */}
      <g fill="var(--ds-gray-50)" stroke="var(--ds-gray-400)" strokeWidth="0.8">
        <rect x="29" y="22" width="4" height="4" rx="0.5" />
        <rect x="35" y="22" width="4" height="4" rx="0.5" />
        <rect x="29" y="29" width="4" height="4" rx="0.5" />
        <rect x="35" y="29" width="4" height="4" rx="0.5" />
      </g>
      {/* Door */}
      <rect x="15" y="36" width="5" height="6" rx="0.5" fill="var(--climate-green)" opacity="0.15" stroke="var(--climate-green)" strokeWidth="1" />
      {/* Tree */}
      <rect x="40" y="32" width="2" height="10" rx="1" fill="var(--ds-gray-500)" opacity="0.2" />
      <circle cx="41" cy="29" r="5" fill="var(--climate-green)" opacity="0.15" />
      <circle cx="41" cy="28" r="3.5" fill="var(--climate-green)" opacity="0.25" />
      {/* Sun */}
      <circle cx="40" cy="8" r="3" fill="var(--climate-terracotta)" opacity="0.4" />
    </svg>
  );
}

// ─── HeroClimateArt ──────────────────────────────────────────────────────────
export function HeroClimateArt({ className, testId = "hero-climate-art", ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 680 232" fill="none" preserveAspectRatio="xMidYMid meet" data-testid={testId} className={className} {...props}>
      {/* ── Sky ─────────────────────────────────────────────────────── */}
      <rect width="680" height="232" fill="var(--ds-gray-50)" />
      {/* Sun */}
      <circle cx="590" cy="36" r="22" fill="var(--climate-terracotta)" opacity="0.08" />
      <circle cx="590" cy="36" r="14" fill="var(--climate-terracotta)" opacity="0.12" />
      <circle cx="590" cy="36" r="8" fill="var(--climate-terracotta)" opacity="0.2" />
      {/* Sun rays */}
      <g stroke="var(--climate-terracotta)" strokeWidth="1" opacity="0.1">
        <line x1="590" y1="8" x2="590" y2="14" />
        <line x1="590" y1="58" x2="590" y2="64" />
        <line x1="564" y1="36" x2="570" y2="36" />
        <line x1="610" y1="36" x2="616" y2="36" />
      </g>

      {/* ── Buildings — warm zone (left) ────────────────────────────── */}
      <g stroke="var(--ds-gray-400)" strokeWidth="1">
        <rect x="30" y="160" width="36" height="40" fill="var(--ds-gray-50)" />
        <rect x="74" y="140" width="32" height="60" fill="var(--ds-gray-50)" />
        <rect x="114" y="120" width="40" height="80" fill="var(--ds-gray-50)" />
      </g>

      {/* ── Buildings — cool zone (center & right) ──────────────────── */}
      <g stroke="var(--climate-green)" strokeWidth="1">
        <rect x="162" y="130" width="44" height="70" fill="var(--climate-green)" opacity="0.06" />
        <rect x="214" y="100" width="48" height="100" fill="var(--climate-green)" opacity="0.08" />
        <rect x="270" y="125" width="38" height="75" fill="var(--climate-green)" opacity="0.05" />
        <rect x="316" y="110" width="42" height="90" fill="var(--climate-green)" opacity="0.07" />
        <rect x="366" y="135" width="34" height="65" fill="var(--climate-green)" opacity="0.04" />
        <rect x="408" y="145" width="36" height="55" fill="var(--climate-green)" opacity="0.05" />
        <rect x="452" y="130" width="40" height="70" fill="var(--climate-green)" opacity="0.06" />
        <rect x="500" y="150" width="32" height="50" fill="var(--climate-green)" opacity="0.04" />
      </g>

      {/* ── Windows — warm zone ─────────────────────────────────────── */}
      <g fill="var(--ds-gray-50)" stroke="var(--ds-gray-400)" strokeWidth="0.8">
        {/* bldg 1 */}
        <rect x="38" y="168" width="6" height="6" rx="0.5" />
        <rect x="52" y="168" width="6" height="6" rx="0.5" />
        <rect x="38" y="180" width="6" height="6" rx="0.5" />
        <rect x="52" y="180" width="6" height="6" rx="0.5" />
        {/* bldg 2 */}
        <rect x="82" y="148" width="5.5" height="5.5" rx="0.5" />
        <rect x="94" y="148" width="5.5" height="5.5" rx="0.5" />
        <rect x="82" y="160" width="5.5" height="5.5" rx="0.5" />
        <rect x="94" y="160" width="5.5" height="5.5" rx="0.5" />
        <rect x="82" y="172" width="5.5" height="5.5" rx="0.5" />
        <rect x="94" y="172" width="5.5" height="5.5" rx="0.5" />
        {/* bldg 3 */}
        <rect x="122" y="128" width="7" height="7" rx="0.5" />
        <rect x="138" y="128" width="7" height="7" rx="0.5" />
        <rect x="122" y="142" width="7" height="7" rx="0.5" />
        <rect x="138" y="142" width="7" height="7" rx="0.5" />
        <rect x="122" y="156" width="7" height="7" rx="0.5" />
        <rect x="138" y="156" width="7" height="7" rx="0.5" />
        <rect x="122" y="170" width="7" height="7" rx="0.5" />
        <rect x="138" y="170" width="7" height="7" rx="0.5" />
      </g>

      {/* ── Windows — cool zone ─────────────────────────────────────── */}
      <g fill="var(--climate-green)" stroke="var(--climate-green)" strokeWidth="0.8">
        {/* bldg 4 */}
        <rect x="170" y="138" width="7" height="7" rx="0.5" opacity="0.18" />
        <rect x="184" y="138" width="7" height="7" rx="0.5" opacity="0.18" />
        <rect x="170" y="152" width="7" height="7" rx="0.5" opacity="0.14" />
        <rect x="184" y="152" width="7" height="7" rx="0.5" opacity="0.14" />
        <rect x="170" y="166" width="7" height="7" rx="0.5" opacity="0.12" />
        <rect x="184" y="166" width="7" height="7" rx="0.5" opacity="0.12" />
        {/* bldg 5 */}
        <rect x="222" y="108" width="8" height="8" rx="0.5" opacity="0.2" />
        <rect x="238" y="108" width="8" height="8" rx="0.5" opacity="0.2" />
        <rect x="222" y="124" width="8" height="8" rx="0.5" opacity="0.16" />
        <rect x="238" y="124" width="8" height="8" rx="0.5" opacity="0.16" />
        <rect x="222" y="140" width="8" height="8" rx="0.5" opacity="0.14" />
        <rect x="238" y="140" width="8" height="8" rx="0.5" opacity="0.14" />
        <rect x="222" y="156" width="8" height="8" rx="0.5" opacity="0.12" />
        <rect x="238" y="156" width="8" height="8" rx="0.5" opacity="0.12" />
        <rect x="222" y="172" width="8" height="8" rx="0.5" opacity="0.1" />
        <rect x="238" y="172" width="8" height="8" rx="0.5" opacity="0.1" />
        {/* bldg 6 */}
        <rect x="278" y="133" width="6.5" height="7" rx="0.5" opacity="0.15" />
        <rect x="292" y="133" width="6.5" height="7" rx="0.5" opacity="0.15" />
        <rect x="278" y="147" width="6.5" height="7" rx="0.5" opacity="0.12" />
        <rect x="292" y="147" width="6.5" height="7" rx="0.5" opacity="0.12" />
        <rect x="278" y="161" width="6.5" height="7" rx="0.5" opacity="0.1" />
        <rect x="292" y="161" width="6.5" height="7" rx="0.5" opacity="0.1" />
        {/* bldg 7 */}
        <rect x="324" y="118" width="7" height="7" rx="0.5" opacity="0.18" />
        <rect x="338" y="118" width="7" height="7" rx="0.5" opacity="0.18" />
        <rect x="324" y="132" width="7" height="7" rx="0.5" opacity="0.14" />
        <rect x="338" y="132" width="7" height="7" rx="0.5" opacity="0.14" />
        <rect x="324" y="146" width="7" height="7" rx="0.5" opacity="0.12" />
        <rect x="338" y="146" width="7" height="7" rx="0.5" opacity="0.12" />
        <rect x="324" y="160" width="7" height="7" rx="0.5" opacity="0.1" />
        <rect x="338" y="160" width="7" height="7" rx="0.5" opacity="0.1" />
        {/* bldg 8 */}
        <rect x="374" y="143" width="6" height="6" rx="0.5" opacity="0.14" />
        <rect x="386" y="143" width="6" height="6" rx="0.5" opacity="0.14" />
        <rect x="374" y="155" width="6" height="6" rx="0.5" opacity="0.12" />
        <rect x="386" y="155" width="6" height="6" rx="0.5" opacity="0.12" />
        <rect x="374" y="167" width="6" height="6" rx="0.5" opacity="0.1" />
        <rect x="386" y="167" width="6" height="6" rx="0.5" opacity="0.1" />
      </g>

      {/* ── Ground ──────────────────────────────────────────────────── */}
      <line x1="0" y1="200" x2="680" y2="200" stroke="var(--ds-gray-400)" strokeWidth="1" opacity="0.25" />

      {/* ── Trees along street ──────────────────────────────────────── */}
      <g>
        {[60, 155, 310, 430, 560].map((x, i) => (
          <g key={i} transform={`translate(${x}, 175) scale(${0.8 + i * 0.05})`}>
            <rect x="-1" y="8" width="2" height="17" rx="1" fill="var(--ds-gray-500)" opacity="0.2" />
            <circle cx="0" cy="3" r="7" fill="var(--climate-green)" opacity="0.15" />
            <circle cx="0" cy="2" r="4.5" fill="var(--climate-green)" opacity="0.25" />
          </g>
        ))}
      </g>

      {/* ── Route path — highlighted ────────────────────────────────── */}
      <path
        d="M30 199c40-1 80 0 120 0s80 1 120 1 80 0 120 0 80-1 120 0"
        stroke="var(--climate-green)"
        strokeWidth="2"
        strokeDasharray="6 4"
        opacity="0.35"
      />
      {/* Route glow */}
      <path
        d="M30 199c40-1 80 0 120 0s80 1 120 1 80 0 120 0 80-1 120 0"
        stroke="var(--climate-green)"
        strokeWidth="6"
        strokeDasharray="6 4"
        opacity="0.06"
      />

      {/* ── Clouds ──────────────────────────────────────────────────── */}
      <g fill="var(--ds-gray-400)" opacity="0.15">
        <circle cx="100" cy="28" r="10" />
        <circle cx="115" cy="24" r="12" />
        <circle cx="130" cy="28" r="9" />
        <rect x="100" y="24" width="30" height="14" rx="7" />
      </g>
      <g fill="var(--ds-gray-400)" opacity="0.1">
        <circle cx="420" cy="20" r="8" />
        <circle cx="432" cy="17" r="10" />
        <circle cx="444" cy="20" r="7" />
        <rect x="420" y="17" width="24" height="10" rx="5" />
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
