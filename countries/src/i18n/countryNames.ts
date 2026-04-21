import { Country } from "../types/Country";

export function getCountryName(country: Country, language: string): string {
  return language.startsWith("en")
    ? country.name.common
    : country.translations.swe.common;
}
