"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { ProfileSettings } from "./components/ProfileSettings";
import { PostsHistory } from "./components/PostsHistory";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import { useTranslation } from "react-i18next";

const TABS = [
  {
    value: "settings",
    icon: <SettingsIcon />,
  },
  {
    value: "history",
    icon: <HistoryIcon />,
  },
];

const TAB_VALUES = TABS.map((tab) => tab.value);

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const initialTab = TAB_VALUES.includes(tabFromUrl ?? "") ? tabFromUrl! : TAB_VALUES[0];

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (TAB_VALUES.includes(tabFromUrl ?? "")) {
      setActiveTab(tabFromUrl!);
    } else {
      setActiveTab(TAB_VALUES[0]);
    }
  }, [searchParams]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newValue);
    router.push(`?${params.toString()}`);
  };

  const displayActiveTab = () =>
    activeTab === "settings" ? <ProfileSettings /> : <PostsHistory />;

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          "& .MuiTabs-flexContainer": {
            width: "fit-content",
          },

          "& .MuiTab-root": {
            flexDirection: "row",
            gap: 1,
          },

          "& .MuiTabs-scroller": {
            display: "flex",
            justifyContent: "center",
          },

          "& .MuiSvgIcon-root": {
            margin: 0,
          },

          "& .Mui-selected": {},
        }}
      >
        {TABS.map(({ value, icon }) => (
          <Tab
            key={value}
            label={(value === "settings" ? t("profile.settings") : t("profile.history")).toUpperCase()}
            value={value}
            icon={icon}
          />
        ))}
      </Tabs>

      {displayActiveTab()}
    </>
  );
}