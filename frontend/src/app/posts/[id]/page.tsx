"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostById, deletePost } from "@/api/posts/posts";
import { Post } from "@/types/post/post";
import { CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/Button";
import { notify } from "@/utils/alert";

export default function PostDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!id) {
        setError("Invalid post id");
        return;
      }

      const data = await getPostById(id);
      setPost(data);
    } catch (err) {
      setError(t("post.loadError"));
    } finally {
      setIsLoading(false);
    }
  };


  const removePost = async (id: string | number) => {
    try {
      await deletePost(id);
      notify({
        text: "Post Deleted",
        type: "success",
      });
      router.push('/profile?tab=history');
    } catch (err) {
      notify({
        text: 'Error while deleting post',
        type: "error",
      });
      setError(t("post.deleteError"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[400px]">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          className="flex items-center gap-2 text-blue-600 hover:underline w-fit cursor-pointer"
          onClick={() => router.push('/profile?tab=history')}
        >
          <ArrowBackIcon fontSize="small" />
          {t("common.back")}
        </button>

        <p className="text-red-500">{error || t("post.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        className="flex items-center gap-2 text-blue-600 hover:underline w-fit"
        onClick={() => router.back()}
      >
        <ArrowBackIcon fontSize="small" />
        {t("common.back")}
      </button>

      <div className="flex gap-6">
       <div className="flex flex-col gap-4 border pb-4">
        {post.image && (
          <Image
            src={post.image}
            className="w-full"
            width={600}
            height={600}
            alt={post.title}
          />
        )}

        <div className="px-4 flex flex-col gap-3">
          <h1 className="!text-3xl">{post.title}</h1>

          <div className="flex flex-col gap-2">
            <span className="whitespace-pre-line">{post.text}</span>
            {post.tags && <span className="text-blue-400">{post.tags}</span>}
          </div>
        </div>
      </div>

      <div className="flex w-full gap-5">
        <Button label="Edit post" className="h-fit"/>

        <Button label="Delete post" className="h-fit" onClick={() => removePost(post.id)}/>
      </div>
      </div>
    </div>
  );
}

