import Image from "next/image";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t app-border flex justify-center mt-10">
      <div className="h-20 max-w-[1400px] px-30 mx-auto w-full flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Image src="/logo_new.png" width={140} height={40} alt="Logo" />
          <span>{t("appName")}</span>
        </div>

        <span>{t("footer.copyright")}</span>
      </div>
    </footer>
  );
};
