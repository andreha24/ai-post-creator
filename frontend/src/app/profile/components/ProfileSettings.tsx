"use client";

import { SettingBlockWrapper } from "./SettingBlock";
import useUserStore from "@/store/useUserStore";

import ShieldIcon from "@mui/icons-material/Shield";
import PaletteIcon from "@mui/icons-material/Palette";
import MailIcon from "@mui/icons-material/Mail";
import LockIcon from "@mui/icons-material/Lock";
import BadgeIcon from "@mui/icons-material/Badge";
import Switch from "@mui/material/Switch";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStoredTheme, setTheme, ThemeMode } from "@/utils/theme";

export const ProfileSettings = () => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<string>("en");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const user = useUserStore.use.user();

  useEffect(() => {
    // Avoid hydration mismatches by reading client-only state after mount.
    const storedLang = localStorage.getItem("lang");
    if (storedLang) setLang(storedLang);

    setThemeState(getStoredTheme());
  }, []);

  useEffect(() => {
    const current = (i18n.resolvedLanguage || i18n.language).split("-")[0];
    if (current !== lang) setLang(current);
  }, [i18n.resolvedLanguage, i18n.language]);

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const handleChangeLang = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex gap-6 flex-col mt-10">
      <SettingBlockWrapper
        icon={<ShieldIcon color="info" fontSize="small" />}
        title={t("profileSettings.accountTitle")}
      >
        <div className="flex flex-col gap-1">
          <span>{t("profileSettings.email")}</span>
          <div className="flex gap-3 items-center">
            <MailIcon color="disabled" fontSize="small" />
            <span className="text-gray-400 text-xs!">{user?.email}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span>{t("profileSettings.username")}</span>
          <div className="flex gap-3 items-center">
            <BadgeIcon color="disabled" fontSize="small" />
            <span className="text-gray-400 text-xs!">{user?.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span>{t("profileSettings.password")}</span>
          <div className="flex gap-3 items-center">
            <LockIcon color="disabled" fontSize="small" />
            <input
              type="password"
              className="text-gray-400 text-xs!"
              value={"some password"}
              disabled
            />
          </div>
        </div>
      </SettingBlockWrapper>

      <SettingBlockWrapper
        icon={<PaletteIcon color="info" />}
        title={t("profileSettings.preferencesTitle")}
      >
        <div className="flex justify-between border-b border-gray-600 pb-4">
          <div className="flex flex-col gap-1">
            <span>{t("profileSettings.darkMode")}</span>
            <span className="text-gray-400 text-xs!">
              {t("profileSettings.darkModeHint")}
            </span>
          </div>

          <Switch
            checked={theme === "dark"}
            onChange={(e) => setThemeState(e.target.checked ? "dark" : "light")}
          />
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <span>{t("profileSettings.language")}</span>
            <span className="text-gray-400 text-xs!">
              {t("profileSettings.languageHint")}
            </span>
          </div>

          <Select value={lang} onChange={handleChangeLang}>
            <MenuItem value="en">{t("profileSettings.languageEnglish")}</MenuItem>
            <MenuItem value="uk">{t("profileSettings.languageUkrainian")}</MenuItem>
          </Select>
        </div>
      </SettingBlockWrapper>
    </div>
  );
};
