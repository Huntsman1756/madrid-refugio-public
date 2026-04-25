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
        <path d="M7 37h34" stroke="#1d2733" strokeWidth="2.4" />
        <path d="M11 37V25.5c0-1.4 1.1-2.5 2.5-2.5H23v14" stroke="#1d2733" strokeWidth="2.2" />
        <path d="M25 37V18.5c0-1.6 1.3-2.9 2.9-2.9h6.7c1.6 0 2.9 1.3 2.9 2.9V37" stroke="#1d2733" strokeWidth="2.2" />
        <path d="M15 37v-7.4c0-1 .8-1.8 1.8-1.8h2.4c1 0 1.8.8 1.8 1.8V37" stroke="#1d2733" strokeWidth="1.9" />
        <path d="M29.2 21.5h4.1M29.2 26h4.1M29.2 30.5h4.1" stroke="#1d2733" strokeWidth="1.6" />
        <path d="M24 15.9V9.8M20.8 12.7H27" stroke="#1d2733" strokeWidth="1.8" />
        <path d="M38 17.2c2.5-.8 4-2.5 4.5-5.2 1.7 3.6.9 6.3-2.4 8.1" fill="#d7efe0" stroke="#2d6a4f" strokeWidth="1.5" />
        <path d="M12 21c3.2-4.2 7.3-6.2 12.1-6.2 3.9 0 7.4 1.3 10.4 3.8" stroke="#52b788" strokeWidth="1.6" opacity="0.9" />
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
  return <RouteResourceVisual title={title} testId={testId} className={className} size={size} {...props} />;
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
  return <RouteHeatVisual title={title} testId={testId} className={className} size={size} {...props} />;
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
  return <RouteAdviceVisual title={title} testId={testId} className={className} size={size} {...props} />;
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
