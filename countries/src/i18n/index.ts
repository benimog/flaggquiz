import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import sv from "./locales/sv.json";
import en from "./locales/en.json";

export const supportedLanguages = ["sv", "en"] as const;
export type Language = (typeof supportedLanguages)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: sv },
      en: { translation: en },
    },
    fallbackLng: "sv",
    supportedLngs: supportedLanguages as unknown as string[],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "flaggquiz.lang",
    },
  });

export default i18n;
