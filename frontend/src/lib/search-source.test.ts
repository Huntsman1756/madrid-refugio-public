import { afterEach, describe, expect, it, vi } from "vitest";

import type { SearchOption } from "./madrid-search";
import {
  getApiBaseUrl,
  getSuggestApiUrl,
  getSearchOptions,
  resetSearchSourceCacheForTests,
  SearchSourceError,
} from "./search-source";

const STATIC_INDEX_FIXTURE = [
  {
    label: "Gomez Ulla",
    search_text: "gomez ulla",
    lat: 40.4211,
    lon: -3.6738,
    kind: "demo_destination",
    source: "curated",
    district: "Salamanca",
  },
  {
    label: "Nuevos Ministerios",
    search_text: "nuevos ministerios",
    lat: 40.446,
    lon: -3.6933,
    kind: "demo_destination",
    source: "curated",
    district: "Chamartin",
  },
  {
    label: "Plaza de Castilla",
    search_text: "plaza de castilla",
    lat: 40.466,
    lon: -3.6904,
    kind: "demo_origin",
    source: "curated",
    district: "Tetuan",
  },
] as const;

describe("getSearchOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetSearchSourceCacheForTests();
    vi.restoreAllMocks();
  });

  it("uses relative api routes by default", () => {
    vi.unstubAllEnvs();

    expect(getApiBaseUrl()).toBe("");
    expect(getSuggestApiUrl()).toBe("/api/suggest");
  });

  it("uses NEXT_PUBLIC_API_URL when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://web-production-1f04a.up.railway.app/");

    expect(getApiBaseUrl()).toBe("https://web-production-1f04a.up.railway.app");
    expect(getSuggestApiUrl()).toBe("https://web-production-1f04a.up.railway.app/api/suggest");
  });

  it("loads the static index once and filters queries locally", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => STATIC_INDEX_FIXTURE,
    });

    vi.stubGlobal("fetch", fetchMock);

    const firstResult = await getSearchOptions("gomez");
    const secondResult = await getSearchOptions("plaza", 1);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/data/madrid_search_index.json");
    expect(firstResult).toEqual<SearchOption[]>([
      {
        id: "gomez-ulla-40.4211--3.6738-demo_destination",
        label: "Gomez Ulla",
        kind: "place",
        lat: 40.4211,
        lon: -3.6738,
        district: "Salamanca",
      },
    ]);
    expect(secondResult).toEqual<SearchOption[]>([
      {
        id: "plaza-de-castilla-40.466--3.6904-demo_origin",
        label: "Plaza de Castilla",
        kind: "place",
        lat: 40.466,
        lon: -3.6904,
        district: "Tetuan",
      },
    ]);
  });

  it("retries loading after an initial static index fetch failure", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue({
        ok: true,
        json: async () => [
          {
            label: "Gomez Ulla",
            lat: 40.4211,
            lon: -3.6738,
            kind: "demo_destination",
            district: "Salamanca",
          },
        ],
      });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getSearchOptions("gomez")).rejects.toMatchObject<Partial<SearchSourceError>>({
      name: "SearchSourceError",
      message: "No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.",
      cause: new Error("network down"),
    });

    await expect(getSearchOptions("gomez")).resolves.toEqual<SearchOption[]>([
      {
        id: "gomez-ulla-40.4211--3.6738-demo_destination",
        label: "Gomez Ulla",
        kind: "place",
        lat: 40.4211,
        lon: -3.6738,
        district: "Salamanca",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws a user-visible catalog load error when the static index request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getSearchOptions("gomez")).rejects.toMatchObject<Partial<SearchSourceError>>({
      name: "SearchSourceError",
      message: "No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.",
      cause: new Error("Failed to load search index: 503"),
    });
  });

  it("returns an empty list without loading the index for blank queries", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    await expect(getSearchOptions("   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
