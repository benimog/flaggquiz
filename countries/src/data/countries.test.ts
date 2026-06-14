import rawCountries from "./countries.json";
import {
  getAllCountries,
  getCountriesWithPopulation,
  getIndependentCountries,
  getIndependentCountriesByContinent,
} from "./countries";

interface RawCountry {
  code: string;
  name: string;
  nameSwe: string;
  independent: boolean;
  region: string;
  subregion: string;
  capital?: string;
  capitalSwe?: string;
  population?: number;
  flagAlt: string;
}

const data = rawCountries as RawCountry[];

test("contains 250 countries with no duplicate codes or names", () => {
  expect(data).toHaveLength(250);
  expect(new Set(data.map((c) => c.code)).size).toBe(data.length);
  expect(new Set(data.map((c) => c.name)).size).toBe(data.length);
  expect(new Set(data.map((c) => c.nameSwe)).size).toBe(data.length);
});

test("every entry has all required fields", () => {
  for (const c of data) {
    expect(c.code).toBeTruthy();
    expect(c.name).toBeTruthy();
    expect(c.nameSwe).toBeTruthy();
    expect(c.region).toBeTruthy();
    expect(typeof c.independent).toBe("boolean");
    expect(c.flagAlt).toBeTruthy();
  }
});

test("independent countries are the 193 UN members plus Vatican and Kosovo", () => {
  expect(getIndependentCountries()).toHaveLength(195);
});

test("getAllCountries returns every entry with a local flag path", () => {
  const all = getAllCountries();
  expect(all).toHaveLength(data.length);
  for (const c of all) {
    expect(c.flags.png).toMatch(/^\/flags\/[a-z]{2,3}\.png$/);
  }
});

test("every independent country has a positive population", () => {
  for (const c of getIndependentCountries()) {
    expect(typeof c.population).toBe("number");
    expect(c.population).toBeGreaterThan(0);
  }
});

test("getCountriesWithPopulation returns the 195 independent countries, sorted descending", () => {
  const withPop = getCountriesWithPopulation();
  expect(withPop).toHaveLength(195);
  for (let i = 1; i < withPop.length; i++) {
    expect(withPop[i - 1].population!).toBeGreaterThanOrEqual(
      withPop[i].population!
    );
  }
});

test("every independent country has English and Swedish capital names", () => {
  for (const c of getIndependentCountries()) {
    expect(c.capital?.common).toBeTruthy();
    expect(c.capital?.swe).toBeTruthy();
  }
});

test("uses Swedish exonyms for capitals", () => {
  const byCode = new Map(data.map((c) => [c.code, c]));
  expect(byCode.get("se")?.capitalSwe).toBe("Stockholm");
  expect(byCode.get("dk")?.capital).toBe("Copenhagen");
  expect(byCode.get("dk")?.capitalSwe).toBe("Köpenhamn");
  expect(byCode.get("cn")?.capitalSwe).toBe("Peking");
  expect(byCode.get("fi")?.capitalSwe).toBe("Helsingfors");
});

test("uses current Swedish country names", () => {
  const byCode = new Map(data.map((c) => [c.code, c.nameSwe]));
  expect(byCode.get("sz")).toBe("Eswatini");
  expect(byCode.get("by")).toBe("Belarus");
  expect(byCode.get("tk")).toBe("Tokelau");
  expect(byCode.get("mk")).toBe("Nordmakedonien");
});

describe("getIndependentCountriesByContinent", () => {
  test("north-america includes USA, Canada and Mexico", () => {
    const names = getIndependentCountriesByContinent("north-america").map(
      (c) => c.name.common
    );
    expect(names).toContain("United States");
    expect(names).toContain("Canada");
    expect(names).toContain("Mexico");
    expect(names).toHaveLength(23);
  });

  test("south-america has the 12 independent countries", () => {
    const names = getIndependentCountriesByContinent("south-america").map(
      (c) => c.name.common
    );
    expect(names).toContain("Brazil");
    expect(names).not.toContain("Mexico");
    expect(names).toHaveLength(12);
  });

  test("every continent quiz has enough countries for 4 choices", () => {
    for (const continent of [
      "europe",
      "africa",
      "north-america",
      "south-america",
      "asia",
      "oceania",
    ]) {
      expect(
        getIndependentCountriesByContinent(continent).length
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
