import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMapComponent = () => <div data-testid="map-component" />;
    return MockMapComponent;
  },
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  Tooltip: () => null,
  Radar: () => null,
}));

import { getTop10PanelState } from "./home-data-state.js";

describe("getTop10PanelState", () => {
  it("shows an error state instead of an endless loading state when merged data fails", () => {
    expect(getTop10PanelState(null, "No se pudo cargar el análisis territorial.")).toBe("error");
  });

  it("keeps the loading state while merged data is still pending", () => {
    expect(getTop10PanelState(null, null)).toBe("loading");
  });

  it("shows the ranking once merged data is available", () => {
    expect(getTop10PanelState({ features: [{ properties: { NOMBRE: "Sol" } }] }, null)).toBe("ready");
  });
});
