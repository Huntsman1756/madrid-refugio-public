import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SearchOption } from "@/lib/madrid-search";

const SEARCH_OPTIONS: SearchOption[] = [
  {
    id: "origin-1",
    label: "Plaza Mayor, Madrid",
    kind: "place",
    lat: 40.4155,
    lon: -3.7074,
  },
  {
    id: "destination-1",
    label: "Museo del Prado, Madrid",
    kind: "place",
    lat: 40.4138,
    lon: -3.6921,
  },
];

const fetchMock = vi.fn();
const getSearchOptionsMock = vi.fn(async (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  return SEARCH_OPTIONS.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
});
const originalGeolocation = navigator.geolocation;

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMapComponent = () => <div data-testid="map-component" />;
    return MockMapComponent;
  },
}));

vi.mock("@/lib/search-source", () => ({
  getSearchOptions: (...args: Parameters<typeof getSearchOptionsMock>) => getSearchOptionsMock(...args),
  getApiBaseUrl: () => "",
}));

import { RoutingSection } from "./RoutingSection";

describe("SearchBar integration", () => {
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: originalGeolocation,
    });
  });

  beforeEach(() => {
    fetchMock.mockReset();
    getSearchOptionsMock.mockClear();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        metrics: {
          human: {
            sun_time_saved_min: 12,
            extra_effort_min: 3,
          },
          shortest: {
            length: 1200,
            tree_shade: 300,
            building_shade: 100,
            fuentes: 1,
            refugios: 1,
          },
          comfort: {
            length: 1400,
            tree_shade: 500,
            building_shade: 200,
            fuentes: 2,
            refugios: 2,
          },
        },
        comfort_coords: [],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  it("requires selected suggestions for manual origin and destination and posts resolved payloads", async () => {
    render(<RoutingSection />);

    const originInput = await screen.findByRole("combobox", { name: "Origen" });
    const destinationInput = screen.getByRole("combobox", { name: "Destino" });
    const submitButton = screen.getByRole("button", { name: /buscar ruta con sombra/i });

    expect(submitButton).toBeDisabled();

    fireEvent.change(originInput, { target: { value: "plaza" } });
    fireEvent.change(destinationInput, { target: { value: "prado" } });

    await waitFor(() => {
      expect(getSearchOptionsMock).toHaveBeenCalledWith("plaza");
      expect(getSearchOptionsMock).toHaveBeenCalledWith("prado");
    });

    expect(screen.getByRole("button", { name: /plaza mayor, madrid/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /museo del prado, madrid/i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /plaza mayor, madrid/i }));
    fireEvent.click(screen.getByRole("button", { name: /museo del prado, madrid/i }));

    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/route");
    expect(request.method).toBe("POST");
    expect(request.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(request.body))).toMatchObject({
      origin: {
        label: "Plaza Mayor, Madrid",
        kind: "place",
        lat: 40.4155,
        lon: -3.7074,
      },
      destination: {
        label: "Museo del Prado, Madrid",
        kind: "place",
        lat: 40.4138,
        lon: -3.6921,
      },
      hour: expect.any(Number),
      preference: 0.5,
    });
  });

  it("preserves geolocation mode after a successful search with a resolved current location", async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 40.4168,
          longitude: -3.7038,
        },
      } as GeolocationPosition);
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });

    render(<RoutingSection />);

    fireEvent.click(screen.getByRole("button", { name: /mi ubicación/i }));

    expect(await screen.findByRole("button", { name: /tu ubicación actual/i })).toBeInTheDocument();

    const destinationInput = screen.getByRole("combobox", { name: "Destino" });
    fireEvent.change(destinationInput, { target: { value: "prado" } });

    await waitFor(() => {
      expect(getSearchOptionsMock).toHaveBeenCalledWith("prado");
    });

    fireEvent.click(screen.getByRole("button", { name: /museo del prado, madrid/i }));

    const submitButton = screen.getByRole("button", { name: /buscar ruta con sombra/i });
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    expect(screen.getByRole("button", { name: /^escribir$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tu ubicación actual/i })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Origen" })).not.toBeInTheDocument();
  });

  it("recalculates during simulated playback only when the hour advances", async () => {
    render(<RoutingSection />);

    const originInput = await screen.findByRole("combobox", { name: "Origen" });
    const destinationInput = screen.getByRole("combobox", { name: "Destino" });

    fireEvent.change(originInput, { target: { value: "plaza" } });
    fireEvent.change(destinationInput, { target: { value: "prado" } });

    await waitFor(() => {
      expect(getSearchOptionsMock).toHaveBeenCalledWith("plaza");
      expect(getSearchOptionsMock).toHaveBeenCalledWith("prado");
    });

    fireEvent.click(screen.getByRole("button", { name: /plaza mayor, madrid/i }));
    fireEvent.click(screen.getByRole("button", { name: /museo del prado, madrid/i }));

    const submitButton = screen.getByRole("button", { name: /buscar ruta con sombra/i });
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    vi.useFakeTimers();

    fireEvent.click(screen.getByRole("button", { name: /simular d[ií]a/i }));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows a clear error when the catalog cannot be loaded", async () => {
    const error = new Error("No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.");
    error.name = "SearchSourceError";

    getSearchOptionsMock.mockRejectedValueOnce(error);

    render(<RoutingSection />);

    const destinationInput = screen.getByRole("combobox", { name: "Destino" });
    fireEvent.change(destinationInput, { target: { value: "prado" } });

    expect(
      await screen.findByText("No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /museo del prado, madrid/i })).not.toBeInTheDocument();
  });

  it("debounces destination lookups while the user types", async () => {
    vi.useFakeTimers();

    render(<RoutingSection />);

    const destinationInput = screen.getByRole("combobox", { name: "Destino" });

    fireEvent.change(destinationInput, { target: { value: "p" } });
    fireEvent.change(destinationInput, { target: { value: "pr" } });
    fireEvent.change(destinationInput, { target: { value: "pra" } });

    expect(getSearchOptionsMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(getSearchOptionsMock).toHaveBeenCalledTimes(1);
    expect(getSearchOptionsMock).toHaveBeenCalledWith("pra");
  });

  it("shows a single compact helper line instead of duplicated origin guidance", async () => {
    render(<RoutingSection />);

    expect(await screen.findByText("Madrid solo: dos puntos reales, una hora concreta y el equilibrio que prefieras.")).toBeInTheDocument();
    expect(screen.getAllByText("Sin búsqueda libre fuera de Madrid")).toHaveLength(1);
  });

  it("keeps the time and route type controls visible in the compact planner", async () => {
    render(<RoutingSection />);

    expect(await screen.findByText("Hora salida")).toBeInTheDocument();
    expect(screen.getByText("Tipo de ruta")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /hora del recorrido/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /preferencia de ruta/i })).toBeInTheDocument();
    expect(screen.queryByText(/Ajusta la hora y el equilibrio/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /10:00/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /directa/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscar ruta con sombra/i })).toBeInTheDocument();
  });

  it("removes the pseudo-continuous solar track and keeps discrete time choices", async () => {
    render(<RoutingSection />);

    expect(await screen.findByRole("button", { name: /10:00/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /14:00/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /18:00/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/solar track/i)).not.toBeInTheDocument();
  });

  it("presents the planner as a single unified search surface", async () => {
    render(<RoutingSection />);

    expect(await screen.findByText("Planifica tu recorrido")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Origen" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Destino" })).toBeInTheDocument();
    expect(screen.getByText("Hora salida")).toBeInTheDocument();
    expect(screen.getByText("Tipo de ruta")).toBeInTheDocument();
  });

  it("can auto-load a demo route that showcases the product on first render", async () => {
    render(<RoutingSection autoDemo />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByText(/ejemplo cargado/i)).toBeInTheDocument();

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/route");
    expect(JSON.parse(String(request.body))).toMatchObject({
      origin: {
        label: "Plaza Mayor, Madrid",
        lat: 40.4155,
        lon: -3.7074,
      },
      destination: {
        label: "Museo del Prado, Madrid",
        lat: 40.4138,
        lon: -3.6921,
      },
      hour: 14,
      preference: 1,
    });
  });

  it("shows the heat warning inside the searched planner block", async () => {
    render(<RoutingSection autoDemo />);

    expect(await screen.findByText(/calor extremo a las 14:00/i)).toBeInTheDocument();
    expect(screen.getByText(/La Ruta Refugio es prioritaria/i)).toBeInTheDocument();
  });

  it("exposes a heatmap toggle and route resource summary after calculating a route", async () => {
    render(<RoutingSection autoDemo />);

    expect(await screen.findByText(/recursos en ruta/i)).toBeInTheDocument();
    expect(screen.getAllByText(/fuentes de agua/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/refugios climáticos/i).length).toBeGreaterThan(0);

    const heatmapToggle = screen.getByRole("button", { name: /ver mapa de calor/i });
    expect(heatmapToggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(heatmapToggle);

    expect(heatmapToggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/capa térmica superpuesta/i)).toBeInTheDocument();
  });

  it("renders a visual shade progress and a branded route legend after calculating a route", async () => {
    render(<RoutingSection autoDemo />);

    expect(await screen.findByTestId("shade-progress")).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByTestId("route-legend-tree")).toBeInTheDocument();
    expect(screen.getByText(/ruta con alivio clim[aá]tico/i, { selector: "div" })).toBeInTheDocument();
  });
});
