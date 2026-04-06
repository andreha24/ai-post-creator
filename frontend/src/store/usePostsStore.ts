import { getPosts } from "@/api/posts/posts";
import { Post } from "@/types/post/post";
import { createSelectors } from "@/utils/createSelectors";
import { create } from "zustand";

interface PostsState {
    posts: Post[];
    isLoading: boolean;
    isFetched: boolean;
    error: string | null;
    fetchPosts: () => Promise<void>;
}

const usePostsStore = create<PostsState>((set, get) => ({
    posts: [],
    isLoading: false,
    isFetched: false,
    error: null,
  
    fetchPosts: async () => {
        if (get().isFetched) return;
        set({ isLoading: true, error: null });
        try {
          const posts = await getPosts();
          set({ posts, isFetched: true });
        } catch (e) {
          set({ error: "Failed to load posts" });
        } finally {
          set({ isLoading: false });
        }
      },
  }));

export default createSelectors(usePostsStore);
