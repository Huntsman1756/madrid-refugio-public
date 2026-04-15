import { filterSearchOptions, type SearchKind, type SearchOption } from "./madrid-search";

const SUGGEST_API_URL = "/api/suggest";
const SEARCH_SOURCE_ERROR_MESSAGE = "No se pudo cargar el catalogo de lugares. Recarga la pagina e intentalo de nuevo.";

interface StaticSearchEntry {
  label: string;
  lat: number;
  lon: number;
  kind: string;
  district?: string;
}

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
  const response = await fetch(SUGGEST_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to load search index: ${response.status}`);
  }

  const payload = (await response.json()) as StaticSearchEntry[];
  return payload.map(toSearchOption);
}

function toSearchSourceError(error: unknown): SearchSourceError {
  if (error instanceof SearchSourceError) {
    return error;
  }

  return new SearchSourceError(SEARCH_SOURCE_ERROR_MESSAGE, error);
}

export async function getAllSearchOptions(): Promise<SearchOption[]> {
  try {
    return await loadSearchOptions();
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

  const searchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  try {
    const response = await fetch(`${SUGGEST_API_URL}?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to load search index: ${response.status}`);
    }

    const payload = (await response.json()) as StaticSearchEntry[];
    return filterSearchOptions(payload.map(toSearchOption), query, limit);
  } catch (error: unknown) {
    throw toSearchSourceError(error);
  }
}

export function resetSearchSourceCacheForTests(): void {
  return;
}
