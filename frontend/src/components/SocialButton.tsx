"use client";

import { Button } from "@/ui/Button";

interface SocialButtonProps {
  label: string;
  redirectLink: string;
  icon: any;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  label,
  redirectLink,
  icon,
}) => (
  <Button
    type="button"
    label={label}
    icon={icon}
    className="text-black bg-white"
    onClick={() => (window.location.href = redirectLink)}
  />
);
