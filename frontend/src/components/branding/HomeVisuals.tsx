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
      <path d="M7 36.5h34" stroke="#1d2733" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 36.5V23.5c0-1.6 1.3-2.9 2.9-2.9H35c1.7 0 3 1.3 3 2.9v13" stroke="#1d2733" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 36.5V27c0-1.2 1-2.2 2.2-2.2h4.1c1.2 0 2.2 1 2.2 2.2v9.5" stroke="#1d2733" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26.1 36.5V18c0-1.5 1.2-2.7 2.7-2.7h6.3c1.5 0 2.7 1.2 2.7 2.7v18.5" stroke="#1d2733" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.9 36.5V17.3c0-1.8 1.5-3.3 3.3-3.3h1.6c1.8 0 3.3 1.5 3.3 3.3v19.2" stroke="#1d2733" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 14.1h6M27 11.3l-3-2.8-3 2.8" stroke="#1d2733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34.7 10.6c2.3-.3 3.9-1.5 4.8-3.8 1.2 2.3 1 4.6-.7 6.3" fill="#52b788" />
      <path d="M34.7 10.6c2.3-.3 3.9-1.5 4.8-3.8 1.2 2.3 1 4.6-.7 6.3" stroke="#2d6a4f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroClimateArt({ className, testId = "hero-climate-art", ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 680 232" fill="none" preserveAspectRatio="xMidYMid meet" data-testid={testId} className={className} {...props}>
      <defs>
        <linearGradient id="hero-sky-wash" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4efe7" />
          <stop offset="1" stopColor="#ddebe4" />
        </linearGradient>
        <linearGradient id="hero-building-wash" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#efe9de" />
          <stop offset="1" stopColor="#dfe7e3" />
        </linearGradient>
      </defs>

      <path d="M0 183c82-18 160-26 240-18 84 8 167-6 255-34 71-22 132-25 185-14v115H0Z" fill="url(#hero-sky-wash)" />
      <circle cx="580" cy="42" r="30" fill="#f2dcc2" opacity="0.78" />
      <circle cx="579" cy="42" r="18" fill="#f7ead9" opacity="0.95" />

      <g opacity="0.96">
        <path d="M78 103h46v82H78zM131 122h33v63h-33zM176 79h42v106h-42zM227 110h32v75h-32z" fill="url(#hero-building-wash)" />
        <path d="M318 92h60v93h-60z" fill="#e4e9e5" />
        <path d="M331 95c4-26 17-43 39-43 21 0 34 17 38 43v90h-77V95Z" fill="#d5e0da" />
        <path d="M355 51V32M344 36h22" stroke="#bfd1c7" strokeWidth="4" strokeLinecap="round" />
        <path d="M445 82h38v103h-38zM492 66h42v119h-42zM546 101h28v84h-28z" fill="#e9ece7" />
      </g>

      <g opacity="0.64" stroke="#c8d4ce" strokeWidth="3" strokeLinecap="round">
        <path d="M301 127h108M312 145h86M324 163h63" />
        <path d="M102 119h18M102 134h18M102 149h18" />
        <path d="M459 114h12M459 132h12M459 150h12" />
      </g>

      <path d="M38 208c89-17 183-20 285-10 87 8 168 7 239-12" stroke="#c5d7cd" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <path d="M0 220h680" stroke="#d4ddd8" strokeWidth="2" opacity="0.75" />

      <g transform="translate(116 122)">
        <OrganicTree testId="organic-tree" width="78" height="100" />
      </g>
      <g transform="translate(374 102)">
        <OrganicTree testId="organic-tree" width="92" height="116" />
      </g>
      <g transform="translate(565 128)">
        <OrganicTree testId="organic-tree" width="72" height="92" />
      </g>

      <path d="M520 24c18-3 27-12 30-25 6 14 0 27-13 34" fill="#b4d0be" opacity="0.72" />
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
      <ellipse cx="80" cy="108" rx="50" ry="8" fill="#00000012" />
      <path d="M24 99h112" stroke="#d4c8b7" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 34h84v54H38z" fill="#e8e4d9" stroke="#b6a891" strokeWidth="3" strokeLinejoin="round" />
      <path d="M33 30h94" stroke="#1a3d2b" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 24h76" stroke="#d8d0c1" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 18h8M62 18h8M76 18h8M90 18h8M104 18h8" stroke="#d8d0c1" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 50h18v12H50zM92 50h18v12H92z" fill="#f8f5ef" stroke="#b6a891" strokeWidth="2.5" />
      <path d="M48 88V70c0-9 5-16 12-16s12 7 12 16v18" fill="#f6f2ea" stroke="#1a3d2b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M74 88V68c0-10 5-18 12-18s12 8 12 18v20" fill="#f6f2ea" stroke="#1a3d2b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 88V70c0-9 5-16 12-16s12 7 12 16v18" fill="#f6f2ea" stroke="#1a3d2b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M56 88V72M82 88V70M108 88V72" stroke="#1a3d2b" strokeWidth="3" strokeLinecap="round" />
      <path d="M77 88c0-3 1-5 3-7 2 2 3 4 3 7" fill="#1a3d2b" />
      <path d="M79 88v10" stroke="#1a3d2b" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 62c8-2 14-6 19-14 4 6 5 12 1 18" fill="#dcebdc" stroke="#52b788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M18 90c20-24 39-38 58-38 15 0 24 10 36 10 9 0 18-5 30-17" stroke="#2d6a4f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="76" r="8" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="4" />
      <circle cx="78" cy="55" r="8" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="4" />
      <circle cx="126" cy="43" r="8" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="4" />
      <path d="M112 90V62l14-10 14 10v28Z" fill="#f6f2ea" stroke="#1a3d2b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M126 49V66" stroke="#1a3d2b" strokeWidth="3" strokeLinecap="round" />
      <rect x="122" y="45" width="8" height="10" rx="4" fill="#1a3d2b" />
      <path d="M48 95c7-1 12-5 16-12 3 6 3 11-1 16" fill="#dcebdc" stroke="#52b788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M86 92c7-1 12-5 16-12 3 6 3 11-1 16" fill="#dcebdc" stroke="#52b788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 26c0-7 5-12 12-12" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
      <path d="M73 15c3 4 3 7 0 11-4-1-6-4-6-7 0-2 2-3 6-4Z" fill="#0ea5e9" />
    </svg>
  );
}

