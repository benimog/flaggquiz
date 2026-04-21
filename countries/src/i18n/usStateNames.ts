// Swedish state names are the canonical keys used by us-states.json (e.g. "Kalifornien").
// English labels below are used only for display when the language is English.
const swedishToEnglish: Record<string, string> = {
  Kalifornien: "California",
};

export function getUsStateName(swedishName: string, language: string): string {
  if (language.startsWith("en")) {
    return swedishToEnglish[swedishName] ?? swedishName;
  }
  return swedishName;
}
