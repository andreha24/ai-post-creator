"use client";

import "@/i18n/i18n";
import { supportedLanguages } from "@/i18n/i18n";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language).split("-")[0];

  return (
    <select
      className="bg-gray-200 rounded-[8px] px-3 py-2"
      value={current}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label="Language"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

