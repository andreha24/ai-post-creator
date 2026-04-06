// i18n module uses "use client" - mock the i18next module before importing
jest.mock("i18next", () => {
  const changeLanguageMock = jest.fn().mockResolvedValue(undefined);
  return {
    __esModule: true,
    default: {
      isInitialized: false,
      language: "en",
      resolvedLanguage: "en",
      use: jest.fn().mockReturnThis(),
      init: jest.fn().mockReturnThis(),
      changeLanguage: changeLanguageMock,
    },
  };
});

jest.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: jest.fn() },
}));

import i18next from "i18next";
import {
  defaultLanguage,
  supportedLanguages,
  syncI18nLanguageFromStorage,
} from "../../i18n/i18n";

describe("i18n configuration", () => {
  describe("defaultLanguage", () => {
    it('is "en"', () => {
      expect(defaultLanguage).toBe("en");
    });
  });

  describe("supportedLanguages", () => {
    it('contains "en"', () => {
      expect(supportedLanguages).toContain("en");
    });

    it('contains "ua" (not "uk")', () => {
      expect(supportedLanguages).toContain("ua");
    });

    it('does not contain legacy "uk" language code', () => {
      expect(supportedLanguages).not.toContain("uk");
    });

    it("has exactly two supported languages", () => {
      expect(supportedLanguages).toHaveLength(2);
    });

    it("is ordered as [en, ua]", () => {
      expect(supportedLanguages).toEqual(["en", "ua"]);
    });
  });
});

describe("syncI18nLanguageFromStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (i18next as any).language = "en";
    localStorage.clear();
  });

  it("calls changeLanguage with stored lang when it differs from current", () => {
    localStorage.setItem("lang", "ua");
    (i18next as any).language = "en";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).toHaveBeenCalledWith("ua");
  });

  it("does not call changeLanguage when stored lang matches current", () => {
    localStorage.setItem("lang", "en");
    (i18next as any).language = "en";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).not.toHaveBeenCalled();
  });

  it("falls back to defaultLanguage when localStorage has no lang", () => {
    localStorage.removeItem("lang");
    (i18next as any).language = "ua";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).toHaveBeenCalledWith("en");
  });

  it('normalizes unknown lang (e.g. "fr") to defaultLanguage "en"', () => {
    localStorage.setItem("lang", "fr");
    (i18next as any).language = "ua";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).toHaveBeenCalledWith("en");
  });

  it('regression: "uk" is no longer supported and normalizes to "en"', () => {
    // Previously "uk" was a valid language, now it should fall back to "en"
    localStorage.setItem("lang", "uk");
    (i18next as any).language = "ua";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).toHaveBeenCalledWith("en");
  });

  it("handles null localStorage value gracefully (normalizes to en)", () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    (i18next as any).language = "ua";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).toHaveBeenCalledWith("en");
    jest.restoreAllMocks();
  });

  it("calls changeLanguage with ua when ua is stored", () => {
    localStorage.setItem("lang", "ua");
    (i18next as any).language = "en";
    syncI18nLanguageFromStorage();
    expect(i18next.changeLanguage).toHaveBeenCalledWith("ua");
    expect(i18next.changeLanguage).not.toHaveBeenCalledWith("uk");
  });
});