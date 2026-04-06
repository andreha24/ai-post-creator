"use client";

import { logoutUser } from "@/api/auth/auth";
import useUserStore from "@/store/useUserStore";
import { Button } from "@/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = () => {
  const router = useRouter();
  const user = useUserStore.use.user();
  const setUser = useUserStore.use.setUser();
  const avatarLetter = user?.email?.charAt(0)?.toUpperCase();
  const { t } = useTranslation();

  const logout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="fixed z-100 top-0 h-20 w-full border-b app-border flex justify-center backdrop-blur-sm br-[rgba(255, 255, 255, 0.7)]">
      <div className="max-w-[1400px] px-30 mx-auto w-full flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link href="/">
            <Image src="/logo_new.png" width={140} height={40} alt="Logo" />
          </Link>
          <span>{t("appName")}</span>
        </div>

        <div className="flex gap-4 items-center">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link
                className="app-surface-2 border app-border flex gap-3 items-center rounded-[8px] px-4 py-1"
                href="/profile?tab=settings"
              >
                <div className="rounded-full bg-blue-400 w-10 h-10 flex justify-center items-center">
                  {avatarLetter}
                </div>
                <div>{user.email}</div>
              </Link>

              <Button
                type="button"
                className="px-4 py-2 max-h-10"
                label={t("common.logout")}
                onClick={logout}
                icon={<LogoutIcon />}
              />
            </>
          ) : (
            <>
              <Link href="/login">{t("common.signIn")}</Link>
              <Link href="/sign-up">{t("common.signUp")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
