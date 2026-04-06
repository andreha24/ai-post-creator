"use client";

import Image from "next/image";
import "./globals.css";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { CircularProgress, Switch } from "@mui/material";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PaletteIcon from "@mui/icons-material/Palette";
import TagIcon from "@mui/icons-material/Tag";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import CachedIcon from "@mui/icons-material/Cached";
import { TextField } from "@/ui/TextField";
import { createPost } from "@/api/posts/posts";
import { useEffect, useState } from "react";
import { Button } from "@/ui/Button";
import { POST_SIZE, SOCIAL_PLATFORM } from "@/constants/constants";
import { CreatePostInput, Post } from "@/types/post/post";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/utils/alert";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const isNewUser = searchParams.get("new_user");

    if (isNewUser) {
      notify({ text: t("home.registeredToast"), type: "success" });
      router.replace("/", { scroll: false });
    }
  }, [searchParams]);

  const [post, setPost] = useState<Post | null>(null);
  const [postSettings, setPostSettings] = useState<CreatePostInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePostInput>({
    defaultValues: {
      tags: false,
    },
  });

  const generatePost = async (data: CreatePostInput) => {
    try {
      setIsLoading(true);
      const res = await createPost(data);

      setPost(res);
    } catch (err) {
      throw new Error();
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CreatePostInput> = async (data) => {
    setPostSettings(data);
    await generatePost(data);
  };

  const regeneratePost = async () => await generatePost(postSettings!);

  return (
    <>
      <h1 className="!text-4xl mb-5">{t("home.title")}</h1>
      <p className="mb-10">{t("home.subtitle")}</p>

      <div className="flex gap-10 justify-between relative">
        {isLoading ? (
          <div className="flex justify-center items-center w-full min-h-[400px]">
            <CircularProgress size={60} />
          </div>
        ) : post ? (
          <div className="max-w-[600px] flex flex-col gap-4">
            <div className="flex w-full flex-col border gap-5 pb-4">
              <Image src={post.image} className="w-full" width={400} height={400} alt="AI image" />
              <h2 className="!text-xl px-4">{post.title}</h2>

              <div className="flex flex-col gap-2 px-4">
                <span className="whitespace-pre-line">{post.text}</span>
                <span className="text-blue-400">{post.tags}</span>
              </div>
            </div>

            <div className="flex gap-5 w-full">
              <Button
                className="hover:bg-grey-200"
                label={t("home.backToSettings")}
                icon={<SettingsIcon color="primary" />}
                onClick={() => setPost(null)}
              />

              <Button
                className="hover:bg-grey-200"
                label={t("home.regeneratePost")}
                icon={<CachedIcon color="primary" />}
                onClick={regeneratePost}
              />
            </div>
          </div>
        ) : (
          <form className="w-[600px] flex flex-col gap-8 pb-4" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              placeholder={t("home.form.topicPlaceholder")}
              icon={<TipsAndUpdatesIcon />}
              label={t("home.form.topicLabel")}
              register={register}
              registerName="topic"
            />

            <TextField
              placeholder={t("home.form.socialMediaPlaceholder")}
              icon={<AutoAwesomeIcon />}
              label={t("home.form.socialMediaLabel")}
              selectList={SOCIAL_PLATFORM}
              defaultValue={SOCIAL_PLATFORM[0].value}
              register={register}
              registerName="socialMedia"
            />

            <TextField
              placeholder={t("home.form.postSizePlaceholder")}
              icon={<TipsAndUpdatesIcon />}
              label={t("home.form.postSizeLabel")}
              selectList={POST_SIZE}
              defaultValue={POST_SIZE[0].value}
              register={register}
              registerName="size"
            />

            <TextField
              placeholder={t("home.form.postStylePlaceholder")}
              icon={<PaletteIcon />}
              label={t("home.form.postStyleLabel")}
              register={register}
              registerName="style"
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <TagIcon color="primary" />

                <div className="flex flex-col gap-1">
                  <span>{t("home.form.includeHashtags")}</span>
                  <span className="!text-sm text-secondary">{t("home.form.includeHashtagsHint")}</span>
                </div>
              </div>

              <Controller
                name="tags"
                control={control}
                render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
              />
            </div>

            <TextField
              placeholder={t("home.form.additionalPlaceholder")}
              icon={<AddIcon />}
              label={t("home.form.additionalLabel")}
              register={register}
              registerName="additionals"
            />

            <Button
              label={t("home.form.generatePost")}
              className="hover:bg-gray-200 transition-colors duration-300"
              type="submit"
              disabled={isLoading}
              icon={<TipsAndUpdatesIcon color="primary" />}
            />
          </form>
        )}

        <div className="h-fit sticky top-26 hidden lg:block min-w-[400px]">
          <Image src="/colorfull-bg.png" width={400} height={400} alt="AI image" />
        </div>
      </div>
    </>
  );
}
