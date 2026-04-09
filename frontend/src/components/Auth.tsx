"use client";

import { TextField } from "@/ui/TextField";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { Button } from "@/ui/Button";
import { SocialButton } from "./SocialButton";
import { usePathname, useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/api/auth/auth";
import useUserStore from "@/store/useUserStore";
import { notify } from "@/utils/alert";
import { useTranslation } from "react-i18next";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";

interface CreateUserSchema {
  email: string;
  name: string;
  password: string;
}

const SOCIAL_BUTTONS = [
  {
    label: "Google",
    redirectLink: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`,
    icon: <GoogleIcon />,
  },
  {
    label: "Twitter",
    redirectLink: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/twitter`,
    icon: <TwitterIcon />,
  },
];

export const Auth = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const setUser = useUserStore.use.setUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserSchema>();

  const onSubmit: SubmitHandler<CreateUserSchema> = async (data) => {
    try {
      const res = isLoginPage
        ? await loginUser(data)
        : await registerUser(data);
      setUser(res);
      reset();
      notify({
        text: isLoginPage ? t("auth.welcomeToast") : t("auth.registeredToast"),
        type: "success",
      });

      router.push("/");
    } catch (error: any) {
      console.log("error", error);
      notify({ text: error.response?.data.error, type: "error" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-10">
        <h2 className="!text-4xl">
          {isLoginPage ? t("auth.heroLoginTitle") : t("auth.heroRegisterTitle")}
        </h2>
        <p className="text-secondary">
          {isLoginPage
            ? t("auth.heroLoginSubtitle")
            : t("auth.heroRegisterSubtitle")}
        </p>
      </div>

      <div className="flex justify-between gap-10">
        <div className="flex flex-col">
          <Image
            src="/futuristic.jpg"
            width={500}
            height={500}
            alt="futuristic"
          />
          <div></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="min-w-[500px]">
          <div className="flex flex-col gap-2 !mb-4">
            <h1 className="!text-2xl">
              {isLoginPage ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h1>
            <p className="text-secondary">
              {isLoginPage
                ? t("auth.loginSubtitle")
                : t("auth.registerSubtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <TextField
              label={t("auth.emailLabel")}
              icon={<MailOutlineIcon />}
              placeholder="you@example.com"
              registerName="email"
              register={register}
            />

            {!isLoginPage && (
              <TextField
                label={t("auth.nameLabel")}
                icon={<PersonIcon />}
                placeholder={t("auth.namePlaceholder")}
                registerName="name"
                register={register}
              />
            )}

            <TextField
              label={t("auth.passwordLabel")}
              icon={<LockIcon />}
              placeholder={
                isLoginPage
                  ? t("auth.loginPasswordPlaceholder")
                  : t("auth.registerPasswordPlaceholder")
              }
              registerName="password"
              register={register}
            />

            {!isLoginPage && (
              <TextField
                label={t("auth.repeatPassword")}
                icon={<LockIcon />}
                placeholder={t("auth.confirmPasswordPlaceholder")}
              />
            )}

            <Button
              label={isLoginPage ? t("common.signIn") : t("common.signUp")}
              className="bg-blue-400 text-white"
            />

            <div>
              {SOCIAL_BUTTONS.map(({ label, redirectLink, icon }) => (
                <SocialButton
                  key={label}
                  label={label}
                  redirectLink={redirectLink}
                  icon={icon}
                />
              ))}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
