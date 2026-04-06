import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { PostHistoryItem } from "./PostHistoryItem";

import { useTranslation } from "react-i18next";
import { Post } from "@/types/post/post";
import usePostsStore from "@/store/usePostsStore";
import { formatDate } from "@/utils/formatDate";

export const PostsHistory = () => {
  const { t } = useTranslation();
  const posts = usePostsStore.use.posts();
  const isLoading = usePostsStore.use.isLoading();
  const error = usePostsStore.use.error();

  const renderHistoryDetail = (count: number, detailTitle: string) => (
    <div className="flex justify-center items-center p-2 flex-col border border-gray-400 w-50 rounded-[8px]">
      <span>{count}</span>
      <span className="text-gray-400 text-sm!">{detailTitle}</span>
    </div>
  );

  const totalPlatforms = useMemo(() => {
    const platforms = new Set<string>();

    posts.forEach((post) => {
      if (post.platform) {
        platforms.add(post.platform);
      }
    });

    return platforms.size;
  }, [posts]);

  return (
    <div className="flex flex-col gap-4 items-center mt-10">
      <h2>{t("profile.postHistoryTitle")}</h2>

      <p className="text-gray-400 text-sm!">{t("profile.postHistorySubtitle")}</p>

      <div className="flex gap-6">
        {renderHistoryDetail(posts.length, t("profile.totalPosts"))}
        {renderHistoryDetail(totalPlatforms, t("profile.platforms"))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center w-full min-h-[200px]">
          <CircularProgress size={40} />
        </div>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : (
        <div className="flex gap-5 flex-wrap justify-center">
          {posts.map((post) => (
            <PostHistoryItem
              key={post.id}
              id={post.id}
              title={post.title}
              desc={post.text}
              createdTime={formatDate(post.createAt)}
              platform={post.platform}
              image={post.image}
            />
          ))}
        </div>
      )}
    </div>
  );
};
