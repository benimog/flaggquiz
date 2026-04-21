// Swedish province names are the canonical keys (matching svenska-landskap.json).
// For English, most names are kept as-is (proper nouns); a few get idiomatic glosses.
const swedishToEnglish: Record<string, string> = {
  "Skåne": "Scania",
  "Lappland": "Lapland",
  "Västergötland": "Västergötland",
  "Östergötland": "Östergötland",
  "Södermanland": "Södermanland",
  "Västerbotten": "Västerbotten",
  "Västmanland": "Västmanland",
  "Ångermanland": "Ångermanland",
  "Öland": "Öland",
  "Gotland": "Gotland",
};

export function getLandskapName(swedishName: string, language: string): string {
  if (language.startsWith("en")) {
    return swedishToEnglish[swedishName] ?? swedishName;
  }
  return swedishName;
}
