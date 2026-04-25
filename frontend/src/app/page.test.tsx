import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("./home-data-state", () => ({
  getTop10PanelState: () => "loading",
}));

import Home from "./page";

describe("Home hero", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }))
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("barrios_merged.geojson")) {
          return {
            ok: true,
            json: async () => ({ features: [] }),
          } as Response;
        }

        if (url.includes("refugios_sustitutos.geojson")) {
          return {
            ok: true,
            json: async () => ({ features: [] }),
          } as Response;
        }

        return {
          ok: false,
          json: async () => ({}),
        } as Response;
      })
    );
  });

  it("renders the branded alcala logo and the refreshed hero art", async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getAllByTestId("alcala-logo").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("hero-climate-art")).toBeInTheDocument();
    expect(screen.getAllByTestId("organic-tree").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Una herramienta principal, tres pasos claros")).toBeInTheDocument();
    expect(screen.getByText("Fuentes de datos abiertos")).toBeInTheDocument();
  });

  it("keeps the differentiator block focused on the main copy and updated pillar icons", async () => {
    const { container } = render(<Home />);

    await screen.findByText("Por que es distinto");

    expect(screen.queryByText("Valor inmediato")).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="value-pillar-icon-salud"] .lucide-thermometer-sun')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="value-pillar-icon-clima"] .lucide-tree-pine')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="value-pillar-icon-equidad"] .lucide-users')).toBeInTheDocument();
  });
});
