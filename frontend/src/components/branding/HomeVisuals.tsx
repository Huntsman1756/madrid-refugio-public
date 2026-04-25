import type { SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement> & {
  title?: string;
  testId?: string;
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
