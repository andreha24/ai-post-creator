"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, AppLanguage } from "./resources";

export const defaultLanguage: AppLanguage = "en";
export const supportedLanguages: AppLanguage[] = ["en", "uk"];

function normalizeLang(value: string | null | undefined): AppLanguage {
  if (!value) return defaultLanguage;
  const lang = value.toLowerCase();
  return (supportedLanguages.includes(lang as AppLanguage) ? lang : defaultLanguage) as AppLanguage;
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      supportedLngs: supportedLanguages,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export function syncI18nLanguageFromStorage() {
  if (typeof window === "undefined") return;
  const initial = normalizeLang(localStorage.getItem("lang"));
  if (i18n.language !== initial) {
    i18n.changeLanguage(initial);
  }
}

export default i18n;

