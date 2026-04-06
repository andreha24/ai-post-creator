export interface Post {
  id: number;
  createAt: string;
  image: string;
  title: string;
  text: string;
  tags: string | null;
  platform: string;
}


export interface CreatePostInput {
  topic: string;
  socialMedia: "instagram" | "facebook" | "twitter";
  size: "small" | "medium" | "large";
  style: string;
  tags?: boolean;
  additionals?: string;
}
