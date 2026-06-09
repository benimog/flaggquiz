import fs from "fs";
import path from "path";
import {
  countryToRegion,
  countryNamesSwedish,
  countryNamesEnglish,
  getCountryDisplayName,
} from "./countryRegions";

// Country names excluded from the world map quiz (see WorldMap.tsx)
const EXCLUDED = new Set(["Antarctica", "Fr. S. Antarctic Lands"]);

const topo = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../public/world-countries.json"),
    "utf8"
  )
);
const geometryNames: string[] = topo.objects.countries.geometries
  .map((g: { properties: { name: string } }) => g.properties.name)
  .filter((name: string) => !EXCLUDED.has(name));

test("every quizzed map geometry has a region mapping", () => {
  const missing = geometryNames.filter((name) => !countryToRegion[name]);
  expect(missing).toEqual([]);
});

test("every quizzed map geometry has a Swedish display name", () => {
  const missing = geometryNames.filter((name) => !countryNamesSwedish[name]);
  expect(missing).toEqual([]);
});

test("English alias keys all exist in the TopoJSON", () => {
  const geoSet = new Set(geometryNames);
  const stale = Object.keys(countryNamesEnglish).filter(
    (key) => !geoSet.has(key)
  );
  expect(stale).toEqual([]);
});

test("display names use current country naming in both languages", () => {
  expect(getCountryDisplayName("Belarus", "sv")).toBe("Belarus");
  expect(getCountryDisplayName("Australia", "sv")).toBe("Australien");
  expect(getCountryDisplayName("Macedonia", "sv")).toBe("Nordmakedonien");
  expect(getCountryDisplayName("Macedonia", "en")).toBe("North Macedonia");
  expect(getCountryDisplayName("Czechia", "en")).toBe("Czechia");
});
