import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";

    if (status === 401 && currentPath !== "/login" && currentPath !== "/sign-up") {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
