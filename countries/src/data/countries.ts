import { Country } from "../types/Country";
import rawCountries from "./countries.json";

interface RawCountry {
  code: string;
  name: string;
  nameSwe: string;
  independent: boolean;
  region: string;
  subregion: string;
  flagAlt: string;
}

export interface CountryWithRegion extends Country {
  independent: boolean;
  subregion: string;
  region: string;
}

function toCountry(raw: RawCountry): Country {
  return {
    flags: {
      png: `/flags/${raw.code}.png`,
      svg: "",
      alt: raw.flagAlt,
    },
    name: {
      common: raw.name,
      official: "",
    },
    translations: {
      swe: {
        common: raw.nameSwe,
        official: "",
      },
    },
  };
}

function toCountryWithRegion(raw: RawCountry): CountryWithRegion {
  return {
    ...toCountry(raw),
    independent: raw.independent,
    subregion: raw.subregion,
    region: raw.region,
  };
}

const allCountries: Country[] = (rawCountries as RawCountry[]).map(toCountry);

const independentCountries: Country[] = (rawCountries as RawCountry[])
  .filter((c) => c.independent)
  .map(toCountry);

export function getAllCountries(): Country[] {
  return allCountries;
}

export function getIndependentCountries(): Country[] {
  return independentCountries;
}

export function getCountriesByRegion(region: string): CountryWithRegion[] {
  return (rawCountries as RawCountry[])
    .filter((c) => c.region.toLowerCase() === region.toLowerCase())
    .map(toCountryWithRegion);
}
