import { filterSearchOptions, type SearchKind, type SearchOption } from "./madrid-search";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    return "";
  }

  return trimTrailingSlash(baseUrl);
}

export function getSuggestApiUrl(): string {
  return `${getApiBaseUrl()}/api/suggest`;
}

const STATIC_INDEX_URL = "/data/madrid_search_index.json";

const SEARCH_SOURCE_ERROR_MESSAGE = "No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.";

interface StaticSearchEntry {
  label: string;
  lat: number;
  lon: number;
  kind: string;
  district?: string;
}

let staticSearchOptionsPromise: Promise<SearchOption[]> | null = null;

export class SearchSourceError extends Error {
  override cause: unknown;

  constructor(message = SEARCH_SOURCE_ERROR_MESSAGE, cause?: unknown) {
    super(message);
    this.name = "SearchSourceError";
    this.cause = cause;
  }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function toSearchKind(kind: string): SearchKind {
  switch (kind) {
    case "address":
      return "address";
    case "area":
      return "area";
    default:
      return "place";
  }
}

function toSearchOption(entry: StaticSearchEntry): SearchOption {
  return {
    id: `${slugify(entry.label)}-${entry.lat}-${entry.lon}-${entry.kind}`,
    label: entry.label,
    kind: toSearchKind(entry.kind),
    lat: entry.lat,
    lon: entry.lon,
    district: entry.district,
  };
}

async function loadSearchOptions(): Promise<SearchOption[]> {
  const response = await fetch(STATIC_INDEX_URL);
  if (!response.ok) {
    throw new Error(`Failed to load search index: ${response.status}`);
  }

  const payload = (await response.json()) as StaticSearchEntry[];
  return payload.map(toSearchOption);
}

async function getCachedSearchOptions(): Promise<SearchOption[]> {
  if (!staticSearchOptionsPromise) {
    staticSearchOptionsPromise = loadSearchOptions().catch((error: unknown) => {
      staticSearchOptionsPromise = null;
      throw error;
    });
  }

  return staticSearchOptionsPromise;
}

function toSearchSourceError(error: unknown): SearchSourceError {
  if (error instanceof SearchSourceError) {
    return error;
  }

  return new SearchSourceError(SEARCH_SOURCE_ERROR_MESSAGE, error);
}

export async function getAllSearchOptions(): Promise<SearchOption[]> {
  try {
    return await getCachedSearchOptions();
  } catch (error: unknown) {
    throw toSearchSourceError(error);
  }
}

export async function getSearchOptions(
  query: string,
  limit = 8,
): Promise<SearchOption[]> {
  if (!query.trim() || limit <= 0) {
    return [];
  }

  try {
    const options = await getCachedSearchOptions();
    return filterSearchOptions(options, query, limit);
  } catch (error: unknown) {
    throw toSearchSourceError(error);
  }
}

export function resetSearchSourceCacheForTests(): void {
  staticSearchOptionsPromise = null;
}
