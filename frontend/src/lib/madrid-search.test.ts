import { describe, expect, it } from "vitest";

import { filterSearchOptions, type SearchOption } from "./madrid-search";

const OPTIONS: SearchOption[] = [
  {
    id: "addr-1",
    label: "Calle de Atocha 27, Madrid",
    kind: "address",
    lat: 40.4132,
    lon: -3.7001,
  },
  {
    id: "place-1",
    label: "Ciudad Universitaria, Madrid",
    kind: "place",
    lat: 40.4436,
    lon: -3.7263,
  },
  {
    id: "area-1",
    label: "Ciudad de los Angeles, Madrid",
    kind: "area",
    lat: 40.3634,
    lon: -3.689,
  },
  {
    id: "place-2",
    label: "Plaza de Cibeles, Madrid",
    kind: "place",
    lat: 40.4193,
    lon: -3.6931,
  },
];

describe("filterSearchOptions", () => {
  it("prioritizes prefix matches across address, place and area", () => {
    const result = filterSearchOptions(OPTIONS, "ci");

    expect(result.map((item) => item.id)).toEqual(["area-1", "place-1", "place-2"]);
  });

  it("returns an empty list for non-positive limits", () => {
    expect(filterSearchOptions(OPTIONS, "ci", -1)).toEqual([]);
  });

  it("returns an empty list for blank queries", () => {
    expect(filterSearchOptions(OPTIONS, "   ")).toEqual([]);
  });

  it("keeps exact substring matches after prefix matches", () => {
    const result = filterSearchOptions(OPTIONS, "atocha");

    expect(result[0]?.id).toBe("addr-1");
  });

  it("matches labels after accent and whitespace normalization", () => {
    const result = filterSearchOptions(
      [
        {
          id: "addr-2",
          label: "  Calle de Alcalá  45, Madrid ",
          kind: "address",
          lat: 40.42,
          lon: -3.69,
        },
      ],
      " alcala   45 ",
    );

    expect(result.map((item) => item.id)).toEqual(["addr-2"]);
  });
});
