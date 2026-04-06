import { resources, AppLanguage } from "../../i18n/resources";

describe("i18n resources", () => {
  describe("resource keys", () => {
    it('has "en" key', () => {
      expect(resources).toHaveProperty("en");
    });

    it('has "ua" key (not "uk")', () => {
      expect(resources).toHaveProperty("ua");
    });

    it('does not have legacy "uk" key', () => {
      expect(resources).not.toHaveProperty("uk");
    });

    it("has exactly two language keys", () => {
      expect(Object.keys(resources)).toEqual(["en", "ua"]);
    });
  });

  describe("AppLanguage type (runtime keys)", () => {
    it('includes "en" as a valid language key', () => {
      const keys = Object.keys(resources) as AppLanguage[];
      expect(keys).toContain("en");
    });

    it('includes "ua" as a valid language key', () => {
      const keys = Object.keys(resources) as AppLanguage[];
      expect(keys).toContain("ua");
    });

    it('does not include "uk" as a valid language key', () => {
      const keys = Object.keys(resources);
      expect(keys).not.toContain("uk");
    });
  });

  describe("ua translations", () => {
    it("has translation namespace under ua", () => {
      expect(resources.ua).toHaveProperty("translation");
    });

    it("has appName in ua translations", () => {
      expect(resources.ua.translation.appName).toBe("AI Генератор Постів");
    });

    it("has profileSettings.languageUkrainian in ua translations", () => {
      expect(resources.ua.translation.profileSettings.languageUkrainian).toBe(
        "Українська"
      );
    });

    it("has profileSettings.languageEnglish in ua translations", () => {
      expect(resources.ua.translation.profileSettings.languageEnglish).toBe(
        "Англійська"
      );
    });

    it("has all required profileSettings keys in ua translations", () => {
      const uaSettings = resources.ua.translation.profileSettings;
      expect(uaSettings).toHaveProperty("accountTitle");
      expect(uaSettings).toHaveProperty("email");
      expect(uaSettings).toHaveProperty("username");
      expect(uaSettings).toHaveProperty("password");
      expect(uaSettings).toHaveProperty("preferencesTitle");
      expect(uaSettings).toHaveProperty("darkMode");
      expect(uaSettings).toHaveProperty("language");
      expect(uaSettings).toHaveProperty("languageEnglish");
      expect(uaSettings).toHaveProperty("languageUkrainian");
    });
  });

  describe("en translations", () => {
    it("has translation namespace under en", () => {
      expect(resources.en).toHaveProperty("translation");
    });

    it("has appName in en translations", () => {
      expect(resources.en.translation.appName).toBe("AI Post Generator");
    });

    it("has profileSettings.languageUkrainian in en translations", () => {
      expect(resources.en.translation.profileSettings.languageUkrainian).toBe(
        "Ukrainian"
      );
    });
  });

  describe("translation key parity between en and ua", () => {
    it("both languages have the same top-level translation keys", () => {
      const enKeys = Object.keys(resources.en.translation).sort();
      const uaKeys = Object.keys(resources.ua.translation).sort();
      expect(enKeys).toEqual(uaKeys);
    });

    it("both languages have the same profileSettings keys", () => {
      const enKeys = Object.keys(
        resources.en.translation.profileSettings
      ).sort();
      const uaKeys = Object.keys(
        resources.ua.translation.profileSettings
      ).sort();
      expect(enKeys).toEqual(uaKeys);
    });

    it("both languages have the same profile keys", () => {
      const enKeys = Object.keys(resources.en.translation.profile).sort();
      const uaKeys = Object.keys(resources.ua.translation.profile).sort();
      expect(enKeys).toEqual(uaKeys);
    });
  });
});