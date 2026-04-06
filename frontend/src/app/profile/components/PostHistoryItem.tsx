"use client";

import { cropString } from "@/utils/cropString";
import Link from "next/link";
import Image from "next/image";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";

interface PostHistoryItemProps {
  id?: string | number;
  title: string;
  desc: string;
  createdTime: string;
  platform: string;
  image: string;
}

export const PostHistoryItem: React.FC<PostHistoryItemProps> = ({
  id,
  title,
  desc,
  createdTime,
  platform,
  image
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col rounded-[8px] overflow-hidden! app-surface-2 border app-border min-w-[300px] w-[300px]">
      <div className="relative">
        <Image
          src={image}
          className="w-full relative object-cover max-h-48 h-48"
          width={300}
          height={400}
          alt="AI image"
        />
        <span className="absolute bottom-[8px] left-[8px] text-white">
          {title}
        </span>
        <span className="absolute top-[8px] right-[8px] rounded-[8px] px-2 app-muted app-surface-2 border app-border opacity-90">
          {platform}
        </span>
      </div>

      <div className="px-2 py-5">
        <p className="mb-5">{cropString(desc, 50)}</p>

        <div className="flex justify-between border-t app-border pt-2">
          <div className="app-muted text-xs! flex gap-2 items-center">
            <AccessTimeIcon color="disabled" fontSize="small" />
            {createdTime}
          </div>

          <Link
            href={id ? `/posts/${id}` : "/"}
            className="text-sm! px-2 py-1 border rounded-[8px] app-border flex gap-1 items-center"
          >
            <OpenInNewIcon fontSize="small" />
            {t("common.open", { defaultValue: "Open" })}
          </Link>
        </div>
      </div>
    </div>
  );
};
