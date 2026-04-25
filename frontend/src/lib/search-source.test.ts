import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getApiBaseUrl,
  getSuggestApiUrl,
  getSearchOptions,
  resetSearchSourceCacheForTests,
  SearchSourceError,
} from "./search-source";

const GOMEZ_SUGGEST_FIXTURE = [
  {
    label: "Gomez Ulla",
    lat: 40.4211,
    lon: -3.6738,
    kind: "place",
    district: "Salamanca",
  },
] as const;

const PLAZA_SUGGEST_FIXTURE = [
  {
    label: "Plaza de Castilla",
    lat: 40.466,
    lon: -3.6904,
    kind: "place",
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
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");

    expect(getApiBaseUrl()).toBe("https://api.example.com");
    expect(getSuggestApiUrl()).toBe("https://api.example.com/api/suggest");
  });

  it("loads suggestions from the backend api", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => GOMEZ_SUGGEST_FIXTURE,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => PLAZA_SUGGEST_FIXTURE,
      });

    vi.stubGlobal("fetch", fetchMock);

    const firstResult = await getSearchOptions("gomez");
    const secondResult = await getSearchOptions("plaza", 1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/suggest?q=gomez&limit=8");
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/suggest?q=plaza&limit=1");
    expect(firstResult).toEqual([
      {
        id: "gomez-ulla-40.4211--3.6738-place",
        label: "Gomez Ulla",
        kind: "place",
        lat: 40.4211,
        lon: -3.6738,
        district: "Salamanca",
      },
    ]);
    expect(secondResult).toEqual([
      {
        id: "plaza-de-castilla-40.466--3.6904-place",
        label: "Plaza de Castilla",
        kind: "place",
        lat: 40.466,
        lon: -3.6904,
        district: "Tetuan",
      },
    ]);
  });

  it("retries loading after an initial suggest request failure", async () => {
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
            kind: "place",
            district: "Salamanca",
          },
        ],
      });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getSearchOptions("gomez")).rejects.toMatchObject({
      name: "SearchSourceError",
      message: "No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.",
      cause: new Error("network down"),
    });

    await expect(getSearchOptions("gomez")).resolves.toEqual([
      {
        id: "gomez-ulla-40.4211--3.6738-place",
        label: "Gomez Ulla",
        kind: "place",
        lat: 40.4211,
        lon: -3.6738,
        district: "Salamanca",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws a user-visible catalog load error when the suggest request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getSearchOptions("gomez")).rejects.toMatchObject({
      name: "SearchSourceError",
      message: "No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.",
      cause: new Error("Failed to load suggestions: 503"),
    });
  });

  it("returns an empty list without calling the suggest api for blank queries", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    await expect(getSearchOptions("   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
