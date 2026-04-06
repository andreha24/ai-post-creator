const BASIC_URL = "http://localhost:5000/api";

export const endpoints = {
  // auth
  login: `${BASIC_URL}/auth/login`,
  register: `${BASIC_URL}/auth/register`,
  logout: `${BASIC_URL}/auth/logout`,

  // posts
  createPost: `${BASIC_URL}/posts`,
  getPostById: (id: string | number) => `${BASIC_URL}/posts/${id}`,
  getPosts: `${BASIC_URL}/posts`,
  deletePost: (id: string | number) => `${BASIC_URL}/posts/${id}`,

  // user
  getUser: `${BASIC_URL}/user`,
};
