import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  color?: "green" | "terracotta" | "cyan" | "mixed";
  strokeWidth?: number;
};

const COLORS = {
  green: "#4A7C59",
  terracotta: "#D48C4E",
  cyan: "#5CCEE4",
};

function getStrokeColor(color: IconProps["color"], stroke?: number) {
  if (color === "green") return COLORS.green;
  if (color === "terracotta") return COLORS.terracotta;
  if (color === "cyan") return COLORS.cyan;
  if (color === "mixed") return undefined;
  return undefined;
}

type SvgIconProps = IconProps & {
  children?: React.ReactNode;
};

export function ThermometerSun({
  className,
  color = "terracotta",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v4" stroke={COLORS.terracotta} />
      <path d="M12 18v4" stroke={COLORS.terracotta} />
      <path d="M4.93 4.93l2.83 2.83" stroke={COLORS.terracotta} />
      <path d="M16.24 16.24l2.83 2.83" stroke={COLORS.terracotta} />
      <path d="M2 12h4" stroke={COLORS.terracotta} />
      <path d="M18 12h4" stroke={COLORS.terracotta} />
      <path d="M15.5 8.5L12 12l-3.5-3.5" stroke={COLORS.green} />
      <circle cx="12" cy="12" r="3" stroke={COLORS.terracotta} />
      <path d="M12 9v6" stroke={COLORS.terracotta} />
      <circle cx="12" cy="15" r="1" fill={COLORS.terracotta} />
    </svg>
  );
}

export function TreePine({
  className,
  color = "green",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22V12" stroke={COLORS.terracotta} />
      <path
        d="M12 4L6 10h3L5 16h3l-3 6h12l-3-6h3l-4-6h3L12 4Z"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.1"
      />
    </svg>
  );
}

export function Droplets({
  className,
  color = "cyan",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0Z"
        stroke={COLORS.cyan}
        fill={COLORS.cyan}
        fillOpacity="0.1"
      />
      <path d="M8 14a2.5 2.5 0 0 0 5 0" stroke={COLORS.cyan} />
    </svg>
  );
}

export function Building2({
  className,
  color = "green",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M10 20v-6h4v6"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.08"
      />
      <path
        d="M12 3l8 4v13H4V7l8-4Z"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.05"
      />
      <rect x="8" y="11" width="2" height="2" fill={COLORS.green} fillOpacity="0.15" />
      <rect x="14" y="11" width="2" height="2" fill={COLORS.green} fillOpacity="0.15" />
      <rect x="8" y="15" width="2" height="2" fill={COLORS.green} fillOpacity="0.15" />
      <rect x="14" y="15" width="2" height="2" fill={COLORS.green} fillOpacity="0.15" />
    </svg>
  );
}

export function Database({
  className,
  color = "cyan",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" stroke={COLORS.cyan} />
      <path d="M4 7v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7" stroke={COLORS.cyan} />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" stroke={COLORS.cyan} />
    </svg>
  );
}

export function Wind({
  className,
  color = "cyan",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" stroke={COLORS.cyan} />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" stroke={COLORS.cyan} />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" stroke={COLORS.cyan} />
    </svg>
  );
}

export function Users({
  className,
  color = "green",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke={COLORS.green}
      />
      <circle cx="9" cy="7" r="4" stroke={COLORS.green} />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={COLORS.green} />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={COLORS.green} />
    </svg>
  );
}

export function Landmark({
  className,
  color = "green",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M4 10v11l2 2 2-2V10"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.05"
      />
      <path
        d="M10 10v11l2 2 2-2V10"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.05"
      />
      <path
        d="M16 10v11l2 2 2-2V10"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.05"
      />
      <path d="M2 20h20" stroke={COLORS.green} />
      <path d="M4 10l8-7 8 7" stroke={COLORS.terracotta} />
      <circle cx="12" cy="3" r="1" fill={COLORS.terracotta} />
    </svg>
  );
}

export function MapPin({
  className,
  color = "terracotta",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        stroke={COLORS.terracotta}
        fill={COLORS.terracotta}
        fillOpacity="0.1"
      />
      <circle cx="12" cy="9" r="2.5" stroke={COLORS.terracotta} />
    </svg>
  );
}

export function AlertTriangle({
  className,
  color = "terracotta",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke={COLORS.terracotta}
        fill={COLORS.terracotta}
        fillOpacity="0.08"
      />
      <path d="M12 9v4" stroke={COLORS.terracotta} />
      <circle cx="12" cy="17" r="0.5" fill={COLORS.terracotta} />
    </svg>
  );
}

export function Clock3({
  className,
  color = "terracotta",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke={COLORS.terracotta} />
      <path d="M12 6v6l4 2" stroke={COLORS.terracotta} />
    </svg>
  );
}

export function Download({
  className,
  color = "green",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={COLORS.green} />
      <path d="M7 10l5 5 5-5" stroke={COLORS.green} />
      <path d="M12 15V3" stroke={COLORS.green} />
    </svg>
  );
}

export function Navigation({
  className,
  color = "green",
  strokeWidth = 1.8,
  ...props
}: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M3 11l19-9-9 19-2-8-8-2Z"
        stroke={COLORS.green}
        fill={COLORS.green}
        fillOpacity="0.1"
      />
    </svg>
  );
}
