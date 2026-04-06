"use client";

import toast from "react-hot-toast";

interface NotifyProps {
  text: string;
  type: "success" | "warning" | "error";
}

export const notify = ({ text, type }: NotifyProps) => {
  const config = {
    duration: 4000,
    position: "top-center" as const,
  };

  switch (type) {
    case "success":
      return toast.success(text, config);
    case "error":
      return toast.error(text, config);
    case "warning":
      return toast(text, { ...config, icon: "⚠️" });
    default:
      return toast(text, config);
  }
};
