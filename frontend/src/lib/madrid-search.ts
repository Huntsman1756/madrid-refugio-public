export type SearchKind = "address" | "place" | "area";

export interface SearchOption {
  id: string;
  label: string;
  kind: SearchKind;
  lat: number;
  lon: number;
  street?: string;
  number?: string;
  district?: string;
}

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function filterSearchOptions(
  options: SearchOption[],
  query: string,
  limit = 8,
): SearchOption[] {
  if (limit <= 0) {
    return [];
  }

  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return options
    .map((option) => {
      const haystack = normalizeSearchText(option.label);
      const startsWith = haystack.startsWith(normalizedQuery);
      const includes = haystack.includes(normalizedQuery);

      if (!startsWith && !includes) {
        return null;
      }

      return {
        option,
        score: startsWith ? 0 : 1,
      };
    })
    .filter((entry): entry is { option: SearchOption; score: number } => entry !== null)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.option.label.localeCompare(right.option.label, "es");
    })
    .slice(0, limit)
    .map((entry) => entry.option);
}
