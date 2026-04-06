"use client";

import { Button } from "@/ui/Button";
import GoogleIcon from "@mui/icons-material/Google";

export const GoogleButton = () => (
  <Button
    type="button"
    label="Continue With Google"
    icon={<GoogleIcon />}
    className="text-black bg-white"
    onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
  />
);