export function MadridHeatmapMiniArt({ title, testId, className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 160"
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
      <rect x="16" y="24" width="128" height="112" rx="22" fill="#f7efe4" stroke="#d9cab3" strokeWidth="3" />
      <path d="M40 42v76M68 42v76M96 42v76M124 42v76" stroke="#ddd0ba" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 58h100M30 84h100M30 110h100" stroke="#ddd0ba" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 96c10-5 17-9 22-21 7-16 20-22 36-18 12 3 20 12 24 26 7 22 17 29 28 31" stroke="#cfb899" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
      <circle cx="58" cy="88" r="26" fill="#fde2bf" />
      <circle cx="92" cy="77" r="33" fill="#f6ad55" fillOpacity="0.95" />
      <circle cx="101" cy="102" r="30" fill="#e67e22" fillOpacity="0.88" />
      <circle cx="116" cy="108" r="19" fill="#c0392b" fillOpacity="0.92" />
      <circle cx="52" cy="54" r="8" fill="#f7f1e8" opacity="0.72" />
      <path d="M116 34c7-1 13-4 17-11 3 7 2 13-3 18" fill="#d6e8dc" stroke="#7aa78e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <circle cx="120" cy="28" r="16" fill="#f6ad55" />
      <circle cx="120" cy="28" r="9" fill="#fde2bf" />
      <path d="M24 89h112" stroke="#d9cab3" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 89 72 48h42" stroke="#c0392b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
      <path d="M38 89 72 48" stroke="#f6ad55" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
      <path d="M72 48h42" stroke="#2d6a4f" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 82 94 46" stroke="#c7dfd0" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
      <path d="M56 96c8-2 13-6 17-14 4 6 4 12 0 17" fill="#dcebdc" stroke="#52b788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M104 95c8-2 13-6 17-14 4 6 4 12 0 17" fill="#dcebdc" stroke="#52b788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TreeBenchArt({ title, testId, className, size = 160, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 160"
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
      <ellipse cx="78" cy="142" rx="50" ry="10" fill="#00000012" />
      <path d="M46 78v50" stroke="#8b5e3c" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 30c14 0 25 5 32 16 12 1 21 10 21 22 0 12-9 21-21 22-5 12-18 20-33 20-18 0-32-6-42-19-10-2-18-11-18-23 0-14 10-24 24-25 7-12 20-19 37-19Z" fill="#2d6a4f" />
      <path d="M46 38c11 0 20 4 26 12 10 1 17 8 17 17 0 10-7 17-17 18-4 9-15 15-27 15-14 0-24-4-31-14-8-2-13-9-13-18 0-10 8-18 18-18 5-8 14-12 27-12Z" fill="#52b788" />
      <path d="M78 102h28" stroke="#b48458" strokeWidth="5" strokeLinecap="round" />
      <path d="M75 112h34" stroke="#b48458" strokeWidth="5" strokeLinecap="round" />
      <path d="M81 118l-5 12M104 118l5 12" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round" />
      <path d="M114 49c10-2 18-7 23-18 5 9 5 18-1 26" fill="#dcebdc" stroke="#52b788" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M24 92h112" stroke="#d4c8b7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="118" cy="30" r="12" fill="#f6ad55" opacity="0.95" />
      <path d="M118 10v-7M103 16l-5-5M133 16l5-5" stroke="#c26a1b" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 46c13 0 24 5 31 16 12 1 21 10 21 22 0 12-9 21-21 22-5 10-16 14-30 14-18 0-31-6-39-19-11-2-18-11-18-23 0-14 10-24 24-25 7-11 17-17 32-17Z" fill="#2d6a4f" />
      <path d="M56 53c10 0 18 4 24 11 9 1 15 8 15 17 0 9-6 16-15 17-4 8-13 12-24 12-13 0-22-4-28-13-7-2-12-8-12-17 0-10 7-17 16-17 5-7 13-10 24-10Z" fill="#52b788" />
      <path d="M54 92h44" stroke="#d9f3e2" strokeWidth="8" strokeLinecap="round" />
      <path d="M54 78h54" stroke="#d9f3e2" strokeWidth="8" strokeLinecap="round" opacity="0.72" />
      <path d="M48 28c0-8 6-14 14-14" stroke="#0a72ef" strokeWidth="4" strokeLinecap="round" />
      <path d="M64 13c4 5 4 9 0 13-5-1-7-4-7-8 0-2 2-4 7-5Z" fill="#0a72ef" />
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
