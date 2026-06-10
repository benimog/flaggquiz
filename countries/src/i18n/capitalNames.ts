import { Country } from "../types/Country";

export function getCapitalName(country: Country, language: string): string {
  if (!country.capital) return "";
  return language.startsWith("en")
    ? country.capital.common
    : country.capital.swe;
}
